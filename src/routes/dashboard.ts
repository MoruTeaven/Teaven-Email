// Teaven Email - 后台管理路由 (Dashboard)
import { Hono } from 'hono';
import { authMiddleware, getAuth } from '../auth';
import { getDB } from '../db';
import type { Template, EmailProvider, Account, ApiKey } from '../types';

const dashboardRouter = new Hono<{ Bindings: Env }>();

// GET /v1/dashboard/overview - 仪表盘概览
dashboardRouter.get('/overview', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const errors: Record<string, string> = {};

  // 每个查询独立 try/catch，单个失败不影响整体
  const [
    templatesResult, providersResult, accountsResult, apiKeysResult, statsResult
  ] = await Promise.allSettled([
    db.getTemplatesByUser(auth.userId),
    db.getAllProviders(),
    db.getAllAccounts(),
    db.getApiKeysByUser(auth.userId),
    db.getDailyStats(auth.userId, 7),
  ]);

  const extract = <T>(result: PromiseSettledResult<T>, fallback: T, label: string): T => {
    if (result.status === 'fulfilled') return result.value;
    errors[label] = result.reason instanceof Error ? result.reason.message : String(result.reason);
    console.error(`[dashboard/overview] ${label} query failed:`, result.reason);
    return fallback;
  };

  const templates = extract(templatesResult, [] as Template[], 'templates');
  const providers = extract(providersResult, [] as EmailProvider[], 'providers');
  const accounts  = extract(accountsResult,  [] as Account[], 'accounts');
  const apiKeys   = extract(apiKeysResult,   [] as ApiKey[], 'apiKeys');
  const stats     = extract(statsResult,     [] as Record<string, number>[], 'dailyStats');

  // 计算今日统计 — stats 来自 D1 查询，字段动态，用宽松类型
  interface DailyStatsRow { date: string; total_sent: number; total_delivered: number; total_failed: number; total_bounced: number; [key: string]: unknown; }
  const typedStats = stats as DailyStatsRow[];

  const today = new Date().toISOString().split('T')[0];
  const todayRow = typedStats.find(s => s.date === today);
  const todayStats = {
    sent: todayRow?.total_sent ?? 0,
    delivered: todayRow?.total_delivered ?? 0,
    failed: todayRow?.total_failed ?? 0,
    bounced: todayRow?.total_bounced ?? 0,
  };

  return c.json({
    success: true,
    data: {
      templates_count: templates.length,
      providers_count: providers.length,
      accounts_count: accounts.length,
      api_keys_count: apiKeys.length,
      today: todayStats,
      recent_7_days: stats,
    },
    ...(Object.keys(errors).length > 0 ? { errors } : {}),
  });
});

// GET /v1/dashboard/profile - 当前用户资料
dashboardRouter.get('/profile', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);
  const user = await db.getUserById(auth.userId);
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);
  return c.json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, is_super_admin: user.is_super_admin, created_at: user.created_at },
  });
});

// PUT /v1/dashboard/profile - 修改自己的昵称
dashboardRouter.put('/profile', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  let body: { name?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  if (body.name === undefined) {
    return c.json({ success: false, error: 'name 字段必填' }, 400);
  }
  const name = body.name.trim();
  if (!name) {
    return c.json({ success: false, error: '昵称不能为空' }, 400);
  }
  if (name.length > 50) {
    return c.json({ success: false, error: '昵称长度不能超过 50 个字符' }, 400);
  }

  await c.env.DB.prepare('UPDATE users SET name = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .bind(name, auth.userId).run();

  return c.json({ success: true, data: { name } });
});

export default dashboardRouter;
