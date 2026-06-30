// Teaven Email - 系统设置访问层
// 提供 key-value 设置的读取与类型化访问，供路由层接入实际行为
import type { D1Database } from '@cloudflare/workers-types';

export interface SystemSetting {
  key: string;
  value: string;
  category: string;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

// 所有受支持的设置 key 及其默认值（数据库未命中时回退使用）
export const SETTING_DEFAULTS: Record<string, string> = {
  // 平台设置
  platform_name: 'Teaven Email',
  admin_contact_email: '',
  announcement: '',
  // 邮件发送
  default_max_retries: '3',
  default_daily_limit_per_user: '1000',
  // 验证码
  verification_code_ttl_minutes: '10',
  verification_code_length: '6',
  verification_max_attempts: '5',
  // 安全与维护
  maintenance_mode: '0',
  maintenance_message: '系统维护中，暂无法发送邮件，请稍后重试。',
  auto_api_key_ttl_hours: '24',
};

// 允许通过 API 更新的 key 白名单（防止任意 key 写入）
export const WRITABLE_KEYS = new Set(Object.keys(SETTING_DEFAULTS));

/**
 * 加载全部设置为一个 { key: value } 映射。
 * 数据库未命中的 key 使用 SETTING_DEFAULTS 回退。
 * 任何数据库错误都降级为默认值，确保设置系统故障不阻塞业务。
 */
export async function loadSettings(db: D1Database): Promise<Record<string, string>> {
  const result: Record<string, string> = { ...SETTING_DEFAULTS };
  try {
    const rows = await db.prepare('SELECT key, value FROM system_settings').all<{ key: string; value: string }>();
    for (const row of rows.results) {
      if (row && row.key && row.value !== undefined && row.value !== null) {
        result[row.key] = row.value;
      }
    }
  } catch (err) {
    console.warn('[settings] Failed to load system_settings, using defaults:', err);
  }
  return result;
}

/** 读取单个设置项（字符串），未配置时返回默认值 */
export async function getSetting(db: D1Database, key: string): Promise<string> {
  try {
    const row = await db.prepare('SELECT value FROM system_settings WHERE key = ?').bind(key).first<{ value: string }>();
    if (row && row.value !== undefined && row.value !== null) {
      return row.value;
    }
  } catch (err) {
    console.warn(`[settings] Failed to read setting '${key}', using default:`, err);
  }
  return SETTING_DEFAULTS[key] ?? '';
}

/** 读取整型设置项，带最小值约束 */
export async function getIntSetting(db: D1Database, key: string, min: number, fallback: number): Promise<number> {
  const raw = await getSetting(db, key);
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, n);
}

/** 维护模式是否开启 */
export async function isMaintenanceMode(db: D1Database): Promise<boolean> {
  return (await getSetting(db, 'maintenance_mode')) === '1';
}
