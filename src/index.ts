// Teaven Email - Worker 入口
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import mailRouter from './routes/mail';
import templateRouter from './routes/templates';
import providerRouter from './routes/providers';
import apiKeyRouter from './routes/api_keys';
import webhookRouter from './routes/webhooks';
import dashboardRouter from './routes/dashboard';
import setupRouter from './routes/setup';
import adminRouter from './routes/admin';
import { processQueue } from './queue_processor';
import { getDB } from './db';
import { getDashboardHTML } from './dashboard_html';
import { getAdminHTML } from './admin_html';

const app = new Hono<{ Bindings: Env }>();

// CORS 配置
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
}));

// 用户后台
app.get('/dashboard', async (c) => { return c.html(getDashboardHTML()); });

// 超级管理员后台
app.get('/admin', async (c) => { return c.html(getAdminHTML()); });

// 健康检查
app.get('/', (c) => {
  return c.json({
    name: 'Teaven Email',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// API 版本前缀
const v1 = new Hono<{ Bindings: Env }>();

// 挂载路由
v1.route('/mail', mailRouter);
v1.route('/templates', templateRouter);
v1.route('/providers', providerRouter);
v1.route('/api-keys', apiKeyRouter);
v1.route('/webhooks', webhookRouter);
v1.route('/dashboard', dashboardRouter);
v1.route('/setup', setupRouter);
v1.route('/admin', adminRouter);

// 注册 v1 路由组
app.route('/v1', v1);

// 全局错误处理 — 捕获所有未处理的异常，避免裸 500
app.onError((err, c) => {
  console.error(`[${c.req.method} ${c.req.path}] Unhandled error:`, err);
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: err instanceof Error ? err.message : String(err),
  }, 500);
});

// Cron 触发器 - 处理邮件队列（每分钟执行一次）
// 在 wrangler.toml 中配置：
// [triggers]
// crons = ["* * * * *"]
app.get('/__internal/process-queue', async (c) => {
  const result = await processQueue(c.env);
  return c.json({ success: true, data: result });
});

// 手动触发队列处理
app.post('/__internal/process-queue', async (c) => {
  const result = await processQueue(c.env);
  return c.json({ success: true, data: result });
});

// 导出 scheduled handler 用于 Cron Triggers
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (event.cron) {
      case '* * * * *':
        ctx.waitUntil(processQueue(env));
        ctx.waitUntil(cleanupExpiredKeys(env));
        break;
    }
  },
};

async function cleanupExpiredKeys(env: Env): Promise<void> {
  try {
    const db = getDB(env.DB);
    const count = await db.cleanupExpiredKeys();
    if (count > 0) {
      console.log(`Cleaned up ${count} expired auto-created API keys`);
    }
  } catch (err) {
    console.error('Failed to cleanup expired keys:', err);
  }
}
