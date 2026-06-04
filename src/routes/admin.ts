// Teaven Email - 超级管理员路由（跨租户管理）
import { Hono } from 'hono';
import { superAdminMiddleware, generateApiKey } from '../auth';
import { getDB } from '../db';
import { sendEmail } from '../mailer';
import type { Permission } from '../types';

const adminRouter = new Hono<{ Bindings: Env }>();

// ========== 跨租户数据查询 ==========

// GET /v1/admin/tenants - 所有租户
adminRouter.get('/tenants', superAdminMiddleware(), async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT u.id, u.name, u.email, u.status, u.is_super_admin, u.created_at,
     (SELECT COUNT(*) FROM api_keys WHERE user_id = u.id) as api_key_count,
     (SELECT COUNT(*) FROM templates WHERE user_id = u.id) as template_count,
     (SELECT COUNT(*) FROM mail_logs WHERE user_id = u.id) as mail_count
     FROM users u WHERE u.status != 'deleted' ORDER BY u.created_at DESC`
  ).all();
  return c.json({ success: true, data: rows.results });
});

// GET /v1/admin/tenants/:id - 租户详情
adminRouter.get('/tenants/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id');
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  if (!user) return c.json({ success: false, error: 'Tenant not found' }, 404);
  return c.json({ success: true, data: user });
});

// PUT /v1/admin/tenants/:id - 更新租户状态
adminRouter.put('/tenants/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id');
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

// POST /v1/admin/tenants - 超管直接新建租户
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
  const userId = crypto.randomUUID();
  await db.createUser({
    id: userId,
    name: body.name,
    email: body.email,
    password_hash: passwordHash,
    status: 'active',
    is_super_admin: body.is_super_admin || 0,
  });

  // 自动生成 API Key
  const allPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER'];
  const { raw, hash, prefix } = await generateApiKey();
  const apiKeyId = crypto.randomUUID();

  await db.createApiKey({
    id: apiKeyId,
    user_id: userId,
    name: 'Default Key',
    api_key_hash: hash,
    api_key_prefix: prefix,
    permissions: allPermissions,
    enabled: 1,
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

// POST /v1/admin/tenants/:id/impersonate - 模拟登录任意租户（为其生成 API Key）
adminRouter.post('/tenants/:id/impersonate', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id');

  const user = await db.getUserById(id);
  if (!user) {
    return c.json({ success: false, error: 'Tenant not found' }, 404);
  }
  if (user.status !== 'active') {
    return c.json({ success: false, error: 'Tenant is not active' }, 400);
  }

  const allPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER'];
  const { raw, hash, prefix } = await generateApiKey();
  const apiKeyId = crypto.randomUUID();

  await db.createApiKey({
    id: apiKeyId,
    user_id: user.id,
    name: 'Admin Impersonation',
    api_key_hash: hash,
    api_key_prefix: prefix,
    permissions: allPermissions,
    enabled: 1,
    last_used_at: null,
  });

  return c.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      api_key: { id: apiKeyId, name: 'Admin Impersonation', key: raw, prefix, permissions: allPermissions },
    },
  }, 201);
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
    id: crypto.randomUUID(),
    name: body.name,
    type: body.type as 'smtp' | 'api' | 'cloudflare_email',
    config: body.config as Record<string, unknown>,
    priority: body.priority || 0,
    enabled: 1,
  };

  await db.createProvider(provider);
  return c.json({ success: true, data: provider }, 201);
});

// PUT /v1/admin/providers/:id - 管理员更新 Provider
adminRouter.put('/providers/:id', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id');

  const existing = await db.getProviderById(id);
  if (!existing) return c.json({ success: false, error: 'Provider not found' }, 404);

  let body: { name?: string; type?: string; config?: Record<string, unknown>; priority?: number; enabled?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  await db.updateProvider(id, body);
  return c.json({ success: true, message: 'Provider updated' });
});

// DELETE /v1/admin/providers/:id - 管理员删除 Provider
adminRouter.delete('/providers/:id', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id');
  await db.deleteProvider(id);
  return c.json({ success: true, message: 'Provider deleted' });
});

// ========== 跨租户发件账号管理 ==========

// GET /v1/admin/accounts - 所有全局发件账号（含通道名称）
adminRouter.get('/accounts', superAdminMiddleware(), async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT a.*, p.name as provider_name, p.type as provider_type
     FROM accounts a LEFT JOIN providers p ON a.provider_id = p.id
     ORDER BY a.created_at DESC`
  ).all();
  return c.json({ success: true, data: rows.results });
});

// POST /v1/admin/accounts - 管理员创建全局发件账号
adminRouter.post('/accounts', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);

  let body: { provider_id: string; name: string; email: string; display_name?: string; daily_limit?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  if (!body.provider_id || !body.name || !body.email) {
    return c.json({ success: false, error: 'provider_id, name, email are required' }, 400);
  }

  // 验证 provider 存在
  const provider = await db.getProviderById(body.provider_id);
  if (!provider) {
    return c.json({ success: false, error: 'Provider not found' }, 404);
  }

  const account = {
    id: crypto.randomUUID(),
    provider_id: body.provider_id,
    name: body.name,
    email: body.email,
    display_name: body.display_name || null,
    config: null,
    daily_limit: body.daily_limit || 1000,
    sent_today: 0,
    enabled: 1,
  };

  await db.createAccount(account);

  return c.json({ success: true, data: account }, 201);
});

// DELETE /v1/admin/accounts/:id - 管理员删除任意账号
adminRouter.delete('/accounts/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM accounts WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// PUT /v1/admin/accounts/:id - 管理员更新任意账号
adminRouter.put('/accounts/:id', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id');

  // 验证账号存在
  const existing = await db.getAccountById(id);
  if (!existing) return c.json({ success: false, error: 'Account not found' }, 404);

  let body: { enabled?: number; daily_limit?: number; display_name?: string; name?: string; email?: string; provider_id?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

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
  if (sets.length === 0) return c.json({ success: false, error: 'Nothing to update' }, 400);

  sets.push("updated_at = datetime('now')");
  vals.push(id);
  await c.env.DB.prepare(`UPDATE accounts SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  return c.json({ success: true });
});

// ========== 跨租户统计 ==========

// POST /v1/admin/accounts/:id/test - 发送测试邮件验证账号配置
adminRouter.post('/accounts/:id/test', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id');

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

  if (result.success) {
    return c.json({ success: true, message: '测试邮件发送成功', messageId: result.messageId });
  }
  return c.json({ success: false, error: result.error || '发送失败', detail: result.providerResponse });
});

// ========== 跨租户统计 ==========

// GET /v1/admin/stats - 全局统计
adminRouter.get('/stats', superAdminMiddleware(), async (c) => {
  const [tenantCount, providerCount, accountCount, templateCount, mailCount] = await Promise.all([
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
      tenants: tenantCount?.c || 0,
      providers: providerCount?.c || 0,
      accounts: accountCount?.c || 0,
      templates: templateCount?.c || 0,
      total_mails: mailCount?.c || 0,
      today_sent: todayStats.sent || 0,
      today_failed: todayStats.failed || 0,
    },
  });
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default adminRouter;
