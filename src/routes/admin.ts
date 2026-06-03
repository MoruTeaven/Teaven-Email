// Teaven Email - 超级管理员路由（跨租户管理）
import { Hono } from 'hono';
import { superAdminMiddleware } from '../auth';
import type { D1Database } from '@cloudflare/workers-types';

const adminRouter = new Hono<{ Bindings: Env }>();

// ========== 跨租户数据查询 ==========

// GET /v1/admin/tenants - 所有租户
adminRouter.get('/tenants', superAdminMiddleware(), async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT u.id, u.name, u.email, u.status, u.is_super_admin, u.created_at,
     (SELECT COUNT(*) FROM api_keys WHERE user_id = u.id) as api_key_count,
     (SELECT COUNT(*) FROM templates WHERE user_id = u.id) as template_count,
     (SELECT COUNT(*) FROM providers WHERE user_id = u.id) as provider_count,
     (SELECT COUNT(*) FROM accounts WHERE user_id = u.id) as account_count,
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

// ========== 跨租户 Provider 管理 ==========

// GET /v1/admin/providers - 所有租户的所有 Provider
adminRouter.get('/providers', superAdminMiddleware(), async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT p.*, u.name as tenant_name, u.email as tenant_email,
     (SELECT COUNT(*) FROM accounts WHERE provider_id = p.id) as account_count
     FROM providers p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC`
  ).all();
  return c.json({ success: true, data: rows.results });
});

// ========== 跨租户发件账号管理 ==========

// GET /v1/admin/accounts - 所有租户的所有发件账号
adminRouter.get('/accounts', superAdminMiddleware(), async (c) => {
  const tenantId = c.req.query('tenant_id');
  let sql = `SELECT a.*, u.name as tenant_name, u.email as tenant_email, p.name as provider_name, p.type as provider_type
     FROM accounts a JOIN users u ON a.user_id = u.id JOIN providers p ON a.provider_id = p.id`;
  const params: unknown[] = [];
  if (tenantId) { sql += ' WHERE a.user_id = ?'; params.push(tenantId); }
  sql += ' ORDER BY a.created_at DESC';

  const rows = await params.length > 0
    ? c.env.DB.prepare(sql).bind(...params).all()
    : c.env.DB.prepare(sql).all();
  return c.json({ success: true, data: rows.results });
});

// POST /v1/admin/accounts - 管理员为任意租户创建发件账号
adminRouter.post('/accounts', superAdminMiddleware(), async (c) => {
  let body: { user_id: string; provider_id: string; name: string; email: string; display_name?: string; daily_limit?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  if (!body.user_id || !body.provider_id || !body.name || !body.email) {
    return c.json({ success: false, error: 'user_id, provider_id, name, email are required' }, 400);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO accounts (id, user_id, provider_id, name, email, display_name, daily_limit, sent_today, enabled)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1)`
  ).bind(id, body.user_id, body.provider_id, body.name, body.email, body.display_name || null, body.daily_limit || 1000).run();

  return c.json({ success: true, data: { id, ...body } }, 201);
});

// DELETE /v1/admin/accounts/:id - 管理员删除任意账号
adminRouter.delete('/accounts/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM accounts WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// PUT /v1/admin/accounts/:id - 管理员更新任意账号
adminRouter.put('/accounts/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id');
  let body: { enabled?: number; daily_limit?: number; display_name?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.enabled !== undefined) { sets.push('enabled = ?'); vals.push(body.enabled); }
  if (body.daily_limit !== undefined) { sets.push('daily_limit = ?'); vals.push(body.daily_limit); }
  if (body.display_name !== undefined) { sets.push('display_name = ?'); vals.push(body.display_name); }
  if (sets.length === 0) return c.json({ success: false, error: 'Nothing to update' }, 400);

  sets.push("updated_at = datetime('now')");
  vals.push(id);
  await c.env.DB.prepare(`UPDATE accounts SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  return c.json({ success: true });
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

export default adminRouter;
