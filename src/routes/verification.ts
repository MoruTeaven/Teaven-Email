// Teaven Email - 验证码路由
// POST /v1/verification/send  — 生成验证码并通过模板发信
// POST /v1/verification/verify — 验证用户输入的验证码
import { Hono } from 'hono';
import { authMiddleware, getAuth } from '../auth';
import { getDB } from '../db';
import { renderTemplate, renderSubject, validateVariables, htmlToText } from '../template_engine';
import { sendWithRetry, selectAccount } from '../mailer';
import { processQueue } from '../queue_processor';
import { uuidv7 } from '../uuid';
import { isMaintenanceMode, getSetting, getIntSetting } from '../settings';
import type { SendCodeRequest, VerifyCodeRequest, MailLog, MailQueueItem, VerificationCode } from '../types';

const verificationRouter = new Hono<{ Bindings: Env }>();

// POST /v1/verification/send — 生成验证码并通过模板发信
verificationRouter.post('/send', authMiddleware(['SEND_MAIL']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  // 维护模式：开启时拒绝发送验证码
  if (await isMaintenanceMode(c.env.DB)) {
    const message = await getSetting(c.env.DB, 'maintenance_message');
    return c.json({ success: false, error: 'maintenance_mode', message }, 503);
  }

  let body: SendCodeRequest;
  try {
    body = await c.req.json<SendCodeRequest>();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  // 验证必填字段
  if (!body.template || !body.to || !body.scene_type) {
    return c.json({ success: false, error: 'template, to, and scene_type are required' }, 400);
  }

  if (!isValidEmail(body.to)) {
    return c.json({ success: false, error: 'Invalid email address' }, 400);
  }

  // === 发信频率保护 ===
  // 同一用户+邮箱+场景 5 分钟内最多 3 次
  const sendLimitKey = buildRateLimitKey('vc_send', auth.userId, body.to, body.scene_type);
  const sendCount = await getRateLimitCount(c.env.KV, sendLimitKey);
  if (sendCount >= MAX_SEND_PER_EMAIL_SCENE) {
    return c.json({
      success: false,
      error: `Too many requests. Please wait before requesting another code for this scene.`,
    }, 429);
  }
  // 记录本次发送到 KV，TTL=300s，后续请求可通过计数判断是否超限
  await incrementRateLimit(c.env.KV, sendLimitKey, RATE_LIMIT_WINDOW);

  // 获取模板
  const template = await db.getTemplateByCode(auth.userId, body.template);
  if (!template) {
    return c.json({ success: false, error: `Template '${body.template}' not found` }, 404);
  }

  // 解析模板变量
  const templateVars = typeof template.variables === 'string'
    ? JSON.parse(template.variables) as string[]
    : template.variables;

  // 生成验证码（长度与有效期回退到系统设置默认值）
  const defaultCodeLength = await getIntSetting(c.env.DB, 'verification_code_length', 4, 6);
  const defaultTtlMinutes = await getIntSetting(c.env.DB, 'verification_code_ttl_minutes', 1, 10);
  const codeLength = Math.min(Math.max(body.code_length || defaultCodeLength, 4), 10);
  const code = generateNumericCode(codeLength);
  const expireMinutes = Math.min(Math.max(body.expire_minutes || defaultTtlMinutes, 1), 60);

  // 合并用户变量 + 自动注入 code
  const variables = { ...(body.variables || {}), code };

  // 验证模板变量（code 是必须的）
  const { valid, missing } = validateVariables(templateVars, variables);
  if (!valid) {
    return c.json({
      success: false,
      error: `Missing variables: ${missing.join(', ')}`,
    }, 400);
  }

  // 渲染模板
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

  // 按分类匹配发件账号
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

  // 保存验证码到数据库
  const expiresAt = new Date(Date.now() + expireMinutes * 60 * 1000).toISOString();
  const vcId = uuidv7();

  // 先将旧码标记为已使用
  await db.deleteUsedCodes(auth.userId, body.to, body.scene_type);

  const vc: Omit<VerificationCode, 'created_at'> = {
    id: vcId,
    email: body.to,
    code,
    scene_type: body.scene_type,
    user_id: auth.userId,
    expires_at: expiresAt,
    used: 0,
    attempts: 0,
  };
  await db.createVerificationCode(vc);

  // 加入发送队列
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
    status: 'pending',
    provider_response: null,
    error_message: null,
    retry_count: 0,
  };
  await db.createMailLog(mailLog);

  const queueItem: Omit<MailQueueItem, 'created_at'> = {
    id: uuidv7(),
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
    max_retries: await getIntSetting(c.env.DB, 'default_max_retries', 0, 3),
  };
  await db.createQueueItem(queueItem);

  // 即时触发队列处理
  c.executionCtx.waitUntil(processQueue(c.env));

  return c.json({
    success: true,
    data: {
      mail_id: mailLogId,
      queue_id: queueItem.id,
      status: 'queued',
      scene_type: body.scene_type,
      to: body.to,
      expires_in: expireMinutes * 60, // 秒
    },
  });
});

// --- 限流常量 ---
const MAX_ATTEMPTS_PER_CODE = 5;        // 单条验证码最多尝试次数
const RATE_LIMIT_WINDOW = 300;          // 限流窗口 5 分钟（秒）
const MAX_EMAIL_SCENE_ATTEMPTS = 10;    // 单用户+邮箱+场景窗口内最多尝试
const MAX_SEND_PER_EMAIL_SCENE = 3;     // 单用户+邮箱+场景 5 分钟内最多发 3 次
const MIN_RESEND_INTERVAL = 60;         // 同一用户+邮箱+场景最小重发间隔（秒）

// POST /v1/verification/verify — 验证用户输入的验证码
// 防暴力破解保护（不限制 IP，适配后端调用场景）：
//   1. 单条验证码最多尝试 5 次
//   2. 单用户+邮箱+场景 5 分钟内最多 10 次
verificationRouter.post('/verify', authMiddleware(['VERIFY_CODE']), async (c) => {
  const auth = getAuth(c);

  let body: VerifyCodeRequest;
  try {
    body = await c.req.json<VerifyCodeRequest>();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.email || !body.code || !body.scene_type) {
    return c.json({ success: false, error: 'email, code, and scene_type are required' }, 400);
  }

  if (!isValidEmail(body.email)) {
    return c.json({ success: false, error: 'Invalid email address' }, 400);
  }

  // === 第一层：用户+邮箱+场景维度限流 ===
  const emailKey = buildRateLimitKey('vc_verify:email', auth.userId, body.email, body.scene_type);
  const emailCount = await getRateLimitCount(c.env.KV, emailKey);
  if (emailCount >= MAX_EMAIL_SCENE_ATTEMPTS) {
    return c.json({
      success: true,
      data: { valid: false, message: 'Too many attempts for this email. Please try again later.' },
    });
  }
  await incrementRateLimit(c.env.KV, emailKey, RATE_LIMIT_WINDOW);

  // === 第二层：单条验证码尝试次数 ===
  const db = getDB(c.env.DB);
  const record = await db.getLatestCode(auth.userId, body.email, body.scene_type);

  if (!record) {
    return c.json({
      success: true,
      data: { valid: false, message: 'No verification code found. Please request a new one.' },
    });
  }

  // 先检查是否已达尝试上限（不递增，直接拒绝）；上限来自系统设置，默认 5
  const maxAttempts = await getIntSetting(c.env.DB, 'verification_max_attempts', 1, MAX_ATTEMPTS_PER_CODE);
  if (record.attempts >= maxAttempts) {
    await db.markCodeUsed(record.id, auth.userId);
    return c.json({
      success: true,
      data: { valid: false, message: 'Too many attempts. Please request a new verification code.' },
    });
  }

  // 递增尝试次数
  await db.incrementCodeAttempts(record.id, auth.userId);

  // 检查是否过期
  if (new Date(record.expires_at) <= new Date()) {
    await db.markCodeUsed(record.id, auth.userId);
    return c.json({
      success: true,
      data: { valid: false, message: 'Verification code has expired. Please request a new one.' },
    });
  }

  // 比对验证码
  if (record.code !== body.code) {
    return c.json({
      success: true,
      data: { valid: false, message: 'Invalid verification code.' },
    });
  }

  // 验证成功，标记为已使用
  await db.markCodeUsed(record.id, auth.userId);

  // 验证成功后可清除该用户+邮箱+场景的限流计数（给合法用户放行）
  c.executionCtx.waitUntil(c.env.KV.delete(emailKey));

  return c.json({
    success: true,
    data: { valid: true, message: 'Verification successful.' },
  });
});

// --- 工具函数 ---

async function getRateLimitCount(kv: KVNamespace, key: string): Promise<number> {
  try {
    const val = await kv.get(key);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0; // KV 不可用时不阻塞业务
  }
}

async function incrementRateLimit(kv: KVNamespace, key: string, ttlSeconds: number): Promise<void> {
  try {
    const val = await kv.get(key);
    const count = val ? parseInt(val, 10) + 1 : 1;
    await kv.put(key, String(count), { expirationTtl: ttlSeconds });
  } catch {
    // KV 写入失败不阻塞业务
  }
}

function buildRateLimitKey(prefix: string, userId: string, email: string, sceneType: string): string {
  return `${prefix}:${encodeURIComponent(userId)}:${encodeURIComponent(email)}:${encodeURIComponent(sceneType)}`;
}

function generateNumericCode(length: number): string {
  const digits = '0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[array[i] % 10];
  }
  return code;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default verificationRouter;
