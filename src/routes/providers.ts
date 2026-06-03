// Teaven Email - Provider 和 Account 管理路由
import { Hono } from 'hono';
import { authMiddleware, getAuth } from '../auth';
import { getDB } from '../db';
import type { EmailProvider, ProviderType } from '../types';

const providerRouter = new Hono<{ Bindings: Env }>();

// ============ Providers ============

// GET /v1/providers - 获取 Provider 列表
providerRouter.get('/', authMiddleware(['MANAGE_PROVIDER']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);
  const providers = await db.getProvidersByUser(auth.userId);
  return c.json({ success: true, data: providers });
});

// POST /v1/providers - 创建 Provider
providerRouter.post('/', authMiddleware(['MANAGE_PROVIDER']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  let body: {
    name: string;
    type: ProviderType;
    config: Record<string, unknown>;
    priority?: number;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  if (!body.name || !body.type || !body.config) {
    return c.json({ success: false, error: 'name, type, and config are required' }, 400);
  }

  if (!['smtp', 'api', 'cloudflare_email'].includes(body.type)) {
    return c.json({ success: false, error: 'type must be smtp, api, or cloudflare_email' }, 400);
  }

  // 验证配置
  const configErrors = validateProviderConfig(body.type, body.config);
  if (configErrors.length > 0) {
    return c.json({ success: false, error: `Config validation failed: ${configErrors.join(', ')}` }, 400);
  }

  const provider: Omit<EmailProvider, 'created_at' | 'updated_at'> = {
    id: crypto.randomUUID(),
    user_id: auth.userId,
    name: body.name,
    type: body.type,
    config: body.config as EmailProvider['config'],
    priority: body.priority || 0,
    enabled: 1,
  };

  await db.createProvider(provider);

  return c.json({ success: true, data: provider }, 201);
});

// PUT /v1/providers/:id - 更新 Provider
providerRouter.put('/:id', authMiddleware(['MANAGE_PROVIDER']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const id = c.req.param('id');
  const existing = await db.getProviderById(id, auth.userId);
  if (!existing) {
    return c.json({ success: false, error: 'Provider not found' }, 404);
  }

  let body: Partial<{
    name: string;
    type: ProviderType;
    config: Record<string, unknown>;
    priority: number;
    enabled: number;
  }>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  await db.updateProvider(id, auth.userId, body);

  return c.json({ success: true, message: 'Provider updated' });
});

// DELETE /v1/providers/:id - 删除 Provider
providerRouter.delete('/:id', authMiddleware(['MANAGE_PROVIDER']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const id = c.req.param('id');
  await db.deleteProvider(id, auth.userId);

  return c.json({ success: true, message: 'Provider deleted' });
});

// ============ Category Routes ============

// GET /v1/providers/routes - 获取分类路由规则
providerRouter.get('/routes', authMiddleware(['MANAGE_PROVIDER']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);
  const routes = await db.getCategoryRoutes(auth.userId);
  return c.json({ success: true, data: routes });
});

// POST /v1/providers/routes - 创建分类路由规则
providerRouter.post('/routes', authMiddleware(['MANAGE_PROVIDER']), async (c) => {
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
providerRouter.delete('/routes/:id', authMiddleware(['MANAGE_PROVIDER']), async (c) => {
  const auth = getAuth(c);
  const db = getDB(c.env.DB);

  const id = c.req.param('id');
  await db.deleteCategoryRoute(id, auth.userId);

  return c.json({ success: true, message: 'Route deleted' });
});

function validateProviderConfig(type: ProviderType, config: Record<string, unknown>): string[] {
  const errors: string[] = [];

  switch (type) {
    case 'smtp':
      if (!config.host) errors.push('host is required');
      if (!config.port) errors.push('port is required');
      if (!config.username) errors.push('username is required');
      if (!config.password) errors.push('password is required');
      break;
    case 'api':
      if (!config.api_key) errors.push('api_key is required');
      break;
    case 'cloudflare_email':
      if (!config.domain) errors.push('domain is required');
      break;
  }

  return errors;
}

export default providerRouter;
