// Teaven Email - 邮件发送路由
import { Hono } from 'hono';
import { authMiddleware, getAuth } from '../auth';
import { getDB } from '../db';
import { renderTemplate, renderSubject, validateVariables, htmlToText } from '../template_engine';
import { sendWithRetry, selectAccount } from '../mailer';
import type { SendTemplateRequest, SendMailRequest, MailLog, MailQueueItem } from '../types';

const mailRouter = new Hono<{ Bindings: Env }>();

// POST /v1/mail/send-template - 模板发送
mailRouter.post('/send-template', authMiddleware(['SEND_MAIL']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  let body: SendTemplateRequest;
  try {
    body = await c.req.json<SendTemplateRequest>();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  // 验证必填字段
  if (!body.template || !body.to) {
    return c.json({ success: false, error: 'template and to are required' }, 400);
  }

  // 验证 email
  if (!isValidEmail(body.to)) {
    return c.json({ success: false, error: 'Invalid email address' }, 400);
  }

  // 获取模板
  const template = await db.getTemplateByCode(auth.userId, body.template, body.version);
  if (!template) {
    return c.json({ success: false, error: `Template '${body.template}' not found` }, 404);
  }

  // 解析变量
  const templateVars = typeof template.variables === 'string'
    ? JSON.parse(template.variables) as string[]
    : template.variables;

  // 验证变量
  const { valid, missing } = validateVariables(templateVars, body.variables || {});
  if (!valid) {
    return c.json({
      success: false,
      error: `Missing variables: ${missing.join(', ')}`,
    }, 400);
  }

  // 渲染模板
  const { html, error: renderError } = renderTemplate(template.html, body.variables);
  if (renderError) {
    return c.json({ success: false, error: renderError }, 500);
  }

  const { subject, error: subjectError } = renderSubject(template.subject, body.variables);
  if (subjectError) {
    return c.json({ success: false, error: subjectError }, 500);
  }

  // 生成 text 版本
  const textContent = htmlToText(html);

  // 确定分类
  const category = body.category || template.category;

  // 按分类从 accounts 表匹配（全局共享，无用户限制）
  // 账号的 categories 字段为逗号分隔的分类列表
  const matchingAccounts = await db.getAccountsByCategory(category);
  let selected = matchingAccounts.length > 0 ? selectAccount(matchingAccounts) : null;

  // 如果按分类没找到，回退到第一个启用的全局 Provider + 负载均衡
  let providerId: string | null = selected?.provider_id || null;
  let accountId: string | null = selected?.id || null;

  if (!providerId) {
    const providers = await db.getEnabledProviders();
    if (providers.length === 0) {
      return c.json({ success: false, error: 'No enabled email provider found' }, 500);
    }
    providerId = providers[0].id;
    // 用通用 Provider 再做一次负载均衡
    const fallbackAccounts = await db.getEnabledAccountsByProvider(providerId);
    selected = selectAccount(fallbackAccounts);
    if (selected) {
      accountId = selected.id;
    }
  }

  // 查找发件账号
  let fromEmail = selected?.email || 'noreply@teaven.email';
  let fromName: string | null = selected?.display_name || null;

  // 创建邮件日志
  const mailLogId = crypto.randomUUID();
  const mailLog: Omit<MailLog, 'created_at'> = {
    id: mailLogId,
    user_id: auth.userId,
    api_key_id: auth.apiKeyId,
    template_id: template.id,
    provider_id: providerId,
    account_id: accountId,
    category,
    to_email: body.to,
    subject,
    status: 'pending',
    provider_response: null,
    error_message: null,
    retry_count: 0,
  };
  await db.createMailLog(mailLog);

  // 加入发送队列
  const queueItem: Omit<MailQueueItem, 'created_at'> = {
    id: crypto.randomUUID(),
    mail_log_id: mailLogId,
    user_id: auth.userId,
    provider_id: providerId,
    account_id: accountId,
    to_email: body.to,
    subject,
    html,
    text_content: textContent,
    category,
    priority: 0,
    status: 'queued',
    scheduled_at: null,
    next_retry_at: null,
    retry_count: 0,
    max_retries: 3,
  };
  await db.createQueueItem(queueItem);

  return c.json({
    success: true,
    data: {
      mail_id: mailLogId,
      queue_id: queueItem.id,
      status: 'queued',
      template: body.template,
      to: body.to,
    },
  });
});

// POST /v1/mail/send - 普通发送
mailRouter.post('/send', authMiddleware(['SEND_MAIL']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  let body: SendMailRequest;
  try {
    body = await c.req.json<SendMailRequest>();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.to || !body.subject) {
    return c.json({ success: false, error: 'to and subject are required' }, 400);
  }

  if (!body.html && !body.text) {
    return c.json({ success: false, error: 'html or text is required' }, 400);
  }

  if (!isValidEmail(body.to)) {
    return c.json({ success: false, error: 'Invalid email address' }, 400);
  }

  const category = body.category || 'SYSTEM';
  const html = body.html || body.text || '';
  const textContent = body.text || htmlToText(html);

  // 按分类从 accounts 表匹配（全局共享，无用户限制）
  const matchingAccounts = await db.getAccountsByCategory(category);
  let selected = matchingAccounts.length > 0 ? selectAccount(matchingAccounts) : null;

  let providerId: string | null = selected?.provider_id || null;
  let accountId: string | null = selected?.id || null;

  if (!providerId) {
    const providers = await db.getEnabledProviders();
    if (providers.length === 0) {
      return c.json({ success: false, error: 'No enabled email provider found' }, 500);
    }
    providerId = providers[0].id;
    const fallbackAccounts = await db.getEnabledAccountsByProvider(providerId);
    selected = selectAccount(fallbackAccounts);
    if (selected) {
      accountId = selected.id;
    }
  }

  let fromEmail = selected?.email || 'noreply@teaven.email';
  let fromName: string | null = selected?.display_name || null;

  const mailLogId = crypto.randomUUID();
  const mailLog: Omit<MailLog, 'created_at'> = {
    id: mailLogId,
    user_id: auth.userId,
    api_key_id: auth.apiKeyId,
    template_id: null,
    provider_id: providerId,
    account_id: accountId,
    category,
    to_email: body.to,
    subject: body.subject,
    status: 'pending',
    provider_response: null,
    error_message: null,
    retry_count: 0,
  };
  await db.createMailLog(mailLog);

  const queueItem: Omit<MailQueueItem, 'created_at'> = {
    id: crypto.randomUUID(),
    mail_log_id: mailLogId,
    user_id: auth.userId,
    provider_id: providerId,
    account_id: accountId,
    to_email: body.to,
    subject: body.subject,
    html,
    text_content: textContent,
    category,
    priority: 0,
    status: 'queued',
    scheduled_at: null,
    next_retry_at: null,
    retry_count: 0,
    max_retries: 3,
  };
  await db.createQueueItem(queueItem);

  return c.json({
    success: true,
    data: {
      mail_id: mailLogId,
      queue_id: queueItem.id,
      status: 'queued',
      to: body.to,
    },
  });
});

// GET /v1/mail/logs - 获取发送日志
mailRouter.get('/logs', authMiddleware(['READ_LOG']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 200);
  const offset = parseInt(c.req.query('offset') || '0');

  const logs = await db.getMailLogs(auth.userId, limit, offset);

  return c.json({ success: true, data: logs });
});

// GET /v1/mail/logs/:id - 获取单条日志
mailRouter.get('/logs/:id', authMiddleware(['READ_LOG']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const id = c.req.param('id');
  const logs = await db.getMailLogs(auth.userId, 200, 0);
  const log = logs.find(l => l.id === id);

  if (!log) {
    return c.json({ success: false, error: 'Mail log not found' }, 404);
  }

  return c.json({ success: true, data: log });
});

// GET /v1/mail/stats - 获取发送统计
mailRouter.get('/stats', authMiddleware(['READ_LOG']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const days = Math.min(parseInt(c.req.query('days') || '30'), 365);
  const stats = await db.getDailyStats(auth.userId, days);

  return c.json({ success: true, data: stats });
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default mailRouter;
