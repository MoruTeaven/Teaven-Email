// Teaven Email - 认证中间件
import { Context, Next } from 'hono';
import { getDB } from './db';
import type { AuthContext, Permission } from './types';

// 生成 API Key 哈希 (Web Crypto)
export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 生成 API Key (sk_ 前缀 + 随机字符串)
export async function generateApiKey(): Promise<{ raw: string; hash: string; prefix: string }> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const hex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const raw = `sk_${hex}`;
  const hash = await hashApiKey(raw);
  const prefix = raw.substring(0, 10);
  return { raw, hash, prefix };
}

// 从 Authorization header 提取 API Key
export function extractApiKey(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  const key = parts[1].trim();
  if (!key.startsWith('sk_')) return null;
  return key;
}

// 认证中间件
export function authMiddleware(requiredPermissions?: Permission[]) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    const apiKey = extractApiKey(authHeader);

    if (!apiKey) {
      return c.json({ success: false, error: 'Missing or invalid API key' }, 401);
    }

    const hash = await hashApiKey(apiKey);
    const db = getDB(c.env.DB);
    const apiKeyRecord = await db.getApiKeyByHash(hash);

    if (!apiKeyRecord) {
      return c.json({ success: false, error: 'Invalid or disabled API key' }, 401);
    }

    // 检查用户状态
    const user = await db.getUserById(apiKeyRecord.user_id);
    if (!user || user.status !== 'active') {
      return c.json({ success: false, error: 'Account is not active' }, 403);
    }

    // 检查权限
    if (requiredPermissions && requiredPermissions.length > 0) {
      const permissions = JSON.parse(apiKeyRecord.permissions as unknown as string) as Permission[];
      const hasPermission = requiredPermissions.every(p => permissions.includes(p));
      if (!hasPermission) {
        return c.json({ success: false, error: 'Insufficient permissions' }, 403);
      }
    }

    // 更新最后使用时间
    await db.updateApiKeyLastUsed(apiKeyRecord.id);

    // 注入认证上下文
    const auth: AuthContext = {
      userId: apiKeyRecord.user_id,
      apiKeyId: apiKeyRecord.id,
      permissions: JSON.parse(apiKeyRecord.permissions as unknown as string) as Permission[],
    };
    c.set('auth', auth);

    await next();
  };
}

// 获取当前认证上下文
export function getAuth(c: Context): AuthContext {
  return c.get('auth');
}
