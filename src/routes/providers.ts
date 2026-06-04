// Teaven Email - 发送通道和路由管理
// 发送通道为全局资源，仅管理员可管理，普通用户仅供查询和使用
import { Hono } from 'hono';
import { authMiddleware, getAuth } from '../auth';
import { getDB } from '../db';

const providerRouter = new Hono<{ Bindings: Env }>();

// ============ 发送通道（只读） ============

// GET /v1/providers - 获取全局发送通道列表（所有用户可查看）
providerRouter.get('/', authMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const providers = await db.getAllProviders();
  return c.json({ success: true, data: providers });
});

// ============ Category Routes ============

// GET /v1/providers/routes - 获取分类路由规则
providerRouter.get('/routes', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);
  const routes = await db.getCategoryRoutes(auth.userId);
  return c.json({ success: true, data: routes });
});

// POST /v1/providers/routes - 创建分类路由规则
providerRouter.post('/routes', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  let body: {
    category: string;
    provider_id: string;
    account_id?: string;
    priority?: number;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.category || !body.provider_id) {
    return c.json({ success: false, error: 'category and provider_id are required' }, 400);
  }

  const route = {
    id: crypto.randomUUID(),
    user_id: auth.userId,
    category: body.category,
    provider_id: body.provider_id,
    account_id: body.account_id || null,
    priority: body.priority || 0,
    enabled: 1,
  };

  await db.createCategoryRoute(route);

  return c.json({ success: true, data: route }, 201);
});

// DELETE /v1/providers/routes/:id - 删除分类路由规则
providerRouter.delete('/routes/:id', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const id = c.req.param('id');
  await db.deleteCategoryRoute(id, auth.userId);

  return c.json({ success: true, message: 'Route deleted' });
});

export default providerRouter;
