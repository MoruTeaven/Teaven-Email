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
import verificationRouter from './routes/verification';
import { processQueue } from './queue_processor';
import { getDB } from './db';
import { superAdminMiddleware } from './auth';
import { getDashboardHTML } from './dashboard_html';
import { getAdminHTML } from './admin_html';
import { isValidEmail, escapeHtml, htmlToText, toLocalISOString } from './utils';

const app = new Hono<{ Bindings: Env }>();

// 全局请求日志 — 记录所有请求（含失败的、未认证的），便于排查问题
// 必须放在 CORS 等中间件之前，确保 OPTIONS 和认证失败的请求也被记录
app.use('*', async (c, next) => {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  const method = c.req.method;
  const path = c.req.path;
  const queryString = c.req.url.includes('?') ? new URL(c.req.url).search.slice(1) : null;
  const authHeader = c.req.header('Authorization');
  const contentType = c.req.header('Content-Type');
  const userAgent = c.req.header('User-Agent');
  const cfIp = c.req.header('CF-Connecting-IP');

  let authInfo: string;
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      const token = parts[1];
      if (token.startsWith('sk_')) {
        authInfo = `sk_${token.substring(3, 10)}...`;
      } else if (token.startsWith('imp_')) {
        authInfo = 'imp_***';
      } else {
        authInfo = 'bearer_***';
      }
    } else {
      authInfo = 'invalid_format';
    }
  } else {
    authInfo = 'none';
  }

  let bodySnapshot: string | null = null;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const cloned = c.req.raw.clone();
      const text = await cloned.text();
      if (text) {
        let masked = text;
        try {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object') {
            const sensitiveFields = ['password', 'api_key', 'secret', 'code', 'authorization', 'apiKey'];
            for (const field of sensitiveFields) {
              if (parsed[field] !== undefined) {
                parsed[field] = '***';
              }
            }
            masked = JSON.stringify(parsed);
          }
        } catch {
          // non-JSON body, just truncate
        }
        bodySnapshot = masked.length > 500 ? `${masked.substring(0, 500)}...` : masked;
      }
    } catch {
      // ignore body read errors
    }
  }

  console.log(JSON.stringify({
    event: 'request',
    requestId,
    method,
    path,
    query: queryString || null,
    auth: authInfo,
    contentType: contentType || null,
    userAgent: userAgent || null,
    ip: cfIp || null,
    body: bodySnapshot,
  }));

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(JSON.stringify({
    event: 'response',
    requestId,
    method,
    path,
    status,
    duration,
  }));
});

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
    timestamp: toLocalISOString(),
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
v1.route('/verification', verificationRouter);

// 注册 v1 路由组
app.route('/v1', v1);

// 全局错误处理 — 捕获所有未处理的异常，避免裸 500
app.onError((err, c) => {
  console.error(`[${c.req.method} ${c.req.path}] Unhandled error:`, err);
  const isProduction = c.env.ENVIRONMENT === 'production';
  return c.json({
    success: false,
    error: 'Internal Server Error',
    ...(isProduction ? {} : { message: err instanceof Error ? err.message : String(err) }),
  }, 500);
});

// 内部 HTTP 触发队列处理（需超级管理员 API Key）。Cron Trigger 走 scheduled handler。
app.post('/__internal/process-queue', superAdminMiddleware(), async (c) => {
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
        ctx.waitUntil(cleanupExpiredCodes(env));
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

async function cleanupExpiredCodes(env: Env): Promise<void> {
  try {
    const db = getDB(env.DB);
    const count = await db.cleanupExpiredCodes();
    if (count > 0) {
      console.log(`Cleaned up ${count} expired/used verification codes`);
    }
  } catch (err) {
    console.error('Failed to cleanup expired codes:', err);
  }
}
