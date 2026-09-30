// Teaven Email - API Key 管理路由
import { Hono } from 'hono';
import { authMiddleware, getAuth, generateApiKey, encryptApiKey, decryptApiKey, hashPassword, verifyPassword } from '../auth';
import { getJwtSecret } from '../secrets';
import { getDB } from '../db';
import { uuidv7 } from '../uuid';
import { convertDBTimestamp } from '../utils';
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
    last_used_at: convertDBTimestamp(k.last_used_at),
    created_at: convertDBTimestamp(k.created_at),
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
  const validPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER', 'VERIFY_CODE'];
  const permissions: Permission[] = body.permissions && body.permissions.length > 0 ? body.permissions : ['SEND_MAIL'];
  for (const p of permissions) {
    if (!validPermissions.includes(p)) {
      return c.json({ success: false, error: `Invalid permission: ${p}` }, 400);
    }
  }

  if (!auth.impersonated && !permissions.every(p => auth.permissions.includes(p))) {
    return c.json({
      success: false,
      error: 'Cannot create an API key with permissions not held by the current key',
    }, 403);
  }

  const { raw, hash, prefix } = await generateApiKey();
  // [H-3] 缺失即抛错，不再回退空串（空串会派生出可预测的 AES 密钥）
  const secret = getJwtSecret(c.env);

  const apiKey = {
    id: uuidv7(),
    user_id: auth.userId,
    name: body.name,
    api_key_hash: hash,
    api_key_prefix: prefix,
    // [H-3] 删除 `secret ? ... : null` 静默降级：要么加密入库，要么整个请求失败。
    api_key_encrypted: await encryptApiKey(raw, secret),
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

  const id = c.req.param('id')!;
  await db.deleteApiKey(id, auth.userId);

  return c.json({ success: true, message: 'API key deleted' });
});

// PUT /v1/api-keys/:id/toggle - 启用/禁用 API Key
apiKeyRouter.put('/:id/toggle', authMiddleware(), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const id = c.req.param('id')!;
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

  const passwordResult = await verifyPassword(body.password, user.password_hash);
  if (!passwordResult.valid) {
    return c.json({ success: false, error: 'Invalid password' }, 401);
  }
  if (passwordResult.needsRehash) {
    await db.updateUserPasswordHash(user.id, await hashPassword(body.password));
  }

  // 解密并返回：[H-3] getJwtSecret 缺失即抛错，原 `Encryption not configured` 伪分支删除
  const secret = getJwtSecret(c.env);

  try {
    const rawKey = await decryptApiKey(apiKeyRecord.api_key_encrypted, secret);
    return c.json({ success: true, data: { api_key: rawKey } });
  } catch {
    return c.json({ success: false, error: 'Failed to decrypt API key' }, 500);
  }
});

export default apiKeyRouter;
