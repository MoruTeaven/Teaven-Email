import type { EmailProvider, ProviderConfig, ProviderType } from '../../types';
import { encryptApiKey } from '../../auth';
import { getJwtSecret } from '../../secrets';

interface CacheEntry<T> { t: number; data: T; }
const _statsCache: { entry: CacheEntry<unknown> | null } = { entry: null };
const _analyticsCache = new Map<number, CacheEntry<unknown>>();
const STATS_CACHE_TTL = 15_000;
const ANALYTICS_CACHE_TTL = 60_000;

const SENSITIVE_CONFIG_KEYS = new Set(['password', 'api_key']);
const SENSITIVE_VALUE_MASK = '********';
const ENCRYPTED_VALUE_PREFIX = 'enc:v1:';

function invalidateAdminCache() {
  _statsCache.entry = null;
  _analyticsCache.clear();
}

function parseProviderConfig(config: ProviderConfig | string): Record<string, unknown> {
  return typeof config === 'string'
    ? JSON.parse(config) as Record<string, unknown>
    : { ...(config as unknown as Record<string, unknown>) };
}

function sanitizeProviderForAdmin<T extends { config: ProviderConfig | string }>(provider: T): T {
  const config = parseProviderConfig(provider.config);
  for (const key of SENSITIVE_CONFIG_KEYS) {
    if (config[key]) config[key] = SENSITIVE_VALUE_MASK;
  }
  return { ...provider, config: config as unknown as T['config'] };
}

function mergeProviderConfigForUpdate(
  existing: EmailProvider,
  nextType: ProviderType,
  nextConfig: ProviderConfig
): ProviderConfig {
  const incoming = { ...(nextConfig as unknown as Record<string, unknown>) };
  if (nextType !== existing.type) return incoming as unknown as ProviderConfig;

  const current = parseProviderConfig(existing.config);
  for (const key of SENSITIVE_CONFIG_KEYS) {
    const value = incoming[key];
    if (value === undefined || value === '' || value === SENSITIVE_VALUE_MASK) {
      if (current[key] !== undefined) incoming[key] = current[key];
    }
  }
  return incoming as unknown as ProviderConfig;
}

async function protectProviderConfig(config: ProviderConfig, env: Env): Promise<ProviderConfig> {
  const protectedConfig = { ...(config as unknown as Record<string, unknown>) };
  for (const key of SENSITIVE_CONFIG_KEYS) {
    const value = protectedConfig[key];
    if (typeof value !== 'string' || !value) continue;
    if (value === SENSITIVE_VALUE_MASK || value.startsWith(ENCRYPTED_VALUE_PREFIX)) continue;
    // [H-3] getJwtSecret：缺失/过弱抛 SecretConfigError，绝不用空串加密服务商凭据
    const secret = getJwtSecret(env);
    protectedConfig[key] = `${ENCRYPTED_VALUE_PREFIX}${await encryptApiKey(value, secret)}`;
  }
  return protectedConfig as unknown as ProviderConfig;
}

export {
  _statsCache,
  _analyticsCache,
  STATS_CACHE_TTL,
  ANALYTICS_CACHE_TTL,
  SENSITIVE_CONFIG_KEYS,
  SENSITIVE_VALUE_MASK,
  ENCRYPTED_VALUE_PREFIX,
  invalidateAdminCache,
  parseProviderConfig,
  sanitizeProviderForAdmin,
  mergeProviderConfigForUpdate,
  protectProviderConfig,
};