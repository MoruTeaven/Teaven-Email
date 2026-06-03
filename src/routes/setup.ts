// Teaven Email - 初始化路由（首次使用）
// 用于创建第一个管理员用户和 API Key
import { Hono } from 'hono';
import { getDB } from '../db';
import { generateApiKey } from '../auth';
import type { Permission } from '../types';

const setupRouter = new Hono<{ Bindings: Env }>();

// GET /v1/setup/status - 检查是否需要初始化
setupRouter.get('/status', async (c) => {
  const db = getDB(c.env.DB);
  const result = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
  const needsSetup = !result || result.count === 0;

  return c.json({
    success: true,
    data: {
      needs_setup: needsSetup,
      message: needsSetup ? 'System needs initialization. Create your first admin account.' : 'System already initialized.',
    },
  });
});

// POST /v1/setup/init - 初始化第一个管理员账户
// 仅在没有任何用户时可用
setupRouter.post('/init', async (c) => {
  const db = getDB(c.env.DB);

  // 检查是否已初始化
  const existing = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
  if (existing && existing.count > 0) {
    return c.json({ success: false, error: 'System already initialized. Use /dashboard to log in.' }, 400);
  }

  let body: {
    name: string;
    email: string;
    password: string;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.name || !body.email || !body.password) {
    return c.json({ success: false, error: 'name, email, and password are required' }, 400);
  }

  if (!isValidEmail(body.email)) {
    return c.json({ success: false, error: 'Invalid email format' }, 400);
  }

  if (body.password.length < 6) {
    return c.json({ success: false, error: 'Password must be at least 6 characters' }, 400);
  }

  // 简单密码哈希 (在 Workers 中可用 Web Crypto)
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(body.password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // 创建用户
  const userId = crypto.randomUUID();
  await db.createUser({
    id: userId,
    name: body.name,
    email: body.email,
    password_hash: passwordHash,
    status: 'active',
  });

  // 生成 API Key
  const { raw, hash, prefix } = await generateApiKey();
  const apiKeyId = crypto.randomUUID();

  const allPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER'];

  await db.createApiKey({
    id: apiKeyId,
    user_id: userId,
    name: 'Admin Key',
    api_key_hash: hash,
    api_key_prefix: prefix,
    permissions: allPermissions,
    enabled: 1,
    last_used_at: null,
  });

  return c.json({
    success: true,
    data: {
      user: {
        id: userId,
        name: body.name,
        email: body.email,
      },
      api_key: {
        id: apiKeyId,
        name: 'Admin Key',
        key: raw,
        prefix,
        permissions: allPermissions,
        message: '⚠️  Store this API key securely. It will not be shown again!',
      },
    },
  }, 201);
});

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default setupRouter;
