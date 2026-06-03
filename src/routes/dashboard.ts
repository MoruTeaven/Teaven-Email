// Teaven Email - 后台管理路由 (Dashboard)
import { Hono } from 'hono';
import { authMiddleware, getAuth } from '../auth';
import { getDB } from '../db';

const dashboardRouter = new Hono<{ Bindings: Env }>();

// GET /v1/dashboard/overview - 仪表盘概览
dashboardRouter.get('/overview', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const [templates, providers, accounts, apiKeys, stats] = await Promise.all([
    db.getTemplatesByUser(auth.userId),
    db.getProvidersByUser(auth.userId),
    db.getAccountsByUser(auth.userId),
    db.getApiKeysByUser(auth.userId),
    db.getDailyStats(auth.userId, 7),
  ]);

  // 计算今日统计
  const today = new Date().toISOString().split('T')[0];
  const todayStats = (stats as Record<string, number>[]).find(s => s.date === today) || {
    total_sent: 0,
    total_delivered: 0,
    total_failed: 0,
    total_bounced: 0,
  };

  return c.json({
    success: true,
    data: {
      templates_count: templates.length,
      providers_count: providers.length,
      accounts_count: accounts.length,
      api_keys_count: apiKeys.length,
      today: {
        sent: todayStats.total_sent || 0,
        delivered: todayStats.total_delivered || 0,
        failed: todayStats.total_failed || 0,
        bounced: todayStats.total_bounced || 0,
      },
      recent_7_days: stats,
    },
  });
});

export default dashboardRouter;
