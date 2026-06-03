// Teaven Email - Webhook 管理路由
import { Hono } from 'hono';
import { authMiddleware, getAuth } from '../auth';
import { getDB } from '../db';
import type { Webhook } from '../types';

const webhookRouter = new Hono<{ Bindings: Env }>();

// GET /v1/webhooks - 获取 Webhook 列表
webhookRouter.get('/', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);
  const webhooks = await db.getWebhooks(auth.userId);
  return c.json({ success: true, data: webhooks });
});

// POST /v1/webhooks - 创建 Webhook
webhookRouter.post('/', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  let body: {
    name: string;
    url: string;
    events?: string[];
    secret?: string;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.name || !body.url) {
    return c.json({ success: false, error: 'name and url are required' }, 400);
  }

  const validEvents = ['sent', 'delivered', 'failed', 'bounced', 'spam'];
  const events = body.events || ['sent', 'failed', 'bounced'];
  for (const e of events) {
    if (!validEvents.includes(e)) {
      return c.json({ success: false, error: `Invalid event: ${e}` }, 400);
    }
  }

  const webhook: Omit<Webhook, 'created_at' | 'updated_at'> = {
    id: crypto.randomUUID(),
    user_id: auth.userId,
    name: body.name,
    url: body.url,
    events,
    secret: body.secret || null,
    enabled: 1,
  };

  await db.createWebhook(webhook);

  return c.json({ success: true, data: webhook }, 201);
});

export default webhookRouter;
