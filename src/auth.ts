// Teaven Email - 认证中间件
import { Context, Next } from 'hono';
import { getDB } from './db';
import type { AuthContext, Permission } from './types';
import { getImpersonationSecret } from './secrets';

// [H-3] 密钥取值一律走 src/secrets.ts。此处仅做再导出，保持既有 `from '../auth'` 调用点兼容。
export { getImpersonationSecret };

const PASSWORD_HASH_ALGORITHM = 'pbkdf2_sha256';
const PASSWORD_HASH_ITERATIONS = 100000;
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_BYTES = 32;

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

// AES-256-GCM 加密 API Key 原始值
// 使用 JWT_SECRET 派生加密密钥，IV 随机生成
export async function encryptApiKey(rawKey: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  // 用 SHA-256 从 secret 派生 256-bit AES 密钥
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'PBKDF2' }, false, ['deriveKey']
  );
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('teaven-email-key-enc'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey, encoder.encode(rawKey)
  );
  // 格式: base64(iv + ciphertext)
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

// AES-256-GCM 解密 API Key
export async function decryptApiKey(encrypted: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'PBKDF2' }, false, ['deriveKey']
  );
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('teaven-email-key-enc'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey, ciphertext
  );
  return new TextDecoder().decode(decrypted);
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

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(i, i + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a[i] || 0) ^ (b[i] || 0);
  }
  return diff === 0;
}

async function legacySha256PasswordHash(password: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    PASSWORD_KEY_BYTES * 8
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_BYTES));
  const hash = await derivePasswordHash(password, salt, PASSWORD_HASH_ITERATIONS);
  return `${PASSWORD_HASH_ALGORITHM}$${PASSWORD_HASH_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (storedHash.startsWith(`${PASSWORD_HASH_ALGORITHM}$`)) {
    try {
      const [, iterationsRaw, saltRaw, hashRaw] = storedHash.split('$');
      const iterations = parseInt(iterationsRaw, 10);
      if (!iterations || !saltRaw || !hashRaw) return { valid: false, needsRehash: false };
      const expected = base64ToBytes(hashRaw);
      const actual = await derivePasswordHash(password, base64ToBytes(saltRaw), iterations);
      const valid = timingSafeEqualBytes(actual, expected);
      return {
        valid,
        needsRehash: valid && iterations < PASSWORD_HASH_ITERATIONS,
      };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  const legacyHash = await legacySha256PasswordHash(password);
  return {
    valid: legacyHash === storedHash,
    needsRehash: true,
  };
}

// [H-3] 缺陷修复：原来的回落链 IMPERSONATION_SECRET || JWT_SECRET || '' 有两重问题：
//   1) 缺失时返回空串 —— 空串 HMAC 密钥依然能签出"合法"令牌（见 docs/security-H3-fail-fast.md 实验），
//      一旦调用方去掉 `if (!secret)` 判断就等于任何人可自签管理员模拟登录令牌；
//   2) 回落到 JWT_SECRET 让"签名密钥"与"加密密钥"共用一把，JWT_SECRET 泄露即可伪造任意用户会话，反之亦然。
// 现由 src/secrets.ts 的 getImpersonationSecret() 取代：缺失/过弱/与 JWT_SECRET 复用 → 抛 SecretConfigError。

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

export function extractAuthCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const idx = cookie.indexOf('=');
    if (idx <= 0) continue;
    const name = cookie.slice(0, idx).trim();
    if (name !== 'teaven_auth') continue;
    const value = cookie.slice(idx + 1).trim();
    return value ? decodeURIComponent(value) : null;
  }
  return null;
}

// 认证中间件（支持 API Key 和模拟登录令牌）
export function authMiddleware(requiredPermissions?: Permission[]) {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization');
      const token = extractBearerToken(authHeader) || extractAuthCookie(c.req.header('Cookie'));

      if (!token) {
        return c.json({ success: false, error: 'Missing or invalid Authorization header' }, 401);
      }

      const db = getDB(c.env.DB);
      const allPermissions: Permission[] = ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER', 'VERIFY_CODE'];

      // ===== 路径 1: 模拟登录令牌 (imp_ 前缀) =====
      if (token.startsWith('imp_')) {
        // [H-3] getImpersonationSecret 现在缺失即抛错（由外层 catch 记录并拒绝），不会再返回空串，
        // 因此原先的 `if (!secret)` 伪保护已删除。
        const secret = getImpersonationSecret(c.env);

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
    } catch (err) {
      console.error('[auth] authMiddleware error:', err);
      return c.json({ success: false, error: 'Internal server error' }, 500);
    }
  };
}

// 超级管理员中间件（仅接受 API Key，不接受模拟令牌）
export function superAdminMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization');
      const apiKey = extractApiKey(authHeader) || extractAuthCookie(c.req.header('Cookie'));

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
    } catch (err) {
      console.error('[auth] superAdminMiddleware error:', err);
      return c.json({ success: false, error: 'Internal server error' }, 500);
    }
  };
}

// 获取当前认证上下文
export function getAuth(c: Context): AuthContext {
  return c.get('auth');
}
