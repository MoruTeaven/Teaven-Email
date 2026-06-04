// Teaven Email - API Key 管理路由
import { Hono } from 'hono';
import { authMiddleware, getAuth, generateApiKey } from '../auth';
import { getDB } from '../db';
import type { Permission } from '../types';

const apiKeyRouter = new Hono<{ Bindings: Env }>();

// GET /v1/api-keys - 获取 API Key 列表
apiKeyRouter.get('/', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  // 懒清理：删除已过期的自动创建 key
  await db.cleanupExpiredKeys();

  const keys = await db.getApiKeysByUser(auth.userId);

  // 脱敏处理 - 只返回前缀
  const safeKeys = keys.map(k => ({
    id: k.id,
    name: k.name,
    prefix: k.api_key_prefix,
    permissions: typeof k.permissions === 'string' ? JSON.parse(k.permissions) : k.permissions,
    enabled: k.enabled,
    last_used_at: k.last_used_at,
    created_at: k.created_at,
  }));

  return c.json({ success: true, data: safeKeys });
});

// POST /v1/api-keys - 创建 API Key
apiKeyRouter.post('/', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  let body: {
    name: string;
    permissions?: Permission[];
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.name) {
    return c.json({ success: false, error: 'name is required' }, 400);
  }

  // 验证权限
  const validPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER'];
  const permissions = body.permissions || ['SEND_MAIL'];
  for (const p of permissions) {
    if (!validPermissions.includes(p)) {
      return c.json({ success: false, error: `Invalid permission: ${p}` }, 400);
    }
  }

  const { raw, hash, prefix } = await generateApiKey();

  const apiKey = {
    id: crypto.randomUUID(),
    user_id: auth.userId,
    name: body.name,
    api_key_hash: hash,
    api_key_prefix: prefix,
    permissions,
    enabled: 1,
    auto_created: 0,
    expires_at: null,
    last_used_at: null,
  };

  await db.createApiKey(apiKey);

  // 返回完整 key（仅创建时可见）
  return c.json({
    success: true,
    data: {
      id: apiKey.id,
      name: apiKey.name,
      api_key: raw,
      prefix,
      permissions,
      message: 'Store this key securely. It will not be shown again.',
    },
  }, 201);
});

// DELETE /v1/api-keys/:id - 删除 API Key
apiKeyRouter.delete('/:id', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const id = c.req.param('id');
  await db.deleteApiKey(id, auth.userId);

  return c.json({ success: true, message: 'API key deleted' });
});

// PUT /v1/api-keys/:id/toggle - 启用/禁用 API Key
apiKeyRouter.put('/:id/toggle', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const id = c.req.param('id');
  let body: { enabled: boolean };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  await db.toggleApiKey(id, auth.userId, body.enabled ? 1 : 0);

  return c.json({ success: true, message: `API key ${body.enabled ? 'enabled' : 'disabled'}` });
});

export default apiKeyRouter;
