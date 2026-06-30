// Teaven Email - 超级管理员路由（用户管理）
import { Hono } from 'hono';
import { superAdminMiddleware, generateApiKey, generateImpersonationToken, encryptApiKey, getAuth } from '../auth';
import { getDB } from '../db';
import { sendEmail } from '../mailer';
import { uuidv7 } from '../uuid';
import { loadSettings, WRITABLE_KEYS, SETTING_DEFAULTS } from '../settings';
import type { MailStatus, Permission, ProviderConfig, ProviderType } from '../types';

const adminRouter = new Hono<{ Bindings: Env }>();

// ========== 用户数据查询 ==========

// GET /v1/admin/tenants - 所有用户
adminRouter.get('/tenants', superAdminMiddleware(), async (c) => {
  const queryWithAutoCreated = `SELECT u.id, u.name, u.email, u.status, u.is_super_admin, u.created_at,
     (SELECT COUNT(*) FROM api_keys WHERE user_id = u.id AND auto_created = 0) as api_key_count,
     (SELECT COUNT(*) FROM templates WHERE user_id = u.id) as template_count,
     (SELECT COUNT(*) FROM mail_logs WHERE user_id = u.id) as mail_count
     FROM users u WHERE u.status != 'deleted' ORDER BY u.created_at DESC`;

  const queryFallback = `SELECT u.id, u.name, u.email, u.status, u.is_super_admin, u.created_at,
     (SELECT COUNT(*) FROM api_keys WHERE user_id = u.id) as api_key_count,
     (SELECT COUNT(*) FROM templates WHERE user_id = u.id) as template_count,
     (SELECT COUNT(*) FROM mail_logs WHERE user_id = u.id) as mail_count
     FROM users u WHERE u.status != 'deleted' ORDER BY u.created_at DESC`;

  try {
    const rows = await c.env.DB.prepare(queryWithAutoCreated).all();
    return c.json({ success: true, data: rows.results });
  } catch (err) {
    // 兼容 migration 005 未应用到生产库的情况（auto_created 列不存在）
    if (err instanceof Error && (err.message.includes('auto_created') || err.message.includes('no such column'))) {
      console.warn('[admin] auto_created column missing, falling back to unfiltered query. Run migration 005.');
      const rows = await c.env.DB.prepare(queryFallback).all();
      return c.json({ success: true, data: rows.results });
    }
    throw err;
  }
});

// GET /v1/admin/tenants/:id - 用户详情
adminRouter.get('/tenants/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id')!;
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);
  return c.json({ success: true, data: user });
});

// PUT /v1/admin/tenants/:id - 更新用户状态
adminRouter.put('/tenants/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id')!;
  let body: { status?: string; is_super_admin?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  if (body.status) {
    await c.env.DB.prepare('UPDATE users SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(body.status, id).run();
  }
  if (body.is_super_admin !== undefined) {
    await c.env.DB.prepare('UPDATE users SET is_super_admin = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(body.is_super_admin, id).run();
  }
  return c.json({ success: true });
});

// POST /v1/admin/tenants - 超管直接新建用户
adminRouter.post('/tenants', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);

  let body: { name: string; email: string; password: string; is_super_admin?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  if (!body.name || !body.email || !body.password) {
    return c.json({ success: false, error: 'name, email, and password are required' }, 400);
  }
  if (!isValidEmail(body.email)) {
    return c.json({ success: false, error: 'Invalid email format' }, 400);
  }
  if (body.password.length < 6) {
    return c.json({ success: false, error: 'Password must be at least 6 characters' }, 400);
  }

  // 检查邮箱是否已存在
  const existing = await db.getUserByEmail(body.email);
  if (existing) {
    return c.json({ success: false, error: 'Email already in use' }, 409);
  }

  // 密码哈希
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(body.password));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // 创建用户
  const userId = uuidv7();
  await db.createUser({
    id: userId,
    name: body.name,
    email: body.email,
    password_hash: passwordHash,
    status: 'active',
    is_super_admin: body.is_super_admin || 0,
  });

  // 自动生成 API Key
  const allPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER', 'VERIFY_CODE'];
  const { raw, hash, prefix } = await generateApiKey();
  const apiKeyId = uuidv7();
  const secret = c.env.JWT_SECRET || '';

  await db.createApiKey({
    id: apiKeyId,
    user_id: userId,
    name: 'Default Key',
    api_key_hash: hash,
    api_key_prefix: prefix,
    api_key_encrypted: secret ? await encryptApiKey(raw, secret) : null,
    permissions: allPermissions,
    enabled: 1,
    auto_created: 0,
    expires_at: null,
    last_used_at: null,
  });

  return c.json({
    success: true,
    data: {
      user: { id: userId, name: body.name, email: body.email, is_super_admin: body.is_super_admin || 0 },
      api_key: { id: apiKeyId, name: 'Default Key', key: raw, prefix, permissions: allPermissions },
    },
  }, 201);
});

// POST /v1/admin/tenants/:id/impersonate - 模拟登录任意用户（返回签名临时令牌，24h有效） 
adminRouter.post('/tenants/:id/impersonate', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id')!;

  const user = await db.getUserById(id);
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  if (user.status !== 'active') {
    return c.json({ success: false, error: 'User is not active' }, 400);
  }

  const secret = c.env.IMPERSONATION_SECRET || '';
  if (!secret) {
    return c.json({ success: false, error: 'Impersonation not configured' }, 500);
  }

  // 生成签名模拟令牌（24小时有效），不再创建永久 API Key
  const token = await generateImpersonationToken(user.id, secret);

  return c.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      impersonation_token: token,
      expires_in: 24 * 60 * 60, // 24 hours in seconds
    },
  }, 200);
});

// ========== 全局发送通道管理 ==========

// GET /v1/admin/providers - 所有全局 Provider
adminRouter.get('/providers', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const rows = await db.getAllProviders();
  return c.json({ success: true, data: rows });
});

// POST /v1/admin/providers - 管理员创建全局 Provider
adminRouter.post('/providers', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);

  let body: { name: string; type: string; config: Record<string, unknown>; priority?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  if (!body.name || !body.type || !body.config) {
    return c.json({ success: false, error: 'name, type, config are required' }, 400);
  }
  if (!['smtp', 'api', 'cloudflare_email'].includes(body.type)) {
    return c.json({ success: false, error: 'type must be smtp, api, or cloudflare_email' }, 400);
  }

  const provider = {
    id: uuidv7(),
    name: body.name,
    type: body.type as ProviderType,
    config: body.config as unknown as ProviderConfig,
    priority: body.priority || 0,
    enabled: 1,
  };

  await db.createProvider(provider);
  return c.json({ success: true, data: provider }, 201);
});

// PUT /v1/admin/providers/:id - 管理员更新 Provider
adminRouter.put('/providers/:id', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id')!;

  const existing = await db.getProviderById(id);
  if (!existing) return c.json({ success: false, error: 'Provider not found' }, 404);

  let body: { name?: string; type?: ProviderType; config?: ProviderConfig; priority?: number; enabled?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  await db.updateProvider(id, body);
  return c.json({ success: true, message: 'Provider updated' });
});

// DELETE /v1/admin/providers/:id - 管理员删除 Provider
adminRouter.delete('/providers/:id', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id')!;
  await db.deleteProvider(id);
  return c.json({ success: true, message: 'Provider deleted' });
});

// ========== 发件账号管理 ==========

// GET /v1/admin/accounts - 所有全局发件账号（含通道名称）
adminRouter.get('/accounts', superAdminMiddleware(), async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT a.*, p.name as provider_name, p.type as provider_type,
       (SELECT COUNT(*) FROM mail_logs ml
        WHERE ml.account_id = a.id
          AND ml.status IN ('sent','delivered')
          AND date(ml.created_at) = date('now')) as sent_today
     FROM accounts a LEFT JOIN providers p ON a.provider_id = p.id
     ORDER BY a.created_at DESC`
  ).all();
  return c.json({ success: true, data: rows.results });
});

// POST /v1/admin/accounts - 管理员创建全局发件账号
adminRouter.post('/accounts', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);

  let body: { provider_id: string; name: string; email: string; display_name?: string; daily_limit?: number; categories?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  if (!body.provider_id || !body.name || !body.email) {
    return c.json({ success: false, error: 'provider_id, name, email are required' }, 400);
  }

  // 校验 categories 值（逗号分隔的合法分类）
  if (body.categories) {
    const parts = body.categories.split(',').map(s => s.trim()).filter(Boolean);
    const validCategories = ['VERIFY', 'NOTIFY', 'MARKETING', 'SYSTEM'];
    for (const p of parts) {
      if (!validCategories.includes(p)) {
        return c.json({ success: false, error: `Invalid category: ${p}. Valid: ${validCategories.join(', ')}` }, 400);
      }
    }
    body.categories = parts.join(','); // 规范化
  }

  // 验证 provider 存在
  const provider = await db.getProviderById(body.provider_id);
  if (!provider) {
    return c.json({ success: false, error: 'Provider not found' }, 404);
  }

  const account = {
    id: uuidv7(),
    provider_id: body.provider_id,
    name: body.name,
    email: body.email,
    display_name: body.display_name || null,
    config: null,
    daily_limit: body.daily_limit || 1000,
    sent_today: 0,
    categories: body.categories || '',
    enabled: 1,
  };

  await db.createAccount(account);

  return c.json({ success: true, data: account }, 201);
});

// DELETE /v1/admin/accounts/:id - 管理员删除任意账号
adminRouter.delete('/accounts/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id')!;
  await c.env.DB.prepare('DELETE FROM accounts WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// PUT /v1/admin/accounts/:id - 管理员更新任意账号
adminRouter.put('/accounts/:id', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id')!;

  // 验证账号存在
  const existing = await db.getAccountById(id);
  if (!existing) return c.json({ success: false, error: 'Account not found' }, 404);

  let body: { enabled?: number; daily_limit?: number; display_name?: string; name?: string; email?: string; provider_id?: string; categories?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  // 校验 categories 值
  if (body.categories !== undefined) {
    const parts = body.categories.split(',').map(s => s.trim()).filter(Boolean);
    const validCategories = ['VERIFY', 'NOTIFY', 'MARKETING', 'SYSTEM'];
    for (const p of parts) {
      if (!validCategories.includes(p)) {
        return c.json({ success: false, error: `Invalid category: ${p}. Valid: ${validCategories.join(', ')}` }, 400);
      }
    }
    body.categories = parts.join(',');
  }

  // 如果修改 provider_id，验证新通道存在
  if (body.provider_id) {
    const provider = await db.getProviderById(body.provider_id);
    if (!provider) return c.json({ success: false, error: 'Provider not found' }, 404);
  }

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.enabled !== undefined) { sets.push('enabled = ?'); vals.push(body.enabled); }
  if (body.daily_limit !== undefined) { sets.push('daily_limit = ?'); vals.push(body.daily_limit); }
  if (body.display_name !== undefined) { sets.push('display_name = ?'); vals.push(body.display_name); }
  if (body.name !== undefined) { sets.push('name = ?'); vals.push(body.name); }
  if (body.email !== undefined) { sets.push('email = ?'); vals.push(body.email); }
  if (body.provider_id !== undefined) { sets.push('provider_id = ?'); vals.push(body.provider_id); }
  if (body.categories !== undefined) { sets.push('categories = ?'); vals.push(body.categories); }
  if (sets.length === 0) return c.json({ success: false, error: 'Nothing to update' }, 400);

  sets.push("updated_at = datetime('now')");
  vals.push(id);
  await c.env.DB.prepare(`UPDATE accounts SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  return c.json({ success: true });
});

// ========== 跨租户统计 ==========

// GET /v1/admin/logs - 全局发送日志
adminRouter.get('/logs', superAdminMiddleware(), async (c) => {
  const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '50', 10) || 50, 1), 200);
  const offset = Math.max(parseInt(c.req.query('offset') || '0', 10) || 0, 0);
  const status = c.req.query('status') || '';
  const category = c.req.query('category') || '';
  const userId = c.req.query('user_id') || '';
  const providerId = c.req.query('provider_id') || '';
  const accountId = c.req.query('account_id') || '';
  const startDate = c.req.query('start_date') || '';
  const endDate = c.req.query('end_date') || '';
  const q = (c.req.query('q') || '').trim();

  const where: string[] = [];
  const values: (string | number)[] = [];
  const validStatuses: MailStatus[] = ['pending', 'sent', 'delivered', 'failed', 'bounced', 'spam'];
  const validCategories = ['VERIFY', 'NOTIFY', 'MARKETING', 'SYSTEM'];

  if (status) {
    if (!validStatuses.includes(status as MailStatus)) {
      return c.json({ success: false, error: 'Invalid status' }, 400);
    }
    where.push('ml.status = ?');
    values.push(status);
  }
  if (category) {
    if (!validCategories.includes(category)) {
      return c.json({ success: false, error: 'Invalid category' }, 400);
    }
    where.push('ml.category = ?');
    values.push(category);
  }
  if (userId) {
    where.push('ml.user_id = ?');
    values.push(userId);
  }
  if (providerId) {
    where.push('ml.provider_id = ?');
    values.push(providerId);
  }
  if (accountId) {
    where.push('ml.account_id = ?');
    values.push(accountId);
  }
  if (startDate) {
    where.push('date(ml.created_at) >= ?');
    values.push(startDate);
  }
  if (endDate) {
    where.push('date(ml.created_at) <= ?');
    values.push(endDate);
  }
  if (q) {
    where.push('(ml.to_email LIKE ? OR ml.subject LIKE ? OR u.email LIKE ? OR u.name LIKE ? OR a.email LIKE ?)');
    const keyword = `%${q}%`;
    values.push(keyword, keyword, keyword, keyword, keyword);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const fromSql = `FROM mail_logs ml
     LEFT JOIN users u ON u.id = ml.user_id
     LEFT JOIN api_keys ak ON ak.id = ml.api_key_id
     LEFT JOIN providers p ON p.id = ml.provider_id
     LEFT JOIN accounts a ON a.id = ml.account_id
     LEFT JOIN templates t ON t.id = ml.template_id`;

  const countStmt = c.env.DB.prepare(`SELECT COUNT(*) as total ${fromSql} ${whereSql}`);
  const countPromise = values.length > 0
    ? countStmt.bind(...values).first<{ total: number }>()
    : countStmt.first<{ total: number }>();

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(
      `SELECT ml.*, u.name as user_name, u.email as user_email,
        ak.name as api_key_name, ak.api_key_prefix,
        p.name as provider_name, p.type as provider_type,
        a.name as account_name, a.email as account_email,
        t.template_code, t.name as template_name
       ${fromSql}
       ${whereSql}
       ORDER BY ml.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(...values, limit, offset).all(),
    countPromise,
  ]);

  return c.json({
    success: true,
    data: rows.results,
    meta: { total: countRow?.total || 0, limit, offset },
  });
});

// GET /v1/admin/logs/:id - 全局发送日志详情
adminRouter.get('/logs/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id')!;
  const row = await c.env.DB.prepare(
    `SELECT ml.*, u.name as user_name, u.email as user_email,
      ak.name as api_key_name, ak.api_key_prefix,
      p.name as provider_name, p.type as provider_type,
      a.name as account_name, a.email as account_email,
      t.template_code, t.name as template_name
     FROM mail_logs ml
     LEFT JOIN users u ON u.id = ml.user_id
     LEFT JOIN api_keys ak ON ak.id = ml.api_key_id
     LEFT JOIN providers p ON p.id = ml.provider_id
     LEFT JOIN accounts a ON a.id = ml.account_id
     LEFT JOIN templates t ON t.id = ml.template_id
     WHERE ml.id = ?`
  ).bind(id).first();

  if (!row) return c.json({ success: false, error: 'Mail log not found' }, 404);
  return c.json({ success: true, data: row });
});

// POST /v1/admin/accounts/:id/test - 发送测试邮件验证账号配置
adminRouter.post('/accounts/:id/test', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const auth = getAuth(c);
  const id = c.req.param('id')!;

  const account = await db.getAccountById(id);
  if (!account) {
    return c.json({ success: false, error: 'Account not found' }, 404);
  }

  const provider = await db.getProviderById(account.provider_id);
  if (!provider) {
    return c.json({ success: false, error: 'Associated provider not found' }, 404);
  }

  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  const toEmail = body.to || account.email;

  const result = await sendEmail(provider, {
    from: account.email,
    fromName: account.display_name || undefined,
    to: toEmail,
    subject: '[Teaven Email] 测试邮件 - 账号配置验证',
    html: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'PingFang SC\', \'Microsoft YaHei\', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">' +
  '<div style="text-align: center; margin-bottom: 32px;">' +
    '<div style="display: inline-block; width: 48px; height: 48px; background: #f97316; border-radius: 12px; text-align: center; line-height: 48px; font-size: 24px; font-weight: bold; color: white; margin-bottom: 16px;">T</div>' +
    '<h2 style="margin: 0; font-size: 20px; color: #1f2937;">Teaven Email 测试邮件</h2>' +
    '<p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">这是一封自动发送的测试邮件，用于验证发件账号配置是否正确。</p>' +
  '</div>' +
  '<table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">' +
    '<tr><td style="padding: 10px 16px; background: #f9fafb; font-weight: 600; font-size: 13px; color: #4b5563; width: 100px;">账号名称</td><td style="padding: 10px 16px; font-size: 14px; color: #1f2937;">' + escapeHtml(account.name) + '</td></tr>' +
    '<tr><td style="padding: 10px 16px; background: #f9fafb; font-weight: 600; font-size: 13px; color: #4b5563;">发件邮箱</td><td style="padding: 10px 16px; font-size: 14px; color: #1f2937;">' + escapeHtml(account.email) + '</td></tr>' +
    '<tr><td style="padding: 10px 16px; background: #f9fafb; font-weight: 600; font-size: 13px; color: #4b5563;">发送通道</td><td style="padding: 10px 16px; font-size: 14px; color: #1f2937;">' + escapeHtml(provider.name) + ' (' + escapeHtml(provider.type) + ')</td></tr>' +
    '<tr><td style="padding: 10px 16px; background: #f9fafb; font-weight: 600; font-size: 13px; color: #4b5563;">发送时间</td><td style="padding: 10px 16px; font-size: 14px; color: #1f2937;">' + new Date().toISOString() + '</td></tr>' +
  '</table>' +
  '<div style="margin-top: 24px; padding: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">' +
    '<p style="margin: 0; font-size: 14px; color: #059669;">如果你收到了这封邮件，说明发件账号 <strong>' + escapeHtml(account.name) + '</strong> 配置正确，可以正常使用。</p>' +
  '</div>' +
'</div>',
  });

  await db.createMailLog({
    id: uuidv7(),
    user_id: auth.userId,
    api_key_id: auth.apiKeyId,
    template_id: null,
    provider_id: provider.id,
    account_id: account.id,
    category: 'SYSTEM',
    to_email: toEmail,
    subject: '[Teaven Email] 测试邮件 - 账号配置验证',
    status: result.success ? 'sent' : 'failed',
    provider_response: result.providerResponse || null,
    error_message: result.error || null,
    retry_count: 0,
  });

  if (result.success) {
    return c.json({ success: true, message: '测试邮件发送成功', messageId: result.messageId });
  }
  return c.json({ success: false, error: result.error || '发送失败', detail: result.providerResponse });
});

// ========== 全局统计 ==========

// GET /v1/admin/stats - 全局统计
adminRouter.get('/stats', superAdminMiddleware(), async (c) => {
  const [userCount, providerCount, accountCount, templateCount, mailCount] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE status != 'deleted'").first<{ c: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM providers').first<{ c: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM accounts').first<{ c: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM templates').first<{ c: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM mail_logs').first<{ c: number }>(),
  ]);

  const today = new Date().toISOString().split('T')[0];
  const todayMails = await c.env.DB.prepare(
    "SELECT status, COUNT(*) as c FROM mail_logs WHERE date(created_at) = ? GROUP BY status"
  ).bind(today).all<{ status: string; c: number }>();

  const todayStats: Record<string, number> = {};
  for (const row of todayMails.results) { todayStats[row.status] = row.c; }

  return c.json({
    success: true,
    data: {
      users: userCount?.c || 0,
      providers: providerCount?.c || 0,
      accounts: accountCount?.c || 0,
      templates: templateCount?.c || 0,
      total_mails: mailCount?.c || 0,
      today_sent: todayStats.sent || 0,
      today_failed: todayStats.failed || 0,
    },
  });
});

// ========== 系统设置 ==========

// 整型设置项及其取值约束
const INT_SETTING_BOUNDS: Record<string, { min: number; max: number }> = {
  default_max_retries: { min: 0, max: 10 },
  default_daily_limit_per_user: { min: 0, max: 1000000 },
  verification_code_ttl_minutes: { min: 1, max: 60 },
  verification_code_length: { min: 4, max: 10 },
  verification_max_attempts: { min: 1, max: 20 },
  auto_api_key_ttl_hours: { min: 1, max: 168 },
};

// GET /v1/admin/settings - 返回全部系统设置（按 category 分组）
adminRouter.get('/settings', superAdminMiddleware(), async (c) => {
  const db = c.env.DB;
  let rows: { key: string; value: string; category: string; description: string | null; updated_at: string; updated_by: string | null }[] = [];

  try {
    const result = await db.prepare(
      'SELECT key, value, category, description, updated_at, updated_by FROM system_settings ORDER BY category, key'
    ).all();
    rows = result.results as typeof rows;
  } catch (err) {
    // migration 009 未应用时表不存在，回退到默认值
    if (err instanceof Error && (err.message.includes('no such table') || err.message.includes('system_settings'))) {
      console.warn('[admin] system_settings table missing, returning defaults. Run migration 009.');
    } else {
      throw err;
    }
  }

  // 合并默认值，确保所有已知 key 都返回
  const byKey = new Map<string, typeof rows[number]>();
  for (const r of rows) byKey.set(r.key, r);
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    if (!byKey.has(key)) {
      byKey.set(key, { key, value, category: categoryOf(key), description: null, updated_at: '', updated_by: null });
    }
  }

  // 按 category 分组输出
  const grouped: Record<string, Array<{ key: string; value: string; description: string | null; updated_at: string; updated_by: string | null }>> = {};
  for (const r of byKey.values()) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push({ key: r.key, value: r.value, description: r.description, updated_at: r.updated_at, updated_by: r.updated_by });
  }

  return c.json({ success: true, data: grouped });
});

// PUT /v1/admin/settings - 批量更新系统设置
adminRouter.put('/settings', superAdminMiddleware(), async (c) => {
  const auth = getAuth(c);
  let body: Record<string, string>;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return c.json({ success: false, error: 'Body must be an object of { key: value }' }, 400);
  }

  const updates: { key: string; value: string }[] = [];
  for (const [key, rawValue] of Object.entries(body)) {
    if (!WRITABLE_KEYS.has(key)) {
      return c.json({ success: false, error: `Unknown setting key: ${key}` }, 400);
    }
    let value = String(rawValue ?? '');

    // 整型设置项校验与夹取
    const bounds = INT_SETTING_BOUNDS[key];
    if (bounds) {
      const n = parseInt(value, 10);
      if (Number.isNaN(n)) {
        return c.json({ success: false, error: `Setting '${key}' must be an integer` }, 400);
      }
      value = String(Math.min(Math.max(n, bounds.min), bounds.max));
    }

    // 布尔类设置项归一化为 0/1
    if (key === 'maintenance_mode') {
      value = (value === '1' || value === 'true') ? '1' : '0';
    }

    // 邮箱类设置项校验
    if (key === 'admin_contact_email' && value && !isValidEmail(value)) {
      return c.json({ success: false, error: 'admin_contact_email 格式不合法' }, 400);
    }

    updates.push({ key, value });
  }

  if (updates.length === 0) {
    return c.json({ success: false, error: 'Nothing to update' }, 400);
  }

  try {
    for (const u of updates) {
      await c.env.DB.prepare(
        `INSERT INTO system_settings (key, value, category, description, updated_at, updated_by)
         VALUES (?, ?, ?, ?, datetime('now'), ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now'), updated_by = excluded.updated_by`
      ).bind(u.key, u.value, categoryOf(u.key), descriptionOf(u.key), auth.userId).run();
    }
  } catch (err) {
    if (err instanceof Error && (err.message.includes('no such table') || err.message.includes('system_settings'))) {
      return c.json({ success: false, error: 'system_settings 表不存在，请先执行 migration 009' }, 500);
    }
    throw err;
  }

  return c.json({ success: true, message: '设置已保存', data: { updated: updates.length } });
});

// 设置 key -> category 映射（与 migration 009 / SETTING_DEFAULTS 对齐）
function categoryOf(key: string): string {
  if (['platform_name', 'admin_contact_email', 'announcement'].includes(key)) return 'platform';
  if (['default_max_retries', 'default_daily_limit_per_user'].includes(key)) return 'mail';
  if (['verification_code_ttl_minutes', 'verification_code_length', 'verification_max_attempts'].includes(key)) return 'verification';
  if (['maintenance_mode', 'maintenance_message', 'auto_api_key_ttl_hours'].includes(key)) return 'security';
  return 'general';
}

function descriptionOf(key: string): string {
  const map: Record<string, string> = {
    platform_name: '平台名称，展示在后台与邮件中',
    admin_contact_email: '管理员联系邮箱',
    announcement: '系统公告，展示给用户（留空则不展示）',
    default_max_retries: '单封邮件默认最大重试次数',
    default_daily_limit_per_user: '单用户每日发送上限（0 表示不限制）',
    verification_code_ttl_minutes: '验证码默认有效期（分钟）',
    verification_code_length: '验证码默认长度（4-10 位）',
    verification_max_attempts: '单条验证码最大验证尝试次数',
    maintenance_mode: '维护模式开关（1=开启，开启后禁止发信）',
    maintenance_message: '维护模式开启时返回给用户的提示信息',
    auto_api_key_ttl_hours: '登录自动创建的 API Key 有效期（小时）',
  };
  return map[key] || '';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default adminRouter;
