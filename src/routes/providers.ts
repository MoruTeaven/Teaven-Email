// Teaven Email - 发送通道管理
// 发送通道为全局资源，仅管理员可管理，普通用户仅供查询和使用
// 分类路由已合并到 accounts 表的 categories 字段，由超管在发件账号中统一管理
import { Hono } from 'hono';
import { authMiddleware } from '../auth';
import { getDB } from '../db';

const providerRouter = new Hono<{ Bindings: Env }>();

// GET /v1/providers - 获取全局发送通道列表（所有用户可查看）
providerRouter.get('/', authMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const providers = await db.getAllProviders();
  return c.json({ success: true, data: providers });
});

export default providerRouter;
