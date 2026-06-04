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

export default dashboardRouter;
