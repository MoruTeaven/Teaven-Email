// Teaven Email - 发送通道和路由管理
// 发送通道为全局资源，仅管理员可管理，普通用户仅供查询和使用
// 分类路由由超管后台统一管理，用户只读
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

// ============ Category Routes（只读） ============

// GET /v1/providers/routes - 获取当前用户的分类路由规则（只读）
// 路由由超管在后台统一管理，用户不可创建/删除
providerRouter.get('/routes', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);
  const routes = await db.getCategoryRoutes(auth.userId);
  return c.json({ success: true, data: routes });
});

export default providerRouter;
