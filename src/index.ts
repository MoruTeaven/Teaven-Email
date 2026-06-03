// Teaven Email - Worker 入口
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import mailRouter from './routes/mail';
import templateRouter from './routes/templates';
import providerRouter from './routes/providers';
import apiKeyRouter from './routes/api_keys';
import webhookRouter from './routes/webhooks';
import dashboardRouter from './routes/dashboard';
import { processQueue } from './queue_processor';
import { getDashboardHTML } from './dashboard_html';

const app = new Hono<{ Bindings: Env }>();

// CORS 配置
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
}));

// 后台管理界面 - 从 R2 或 KV 读取
app.get('/dashboard', async (c) => {
  try {
    // 尝试从 R2 读取静态文件
    const object = await c.env.R2.get('dashboard/index.html');
    if (object) {
      const html = await object.text();
      return c.html(html);
    }
  } catch {}
  // 回退：返回内联的 dashboard
  return c.html(getDashboardHTML());
});

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

// 注册 v1 路由组
app.route('/v1', v1);

// Cron 触发器 - 处理邮件队列
// 在 wrangler.toml 中配置：
// [triggers]
// crons = ["*/30 * * * *"]
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
      case '*/30 * * * *':
        ctx.waitUntil(processQueue(env));
        break;
    }
  },
};
