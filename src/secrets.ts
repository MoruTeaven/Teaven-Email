// Teaven Email - 密钥运行时校验（fail-fast）
//
// 任务：[安全][H-3] JWT_SECRET / IMPERSONATION_SECRET 缺失时的兜底风险
//
// 设计原则：
//  1. 严禁默认值。密钥缺失/过弱/被复用 → 抛 SecretConfigError，绝不返回空串。
//     （空串不是"安全的无效值"：PBKDF2 可用空 secret 派生出确定的 AES 密钥，
//       一旦有人去掉 `secret ? ... : null` 这类三元保护，就会静默加密成可预测密文。）
//  2. 按用途分离。IMPERSONATION_SECRET 不再回落复用 JWT_SECRET：
//     JWT_SECRET 参与 AES 加密（服务商凭据 / API Key 密文），
//     IMPERSONATION_SECRET 参与 HMAC 签名（管理员模拟登录令牌）。
//     共用一把意味着加密密钥泄露即可伪造任意用户会话，反之亦然（全站接管 + 绕开密码/2FA）。
//  3. 早失败、明确失败。错误信息只描述"配置缺什么、怎么补"，绝不回显任何密钥内容。
//
// 接入方式（Workers 无法在模块顶层读取 env，因此在三个入口的首行做同步校验）：
//   - src/index.ts  fetch()      → try { assertRuntimeSecrets(env) } catch { return 503 }
//   - src/index.ts  scheduled()  → assertRuntimeSecrets(env)   // cron 直接失败，让漏配可见
//   - src/queue_processor.ts     → assertRuntimeSecrets(env)   // 同上
// 请求路径上的取值一律改用 getJwtSecret(env) / getImpersonationSecret(env)，
// 删除所有 `env.JWT_SECRET || ''` 形式的兜底。

export const MIN_SECRET_BYTES = 32; // ≥ 256-bit，对齐 HMAC-SHA256 / AES-256 强度

const KNOWN_PLACEHOLDER_MARKERS: readonly string[] = [
  'changeme',
  'change-me',
  'change_me',
  'placeholder',
  'your-secret',
  'your_secret',
  'yoursecret',
  'secret123',
  'password',
  'qwerty',
  '123456',
  'example',
  'sample',
  'dummy',
  'todo',
  'lorem',
  'teaven-email-jwt',
  'teaven-email-secret',
  'teaven-identity-jwt',
  'jwt-signing-key',
  'signing-key-change',
  'dev-only',
  'development',
];

/** 密钥配置错误。message 可安全展示给运维/日志，不含任何密钥内容。 */
export class SecretConfigError extends Error {
  readonly secretName: string;

  constructor(secretName: string, message: string) {
    super(message);
    this.name = 'SecretConfigError';
    this.secretName = secretName;
  }
}

function maskName(name: string): string {
  return name;
}

/**
 * 校验单个密钥：存在、无多余空白、长度达标、非占位串、字符多样性足够。
 * 通过则原样返回该字符串（调用方仍持有原值，本函数不复制不缓存明文）。
 */
export function requireSecret(name: string, value: unknown): string {
  if (value === undefined || value === null) {
    throw new SecretConfigError(
      name,
      `${maskName(name)} 未配置。请用 "npx wrangler secret put ${name}" 写入一个 ≥${MIN_SECRET_BYTES} 字节的随机串后重新部署；` +
        "本服务不提供任何内置默认密钥。",
    );
  }
  if (typeof value !== 'string') {
    throw new SecretConfigError(name, `${maskName(name)} 必须是字符串（当前类型：${typeof value}）。`);
  }
  if (value.length === 0) {
    throw new SecretConfigError(
      name,
      `${maskName(name)} 为空串。空密钥会被拒绝启动：严禁使用默认值或空值兜底。请执行 "npx wrangler secret put ${name}"。`,
    );
  }
  if (value !== value.trim()) {
    throw new SecretConfigError(
      name,
      `${maskName(name)} 首尾含有空白字符（多半是粘贴时带入了空格或换行），已拒绝使用。`,
    );
  }
  // 长度按 UTF-8 字节数判定，避免多字节字符被当成足长密钥
  const byteLength = new TextEncoder().encode(value).length;
  if (byteLength < MIN_SECRET_BYTES) {
    throw new SecretConfigError(
      name,
      `${maskName(name)} 强度不足：${byteLength} 字节，要求 ≥${MIN_SECRET_BYTES} 字节。` +
        '请用随机字节生成（例如 node -p 配合 crypto.randomBytes(48).toString("base64url")），再 wrangler secret put 写入。',
    );
  }
  const lower = value.toLowerCase();
  for (const marker of KNOWN_PLACEHOLDER_MARKERS) {
    if (lower.includes(marker)) {
      throw new SecretConfigError(
        name,
        `${maskName(name)} 命中已知占位/示例串（"${marker}"），已拒绝使用。密钥必须是随机生成的。`,
      );
    }
  }
  // 重复字符拼出来的"长密钥"熵极低
  const distinct = new Set(value.split('')).size;
  if (distinct < 12) {
    throw new SecretConfigError(
      name,
      `${maskName(name)} 熵不足：仅 ${distinct} 种不同字符（要求 ≥12）。请使用随机串。`,
    );
  }
  return value;
}

/** 两把密钥必须彼此独立：相等或互为前缀都算复用，直接拒绝。 */
export function assertDistinctSecrets(
  aName: string,
  aValue: string,
  bName: string,
  bValue: string,
): void {
  if (aValue === bValue) {
    throw new SecretConfigError(
      bName,
      `${maskName(aName)} 与 ${maskName(bName)} 使用了同一个值。不同用途必须使用独立密钥` +
        "（加密密钥与签名密钥复用 = 一把泄露两半体系同时失守）。请为二者分别生成随机密钥。",
    );
  }
  const shorter = aValue.length <= bValue.length ? aValue : bValue;
  const longer = aValue.length <= bValue.length ? bValue : aValue;
  if (longer.startsWith(shorter)) {
    throw new SecretConfigError(
      bName,
      `${maskName(aName)} 与 ${maskName(bName)} 存在前缀复用（像是同一串派生的）。请各自独立生成。`,
    );
  }
}

export interface SecretEnvLike {
  JWT_SECRET?: string;
  IMPERSONATION_SECRET?: string;
}

// per-isolate memo：只做引用比较，不参与任何安全判定，避免每请求重复校验
let memoJwt: unknown = undefined;
let memoImp: unknown = undefined;
let memoEnvRef: unknown = undefined;

/** 校验并返回 JWT_SECRET（会话 / 凭据加密用途）。缺失即抛错。 */
export function getJwtSecret(env: SecretEnvLike): string {
  const value = requireSecret('JWT_SECRET', env.JWT_SECRET);
  memoJwt = value;
  return value;
}

/**
 * 校验并返回 IMPERSONATION_SECRET（管理员模拟登录签名用途）。
 * 注意：这里刻意**不回落**到 JWT_SECRET —— 旧的回落链会让模拟登录令牌
 * 与会话加密共用一把密钥，是全站接管风险的主要来源。
 */
export function getImpersonationSecret(env: SecretEnvLike): string {
  const value = requireSecret('IMPERSONATION_SECRET', env.IMPERSONATION_SECRET);
  const jwt = memoJwt !== undefined && memoJwt === env.JWT_SECRET ? memoJwt : requireSecret('JWT_SECRET', env.JWT_SECRET);
  assertDistinctSecrets('JWT_SECRET', String(jwt), 'IMPERSONATION_SECRET', value);
  memoImp = value;
  return value;
}

/**
 * 入口级总校验：在 fetch / scheduled / queue 的首行调用。
 * 两个密钥都必须存在、足强、互不共用，否则拒绝服务。
 */
export function assertRuntimeSecrets(env: SecretEnvLike): void {
  if (memoEnvRef === env && memoJwt === env.JWT_SECRET && memoImp === env.IMPERSONATION_SECRET) {
    return;
  }
  const jwt = getJwtSecret(env);
  const imp = getImpersonationSecret(env);
  assertDistinctSecrets('JWT_SECRET', jwt, 'IMPERSONATION_SECRET', imp);
  memoEnvRef = env;
}

/**
 * Webhook 签名密钥校验。webhook secret 属于"每用户可选配置"，
 * 未配置时**必须显式跳过签名**，而不是用空串去 HMAC
 * （WebCrypto 对零长密钥抛 DataError，旧代码的 catch {} 会让整条投递静默失败）。
 */
export function resolveWebhookSigningSecret(secret: unknown): string | null {
  if (secret === undefined || secret === null || secret === '') return null;
  if (typeof secret !== 'string') {
    throw new SecretConfigError('webhook secret', 'webhook 签名密钥必须是字符串。');
  }
  if (secret === 'changeme' || secret.toLowerCase().includes('placeholder')) {
    throw new SecretConfigError('webhook secret', 'webhook 签名密钥是占位值，已拒绝使用。');
  }
  return secret;
}

/** 可安全返回给客户端的错误摘要：不含密钥值，只含原因类别。 */
export function describeSecretError(err: unknown): string {
  if (err instanceof SecretConfigError) {
    return `${err.secretName}: ${err.message}`;
  }
  return 'Unexpected error while validating runtime secrets';
}
