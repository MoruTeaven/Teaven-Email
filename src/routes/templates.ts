// Teaven Email - 模板管理路由
import { Hono } from 'hono';
import { authMiddleware, getAuth } from '../auth';
import { getDB } from '../db';
import { extractVariables, renderTemplate, renderSubject, htmlToText, validateVariables } from '../template_engine';
import { sendEmail, selectAccount } from '../mailer';
import { uuidv7 } from '../uuid';
import type { Template, TemplateVersion, MailLog } from '../types';

const templateRouter = new Hono<{ Bindings: Env }>();

// GET /v1/templates - 获取模板列表
templateRouter.get('/', authMiddleware(['MANAGE_TEMPLATE']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const category = c.req.query('category');
  let templates = await db.getTemplatesByUser(auth.userId);

  if (category) {
    templates = templates.filter(t => t.category === category);
  }

  return c.json({ success: true, data: templates });
});

// GET /v1/templates/:code - 获取模板详情
templateRouter.get('/:code', authMiddleware(['MANAGE_TEMPLATE']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const code = c.req.param('code')!;
  const version = c.req.query('version') ? parseInt(c.req.query('version')!) : undefined;

  const template = await db.getTemplateByCode(auth.userId, code, version);
  if (!template) {
    return c.json({ success: false, error: 'Template not found' }, 404);
  }

  return c.json({ success: true, data: template });
});

// POST /v1/templates - 创建模板
templateRouter.post('/', authMiddleware(['MANAGE_TEMPLATE']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  let body: {
    template_code: string;
    name: string;
    category?: string;
    subject: string;
    html: string;
    text_content?: string;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.template_code || !body.name || !body.subject || !body.html) {
    return c.json({
      success: false,
      error: 'template_code, name, subject, and html are required',
    }, 400);
  }

  // 检查 template_code 唯一性
  const existing = await db.getTemplateByCode(auth.userId, body.template_code);
  if (existing) {
    return c.json({
      success: false,
      error: `Template code '${body.template_code}' already exists. Use a different code or create a new version.`,
    }, 409);
  }

  // 提取变量
  const variables = extractVariables(body.html, body.subject);

  const templateId = uuidv7();
  const template: Omit<Template, 'created_at' | 'updated_at'> = {
    id: templateId,
    user_id: auth.userId,
    template_code: body.template_code,
    name: body.name,
    category: (body.category as Template['category']) || 'SYSTEM',
    version: 1,
    subject: body.subject,
    html: body.html,
    text_content: body.text_content || null,
    variables,
    enabled: 1,
  };

  await db.createTemplate(template);

  // 创建版本记录
  const versionRecord: Omit<TemplateVersion, 'created_at'> = {
    id: uuidv7(),
    template_id: templateId,
    version: 1,
    subject: body.subject,
    html: body.html,
    text_content: body.text_content || null,
    variables,
    changelog: 'Initial version',
  };
  await db.createTemplateVersion(versionRecord);

  return c.json({ success: true, data: { ...template, id: templateId } }, 201);
});

// PUT /v1/templates/:code - 更新模板（创建新版本）
templateRouter.put('/:code', authMiddleware(['MANAGE_TEMPLATE']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const code = c.req.param('code')!;
  let body: {
    name?: string;
    category?: string;
    subject?: string;
    html?: string;
    text_content?: string;
    changelog?: string;
    enabled?: number;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  // 获取当前最新版本
  const currentTemplate = await db.getTemplateByCode(auth.userId, code);
  if (!currentTemplate) {
    return c.json({ success: false, error: 'Template not found' }, 404);
  }

  const newVersion = currentTemplate.version + 1;
  const subject = body.subject || currentTemplate.subject;
  const html = body.html || currentTemplate.html;
  const textContent = body.text_content ?? currentTemplate.text_content;
  const variables = extractVariables(html, subject);

  // 创建新版本模板
  const newTemplateId = uuidv7();
  const newTemplate: Omit<Template, 'created_at' | 'updated_at'> = {
    id: newTemplateId,
    user_id: auth.userId,
    template_code: code,
    name: body.name || currentTemplate.name,
    category: (body.category as Template['category']) || currentTemplate.category,
    version: newVersion,
    subject,
    html,
    text_content: textContent,
    variables,
    enabled: body.enabled ?? currentTemplate.enabled,
  };

  await db.createTemplate(newTemplate);

  // 创建版本记录
  const versionRecord: Omit<TemplateVersion, 'created_at'> = {
    id: uuidv7(),
    template_id: newTemplateId,
    version: newVersion,
    subject,
    html,
    text_content: textContent,
    variables,
    changelog: body.changelog || `Updated to v${newVersion}`,
  };
  await db.createTemplateVersion(versionRecord);

  return c.json({ success: true, data: { ...newTemplate, id: newTemplateId } });
});

// DELETE /v1/templates/:code - 删除模板（所有版本）
templateRouter.delete('/:code', authMiddleware(['MANAGE_TEMPLATE']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const code = c.req.param('code')!;

  // 获取所有版本并删除
  const templates = await db.getTemplatesByUser(auth.userId);
  const toDelete = templates.filter(t => t.template_code === code);

  if (toDelete.length === 0) {
    return c.json({ success: false, error: 'Template not found' }, 404);
  }

  for (const t of toDelete) {
    await db.deleteTemplate(t.id, auth.userId);
  }

  return c.json({ success: true, message: `Template '${code}' deleted` });
});

// POST /v1/templates/:code/preview - 预览模板渲染
templateRouter.post('/:code/preview', authMiddleware(['MANAGE_TEMPLATE']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const code = c.req.param('code')!;
  let body: { variables?: Record<string, string> };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const template = await db.getTemplateByCode(auth.userId, code);
  if (!template) {
    return c.json({ success: false, error: 'Template not found' }, 404);
  }

  const { html, error: renderError } = renderTemplate(template.html, body.variables || {});
  const { subject, error: subjectError } = renderSubject(template.subject, body.variables || {});

  return c.json({
    success: true,
    data: {
      subject,
      html,
      render_errors: [renderError, subjectError].filter(Boolean),
      variables: template.variables,
    },
  });
});

// POST /v1/templates/:code/test-send - 测试发送模板邮件
templateRouter.post('/:code/test-send', authMiddleware(['MANAGE_TEMPLATE', 'SEND_MAIL']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const code = c.req.param('code')!;
  let body: { to: string; variables?: Record<string, string> };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.to)) {
    return c.json({ success: false, error: 'Valid recipient email (to) is required' }, 400);
  }

  const template = await db.getTemplateByCode(auth.userId, code);
  if (!template) {
    return c.json({ success: false, error: 'Template not found' }, 404);
  }

  // 渲染模板
  const templateVars = typeof template.variables === 'string'
    ? JSON.parse(template.variables) as string[]
    : template.variables;

  const variables = body.variables || {};

  // 变量完整性检查（宽松模式：缺失变量用空字符串填充）
  const { missing } = validateVariables(templateVars, variables);
  for (const m of missing) {
    variables[m] = '';
  }

  const { html, error: renderError } = renderTemplate(template.html, variables);
  if (renderError) {
    return c.json({ success: false, error: renderError }, 500);
  }

  const { subject, error: subjectError } = renderSubject(template.subject, variables);
  if (subjectError) {
    return c.json({ success: false, error: subjectError }, 500);
  }

  const textContent = htmlToText(html);
  const category = template.category;

  // 匹配发送通道和账号
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

  if (!providerId) {
    return c.json({ success: false, error: 'No available email provider' }, 500);
  }

  const provider = await db.getProviderById(providerId);
  if (!provider) {
    return c.json({ success: false, error: 'Provider not found' }, 500);
  }

  const fromEmail = selected?.email || 'noreply@teaven.email';
  const fromName = selected?.display_name || null;

  // 直接发送（不走队列，实时反馈）
  const result = await sendEmail(provider, {
    from: fromEmail,
    fromName: fromName || undefined,
    to: body.to,
    subject,
    html,
    text: textContent,
  });

  // 记录到 mail_logs
  const mailLogId = uuidv7();
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
    status: result.success ? 'sent' : 'failed',
    provider_response: result.providerResponse || null,
    error_message: result.error || null,
    retry_count: 0,
  };
  await db.createMailLog(mailLog);

  if (result.success) {
    return c.json({
      success: true,
      data: {
        message: '测试邮件发送成功',
        mail_id: mailLogId,
        message_id: result.messageId,
        to: body.to,
        subject,
      },
    });
  }

  return c.json({
    success: false,
    error: result.error || '发送失败',
    detail: result.providerResponse,
    mail_id: mailLogId,
  });
});

// GET /v1/templates/:code/versions - 获取版本历史
templateRouter.get('/:code/versions', authMiddleware(['MANAGE_TEMPLATE']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const code = c.req.param('code')!;
  const template = await db.getTemplateByCode(auth.userId, code);

  if (!template) {
    return c.json({ success: false, error: 'Template not found' }, 404);
  }

  const versions = await db.getTemplateVersions(template.id);

  return c.json({ success: true, data: versions });
});

export default templateRouter;
