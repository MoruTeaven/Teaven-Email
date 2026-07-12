import { Hono } from 'hono';
import { superAdminMiddleware, generateApiKey, generateImpersonationToken, encryptApiKey, getImpersonationSecret, hashPassword } from '../../auth';
import { getDB } from '../../db';
import { uuidv7 } from '../../uuid';
import { isValidEmail, convertDBTimestamp } from '../../utils';
import { invalidateAdminCache } from './common';
import type { Permission } from '../../types';

const router = new Hono<{ Bindings: Env }>();

router.get('/tenants', superAdminMiddleware(), async (c) => {
  const queryWithAutoCreated = `SELECT u.id, u.name, u.email, u.status, u.is_super_admin, u.created_at,
     (SELECT COUNT(*) FROM api_keys WHERE user_id = u.id AND auto_created = 0) as api_key_count,
     (SELECT COUNT(*) FROM templates WHERE user_id = u.id) as template_count,
     (SELECT COUNT(*) FROM mail_logs WHERE user_id = u.id) as mail_count
     FROM users u WHERE u.status != 'deleted' ORDER BY u.created_at DESC`;

  const queryFallback = `SELECT u.id, u.name, u.email, u.status, u.is_super_admin, u.created_at,
     (SELECT COUNT(*) FROM api_keys WHERE user_id = u.id) as api_key_count,
     (SELECT COUNT(*) FROM templates WHERE user_id = u.id) as template_count,
     (SELECT COUNT(*) FROM mail_logs WHERE user_id = u.id) as mail_count
     FROM users u WHERE u.status != 'deleted' ORDER BY u.created_at DESC`;

  try {
    const rows = await c.env.DB.prepare(queryWithAutoCreated).all();
    const data = rows.results.map((r: Record<string, unknown>) => {
      if (r.created_at) r.created_at = convertDBTimestamp(r.created_at as string);
      return r;
    });
    return c.json({ success: true, data });
  } catch (err) {
    if (err instanceof Error && (err.message.includes('auto_created') || err.message.includes('no such column'))) {
      console.warn('[admin] auto_created column missing, falling back to unfiltered query. Run migration 005.');
      const rows = await c.env.DB.prepare(queryFallback).all();
      const data = rows.results.map((r: Record<string, unknown>) => {
        if (r.created_at) r.created_at = convertDBTimestamp(r.created_at as string);
        return r;
      });
      return c.json({ success: true, data });
    }
    throw err;
  }
});

router.get('/tenants/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id')!;
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);
  if (user.created_at) user.created_at = convertDBTimestamp(user.created_at as string);
  return c.json({ success: true, data: user });
});

router.put('/tenants/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id')!;
  let body: { name?: string; status?: string; is_super_admin?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) {
      return c.json({ success: false, error: '昵称不能为空' }, 400);
    }
    if (name.length > 50) {
      return c.json({ success: false, error: '昵称长度不能超过 50 个字符' }, 400);
    }
    await c.env.DB.prepare('UPDATE users SET name = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(name, id).run();
  }
  if (body.status) {
    await c.env.DB.prepare('UPDATE users SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(body.status, id).run();
  }
  if (body.is_super_admin !== undefined) {
    await c.env.DB.prepare('UPDATE users SET is_super_admin = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(body.is_super_admin, id).run();
  }
  invalidateAdminCache();
  return c.json({ success: true });
});

router.post('/tenants', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);

  let body: { name: string; email: string; password: string; is_super_admin?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  if (!body.name || !body.email || !body.password) {
    return c.json({ success: false, error: 'name, email, and password are required' }, 400);
  }
  if (!isValidEmail(body.email)) {
    return c.json({ success: false, error: 'Invalid email format' }, 400);
  }
  if (body.password.length < 6) {
    return c.json({ success: false, error: 'Password must be at least 6 characters' }, 400);
  }

  const existing = await db.getUserByEmail(body.email);
  if (existing) {
    return c.json({ success: false, error: 'Email already in use' }, 409);
  }

  const passwordHash = await hashPassword(body.password);

  const userId = uuidv7();
  await db.createUser({
    id: userId,
    name: body.name,
    email: body.email,
    password_hash: passwordHash,
    status: 'active',
    is_super_admin: body.is_super_admin || 0,
  });

  const allPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER', 'VERIFY_CODE'];
  const { raw, hash, prefix } = await generateApiKey();
  const apiKeyId = uuidv7();
  const secret = c.env.JWT_SECRET || '';

  await db.createApiKey({
    id: apiKeyId,
    user_id: userId,
    name: 'Default Key',
    api_key_hash: hash,
    api_key_prefix: prefix,
    api_key_encrypted: secret ? await encryptApiKey(raw, secret) : null,
    permissions: allPermissions,
    enabled: 1,
    auto_created: 0,
    expires_at: null,
    last_used_at: null,
  });

  invalidateAdminCache();
  return c.json({
    success: true,
    data: {
      user: { id: userId, name: body.name, email: body.email, is_super_admin: body.is_super_admin || 0 },
      api_key: { id: apiKeyId, name: 'Default Key', key: raw, prefix, permissions: allPermissions },
    },
  }, 201);
});

router.post('/tenants/:id/impersonate', superAdminMiddleware(), async (c) => {
  try {
    const db = getDB(c.env.DB);
    const id = c.req.param('id')!;

    const user = await db.getUserById(id);
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    if (user.status !== 'active') {
      return c.json({ success: false, error: 'User is not active' }, 400);
    }

    const secret = getImpersonationSecret(c.env);
    if (!secret) {
      return c.json({ success: false, error: 'Impersonation not configured. Set IMPERSONATION_SECRET or JWT_SECRET.' }, 500);
    }

    const token = await generateImpersonationToken(user.id, secret);

    return c.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        impersonation_token: token,
        expires_in: 24 * 60 * 60,
      },
    }, 200);
  } catch (err) {
    console.error('[admin] impersonate error:', err);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

export default router;