import { Hono } from 'hono';
import { WRITABLE_KEYS, SETTING_DEFAULTS } from '../../settings';
import { getAuth, superAdminMiddleware } from '../../auth';
import { isValidEmail } from '../../utils';
import { invalidateAdminCache } from './common';

const router = new Hono<{ Bindings: Env }>();

const INT_SETTING_BOUNDS: Record<string, { min: number; max: number }> = {
  default_max_retries: { min: 0, max: 10 },
  default_daily_limit_per_user: { min: 0, max: 1000000 },
  verification_code_ttl_minutes: { min: 1, max: 60 },
  verification_code_length: { min: 4, max: 10 },
  verification_max_attempts: { min: 1, max: 20 },
  auto_api_key_ttl_hours: { min: 1, max: 168 },
};

function categoryOf(key: string): string {
  if (['platform_name', 'admin_contact_email', 'announcement'].includes(key)) return 'platform';
  if (['default_max_retries', 'default_daily_limit_per_user'].includes(key)) return 'mail';
  if (['verification_code_ttl_minutes', 'verification_code_length', 'verification_max_attempts'].includes(key)) return 'verification';
  if (['maintenance_mode', 'maintenance_message', 'auto_api_key_ttl_hours'].includes(key)) return 'security';
  return 'general';
}

function descriptionOf(key: string): string {
  const map: Record<string, string> = {
    platform_name: '平台名称，展示在后台与邮件中',
    admin_contact_email: '管理员联系邮箱',
    announcement: '系统公告，展示给用户（留空则不展示）',
    default_max_retries: '单封邮件默认最大重试次数',
    default_daily_limit_per_user: '单用户每日发送上限（0 表示不限制）',
    verification_code_ttl_minutes: '验证码默认有效期（分钟）',
    verification_code_length: '验证码默认长度（4-10 位）',
    verification_max_attempts: '单条验证码最大验证尝试次数',
    maintenance_mode: '维护模式开关（1=开启，开启后禁止发信）',
    maintenance_message: '维护模式开启时返回给用户的提示信息',
    auto_api_key_ttl_hours: '登录自动创建的 API Key 有效期（小时）',
  };
  return map[key] || '';
}

router.get('/settings', superAdminMiddleware(), async (c) => {
  const db = c.env.DB;
  let rows: { key: string; value: string; category: string; description: string | null; updated_at: string; updated_by: string | null }[] = [];

  try {
    const result = await db.prepare(
      'SELECT key, value, category, description, updated_at, updated_by FROM system_settings ORDER BY category, key'
    ).all();
    rows = result.results as typeof rows;
  } catch (err) {
    if (err instanceof Error && (err.message.includes('no such table') || err.message.includes('system_settings'))) {
      console.warn('[admin] system_settings table missing, returning defaults. Run migration 009.');
    } else {
      throw err;
    }
  }

  const byKey = new Map<string, typeof rows[number]>();
  for (const r of rows) byKey.set(r.key, r);
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    if (!byKey.has(key)) {
      byKey.set(key, { key, value, category: categoryOf(key), description: null, updated_at: '', updated_by: null });
    }
  }

  const grouped: Record<string, Array<{ key: string; value: string; description: string | null; updated_at: string; updated_by: string | null }>> = {};
  for (const r of byKey.values()) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push({ key: r.key, value: r.value, description: r.description, updated_at: r.updated_at, updated_by: r.updated_by });
  }

  return c.json({ success: true, data: grouped });
});

router.put('/settings', superAdminMiddleware(), async (c) => {
  const auth = getAuth(c);
  let body: Record<string, string>;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return c.json({ success: false, error: 'Body must be an object of { key: value }' }, 400);
  }

  const updates: { key: string; value: string }[] = [];
  for (const [key, rawValue] of Object.entries(body)) {
    if (!WRITABLE_KEYS.has(key)) {
      return c.json({ success: false, error: `Unknown setting key: ${key}` }, 400);
    }
    let value = String(rawValue ?? '');

    const bounds = INT_SETTING_BOUNDS[key];
    if (bounds) {
      const n = parseInt(value, 10);
      if (Number.isNaN(n)) {
        return c.json({ success: false, error: `Setting '${key}' must be an integer` }, 400);
      }
      value = String(Math.min(Math.max(n, bounds.min), bounds.max));
    }

    if (key === 'maintenance_mode') {
      value = (value === '1' || value === 'true') ? '1' : '0';
    }

    if (key === 'admin_contact_email' && value && !isValidEmail(value)) {
      return c.json({ success: false, error: 'admin_contact_email 格式不合法' }, 400);
    }

    updates.push({ key, value });
  }

  if (updates.length === 0) {
    return c.json({ success: false, error: 'Nothing to update' }, 400);
  }

  try {
    for (const u of updates) {
      await c.env.DB.prepare(
        `INSERT INTO system_settings (key, value, category, description, updated_at, updated_by)
         VALUES (?, ?, ?, ?, datetime('now'), ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now'), updated_by = excluded.updated_by`
      ).bind(u.key, u.value, categoryOf(u.key), descriptionOf(u.key), auth.userId).run();
    }
  } catch (err) {
    if (err instanceof Error && (err.message.includes('no such table') || err.message.includes('system_settings'))) {
      return c.json({ success: false, error: 'system_settings 表不存在，请先执行 migration 009' }, 500);
    }
    throw err;
  }

  return c.json({ success: true, message: '设置已保存', data: { updated: updates.length } });
});

export default router;