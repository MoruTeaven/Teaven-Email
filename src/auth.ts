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

// Base64URL 编解码（Cloudflare Workers 兼容）
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', stringToBytes(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, stringToBytes(data));
  const sigBytes = new Uint8Array(sig);
  let binary = '';
  sigBytes.forEach(b => binary += String.fromCharCode(b));
  return base64UrlEncode(binary);
}

async function hmacVerify(data: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw', stringToBytes(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['verify']
  );
  const sigStr = base64UrlDecode(signature);
  const sigBytes = new Uint8Array(sigStr.length);
  for (let i = 0; i < sigStr.length; i++) sigBytes[i] = sigStr.charCodeAt(i);
  return crypto.subtle.verify('HMAC', key, sigBytes, stringToBytes(data));
}

// 生成模拟登录令牌（24小时有效）
export async function generateImpersonationToken(
  userId: string,
  secret: string
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
  const payload = base64UrlEncode(JSON.stringify({ u: userId, e: exp }));
  const sig = await hmacSign(payload, secret);
  return `imp_${payload}.${sig}`;
}

// 验证模拟登录令牌
export async function verifyImpersonationToken(
  token: string,
  secret: string
): Promise<{ userId: string } | null> {
  if (!token.startsWith('imp_')) return null;
  const parts = token.substring(4).split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;

  // 验证签名
  const valid = await hmacVerify(payload, sig, secret);
  if (!valid) return null;

  // 解析 payload
  try {
    const data = JSON.parse(base64UrlDecode(payload));
    if (!data.u || !data.e) return null;
    if (data.e < Math.floor(Date.now() / 1000)) return null; // 已过期
    return { userId: data.u };
  } catch {
    return null;
  }
}

// 从 Authorization header 提取 API Key（仅 sk_ 前缀）
export function extractApiKey(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  const key = parts[1].trim();
  if (!key.startsWith('sk_')) return null;
  return key;
}

// 从 Authorization header 提取任意 Bearer token（sk_ 或 imp_）
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  return parts[1].trim();
}

// 认证中间件（支持 API Key 和模拟登录令牌）
export function authMiddleware(requiredPermissions?: Permission[]) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return c.json({ success: false, error: 'Missing or invalid Authorization header' }, 401);
    }

    const db = getDB(c.env.DB);
    const allPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER'];

    // ===== 路径 1: 模拟登录令牌 (imp_ 前缀) =====
    if (token.startsWith('imp_')) {
      const secret = c.env.IMPERSONATION_SECRET || '';
      if (!secret) {
        return c.json({ success: false, error: 'Impersonation not configured' }, 500);
      }

      const result = await verifyImpersonationToken(token, secret);
      if (!result) {
        return c.json({ success: false, error: 'Invalid or expired impersonation token' }, 401);
      }

      const user = await db.getUserById(result.userId);
      if (!user || user.status !== 'active') {
        return c.json({ success: false, error: 'Account is not active' }, 403);
      }

      const auth: AuthContext = {
        userId: user.id,
        apiKeyId: null,
        permissions: allPermissions,
        impersonated: true,
      };
      c.set('auth', auth);
      return next();
    }

    // ===== 路径 2: API Key (sk_ 前缀，原有逻辑) =====
    if (!token.startsWith('sk_')) {
      return c.json({ success: false, error: 'Invalid token format' }, 401);
    }

    const hash = await hashApiKey(token);
    const apiKeyRecord = await db.getApiKeyByHash(hash);

    if (!apiKeyRecord) {
      return c.json({ success: false, error: 'Invalid or disabled API key' }, 401);
    }

    // 检查 key 是否已过期（登录自动创建的 key 24 小时后过期）
    if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) <= new Date()) {
      // 懒清理：删除已过期的 key
      await db.deleteApiKey(apiKeyRecord.id, apiKeyRecord.user_id);
      return c.json({ success: false, error: 'API key has expired. Please log in again.' }, 401);
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
      impersonated: false,
    };
    c.set('auth', auth);

    await next();
  };
}

// 超级管理员中间件（仅接受 API Key，不接受模拟令牌）
export function superAdminMiddleware() {
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
      return c.json({ success: false, error: 'Invalid API key' }, 401);
    }

    // 检查 key 是否已过期
    if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) <= new Date()) {
      await db.deleteApiKey(apiKeyRecord.id, apiKeyRecord.user_id);
      return c.json({ success: false, error: 'API key has expired. Please log in again.' }, 401);
    }

    const user = await db.getUserById(apiKeyRecord.user_id);
    if (!user || user.status !== 'active' || !user.is_super_admin) {
      return c.json({ success: false, error: 'Super admin access required' }, 403);
    }

    await db.updateApiKeyLastUsed(apiKeyRecord.id);

    c.set('auth', {
      userId: apiKeyRecord.user_id,
      apiKeyId: apiKeyRecord.id,
      permissions: JSON.parse(apiKeyRecord.permissions as unknown as string) as Permission[],
      impersonated: false,
    } as AuthContext);

    await next();
  };
}

// 获取当前认证上下文
export function getAuth(c: Context): AuthContext {
  return c.get('auth');
}
