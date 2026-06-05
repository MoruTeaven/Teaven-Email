// Teaven Email - API Key 管理路由
import { Hono } from 'hono';
import { authMiddleware, getAuth, generateApiKey, encryptApiKey, decryptApiKey, hashApiKey } from '../auth';
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
    encrypted: !!k.api_key_encrypted,
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
  const secret = c.env.JWT_SECRET || '';

  const apiKey = {
    id: crypto.randomUUID(),
    user_id: auth.userId,
    name: body.name,
    api_key_hash: hash,
    api_key_prefix: prefix,
    api_key_encrypted: secret ? await encryptApiKey(raw, secret) : null,
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

// POST /v1/api-keys/:id/reveal - 验证密码后获取原始 API Key
apiKeyRouter.post('/:id/reveal', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);
  const id = c.req.param('id') || '';

  let body: { password: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.password) {
    return c.json({ success: false, error: 'password is required' }, 400);
  }

  if (!id) {
    return c.json({ success: false, error: 'Invalid API key ID' }, 400);
  }

  // 获取 API Key 记录
  const apiKeyRecord = await db.getApiKeyById(id);
  if (!apiKeyRecord || apiKeyRecord.user_id !== (auth.userId || '')) {
    return c.json({ success: false, error: 'API key not found' }, 404);
  }

  if (!apiKeyRecord.api_key_encrypted) {
    return c.json({ success: false, error: 'This key was created before encryption support. Please create a new key.' }, 400);
  }

  // 获取用户并验证密码
  const user = await db.getUserById(auth.userId);
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(body.password));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (passwordHash !== user.password_hash) {
    return c.json({ success: false, error: 'Invalid password' }, 401);
  }

  // 解密并返回
  const secret = c.env.JWT_SECRET || '';
  if (!secret) {
    return c.json({ success: false, error: 'Encryption not configured' }, 500);
  }

  try {
    const rawKey = await decryptApiKey(apiKeyRecord.api_key_encrypted, secret);
    return c.json({ success: true, data: { api_key: rawKey } });
  } catch {
    return c.json({ success: false, error: 'Failed to decrypt API key' }, 500);
  }
});

export default apiKeyRouter;
