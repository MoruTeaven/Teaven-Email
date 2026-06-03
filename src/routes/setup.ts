// Teaven Email - 初始化路由（首次使用）
// 用于创建第一个管理员用户和 API Key
import { Hono } from 'hono';
import { getDB } from '../db';
import { generateApiKey } from '../auth';
import type { Permission } from '../types';

const setupRouter = new Hono<{ Bindings: Env }>();

// GET /v1/setup/status - 检查是否需要初始化
setupRouter.get('/status', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
    const needsSetup = !result || result.count === 0;
    return c.json({ success: true, data: { needs_setup: needsSetup } });
  } catch {
    // 表不存在 = 需要初始化
    return c.json({ success: true, data: { needs_setup: true } });
  }
});

// POST /v1/setup/init - 初始化第一个管理员账户
setupRouter.post('/init', async (c) => {
  const db = getDB(c.env.DB);

  // 先确保表存在
  await ensureTables(c.env.DB);

  // 检查是否已初始化
  const existing = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
  if (existing && existing.count > 0) {
    return c.json({ success: false, error: 'System already initialized. Use /dashboard to log in.' }, 400);
  }

  let body: {
    name: string;
    email: string;
    password: string;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.name || !body.email || !body.password) {
    return c.json({ success: false, error: 'name, email, and password are required' }, 400);
  }

  if (!isValidEmail(body.email)) {
    return c.json({ success: false, error: 'Invalid email format' }, 400);
  }

  if (body.password.length < 6) {
    return c.json({ success: false, error: 'Password must be at least 6 characters' }, 400);
  }

  // 简单密码哈希 (在 Workers 中可用 Web Crypto)
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(body.password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // 创建用户
  const userId = crypto.randomUUID();
  await db.createUser({
    id: userId,
    name: body.name,
    email: body.email,
    password_hash: passwordHash,
    status: 'active',
    is_super_admin: 1,
  });

  // 生成 API Key
  const { raw, hash, prefix } = await generateApiKey();
  const apiKeyId = crypto.randomUUID();

  const allPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER'];

  await db.createApiKey({
    id: apiKeyId,
    user_id: userId,
    name: 'Admin Key',
    api_key_hash: hash,
    api_key_prefix: prefix,
    permissions: allPermissions,
    enabled: 1,
    last_used_at: null,
  });

  return c.json({
    success: true,
    data: {
      user: {
        id: userId,
        name: body.name,
        email: body.email,
      },
      api_key: {
        id: apiKeyId,
        name: 'Admin Key',
        key: raw,
        prefix,
        permissions: allPermissions,
        message: '⚠️  Store this API key securely. It will not be shown again!',
      },
    },
  }, 201);
});

// POST /v1/setup/login - 账号密码登录，返回 API Key
setupRouter.post('/login', async (c) => {
  const db = getDB(c.env.DB);

  let body: { email: string; password: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.email || !body.password) {
    return c.json({ success: false, error: 'email and password are required' }, 400);
  }

  // 查找用户
  const user = await db.getUserByEmail(body.email);
  if (!user) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  if (user.status !== 'active') {
    return c.json({ success: false, error: 'Account is disabled' }, 403);
  }

  // 验证密码
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(body.password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (passwordHash !== user.password_hash) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  // 获取用户的 API Keys
  const apiKeys = await db.getApiKeysByUser(user.id);
  if (apiKeys.length === 0) {
    return c.json({ success: false, error: 'No API keys found. Contact administrator.' }, 404);
  }

  // 返回第一个启用的 key
  const activeKey = apiKeys.find(k => k.enabled === 1);
  if (!activeKey) {
    return c.json({ success: false, error: 'No active API keys. Contact administrator.' }, 404);
  }

  return c.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      api_keys: apiKeys.map(k => ({
        id: k.id,
        name: k.name,
        prefix: k.api_key_prefix,
        permissions: typeof k.permissions === 'string' ? JSON.parse(k.permissions) : k.permissions,
        enabled: k.enabled,
      })),
    },
  });
});

// POST /v1/setup/key-from-password - 登录后获取新的 API Key
setupRouter.post('/key-from-password', async (c) => {
  let body: { email: string; password: string; name?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.email || !body.password) {
    return c.json({ success: false, error: 'email and password are required' }, 400);
  }

  const db = getDB(c.env.DB);
  const user = await db.getUserByEmail(body.email);
  if (!user || user.status !== 'active') {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  // 验证密码
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(body.password));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (passwordHash !== user.password_hash) {
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  }

  // 生成新的 API Key
  const allPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER'];
  const { raw, hash, prefix } = await generateApiKey();
  const apiKeyId = crypto.randomUUID();

  await db.createApiKey({
    id: apiKeyId,
    user_id: user.id,
    name: body.name || 'Login Key',
    api_key_hash: hash,
    api_key_prefix: prefix,
    permissions: allPermissions,
    enabled: 1,
    last_used_at: null,
  });

  return c.json({
    success: true,
    data: {
      api_key: {
        id: apiKeyId,
        name: body.name || 'Login Key',
        key: raw,
        prefix,
        permissions: allPermissions,
        message: '⚠️ Store this key securely!',
      },
    },
  }, 201);
});

// 确保数据库表存在（首次部署时自动建表）
async function ensureTables(db: D1Database): Promise<void> {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled','deleted')), is_super_admin INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS api_keys (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL, api_key_hash TEXT NOT NULL, api_key_prefix TEXT NOT NULL, permissions TEXT NOT NULL DEFAULT '["SEND_MAIL"]', enabled INTEGER NOT NULL DEFAULT 1, last_used_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS providers (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN ('smtp','api','cloudflare_email')), config TEXT NOT NULL, priority INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, provider_id TEXT NOT NULL REFERENCES providers(id), name TEXT NOT NULL, email TEXT NOT NULL, display_name TEXT, config TEXT, daily_limit INTEGER DEFAULT 1000, sent_today INTEGER DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS templates (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), template_code TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'SYSTEM' CHECK(category IN ('VERIFY','NOTIFY','MARKETING','SYSTEM')), version INTEGER NOT NULL DEFAULT 1, subject TEXT NOT NULL, html TEXT NOT NULL, text_content TEXT, variables TEXT DEFAULT '[]', enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS template_versions (id TEXT PRIMARY KEY, template_id TEXT NOT NULL REFERENCES templates(id), version INTEGER NOT NULL, subject TEXT NOT NULL, html TEXT NOT NULL, text_content TEXT, variables TEXT DEFAULT '[]', changelog TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS category_routes (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), category TEXT NOT NULL, provider_id TEXT NOT NULL REFERENCES providers(id), account_id TEXT, priority INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS mail_logs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), api_key_id TEXT, template_id TEXT, provider_id TEXT, account_id TEXT, category TEXT, to_email TEXT NOT NULL, subject TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','delivered','failed','bounced','spam')), provider_response TEXT, error_message TEXT, retry_count INTEGER DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS mail_queue (id TEXT PRIMARY KEY, mail_log_id TEXT NOT NULL REFERENCES mail_logs(id), user_id TEXT NOT NULL REFERENCES users(id), provider_id TEXT NOT NULL, account_id TEXT, to_email TEXT NOT NULL, subject TEXT NOT NULL, html TEXT NOT NULL, text_content TEXT, category TEXT, priority INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','processing','completed','failed')), scheduled_at TEXT, next_retry_at TEXT, retry_count INTEGER DEFAULT 0, max_retries INTEGER DEFAULT 3, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS daily_stats (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), date TEXT NOT NULL, total_sent INTEGER DEFAULT 0, total_delivered INTEGER DEFAULT 0, total_failed INTEGER DEFAULT 0, total_bounced INTEGER DEFAULT 0, total_spam INTEGER DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS webhooks (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL, url TEXT NOT NULL, events TEXT NOT NULL DEFAULT '["sent","failed","bounced"]', secret TEXT, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_templates_code_version ON templates(user_id, template_code, version)`,
    `CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(api_key_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_mail_queue_status ON mail_queue(status)`,
    `CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date)`,
  ];

  for (const sql of tables) {
    try { await db.prepare(sql).run(); } catch {}
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default setupRouter;
