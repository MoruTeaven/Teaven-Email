import { Hono } from 'hono';
import { getAuth, superAdminMiddleware } from '../../auth';
import { getDB } from '../../db';
import { sendEmail } from '../../mailer';
import { uuidv7 } from '../../uuid';
import { escapeHtml } from '../../utils';
import { invalidateAdminCache, sanitizeProviderForAdmin, protectProviderConfig, mergeProviderConfigForUpdate } from './common';
import type { ProviderConfig, ProviderType } from '../../types';

const router = new Hono<{ Bindings: Env }>();

router.get('/providers', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const rows = await db.getAllProviders();
  return c.json({ success: true, data: rows.map(sanitizeProviderForAdmin) });
});

router.post('/providers', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);

  let body: { name: string; type: string; config: Record<string, unknown>; priority?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  if (!body.name || !body.type || !body.config) {
    return c.json({ success: false, error: 'name, type, config are required' }, 400);
  }
  if (!['smtp', 'api', 'cloudflare_email'].includes(body.type)) {
    return c.json({ success: false, error: 'type must be smtp, api, or cloudflare_email' }, 400);
  }

  let protectedConfig: ProviderConfig;
  try {
    protectedConfig = await protectProviderConfig(body.config as unknown as ProviderConfig, c.env);
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : 'Failed to protect provider config' }, 500);
  }

  const provider = {
    id: uuidv7(),
    name: body.name,
    type: body.type as ProviderType,
    config: protectedConfig,
    priority: body.priority || 0,
    enabled: 1,
  };

  await db.createProvider(provider);
  invalidateAdminCache();
  return c.json({ success: true, data: sanitizeProviderForAdmin(provider) }, 201);
});

router.put('/providers/:id', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id')!;

  const existing = await db.getProviderById(id);
  if (!existing) return c.json({ success: false, error: 'Provider not found' }, 404);

  let body: { name?: string; type?: ProviderType; config?: ProviderConfig; priority?: number; enabled?: number };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  if (body.config) {
    try {
      body.config = await protectProviderConfig(
        mergeProviderConfigForUpdate(existing, body.type || existing.type, body.config),
        c.env
      );
    } catch (err) {
      return c.json({ success: false, error: err instanceof Error ? err.message : 'Failed to protect provider config' }, 500);
    }
  }

  await db.updateProvider(id, body);
  invalidateAdminCache();
  return c.json({ success: true, message: 'Provider updated' });
});

router.delete('/providers/:id', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id')!;
  await db.deleteProvider(id);
  invalidateAdminCache();
  return c.json({ success: true, message: 'Provider deleted' });
});

router.get('/accounts', superAdminMiddleware(), async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT a.*, p.name as provider_name, p.type as provider_type,
       (SELECT COUNT(*) FROM mail_logs ml
        WHERE ml.account_id = a.id
          AND ml.status IN ('sent','delivered')
          AND date(ml.created_at) = date('now')) as sent_today
     FROM accounts a LEFT JOIN providers p ON a.provider_id = p.id
     ORDER BY a.created_at DESC`
  ).all();
  return c.json({ success: true, data: rows.results });
});

router.post('/accounts', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);

  let body: { provider_id: string; name: string; email: string; display_name?: string; daily_limit?: number; categories?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  if (!body.provider_id || !body.name || !body.email) {
    return c.json({ success: false, error: 'provider_id, name, email are required' }, 400);
  }

  if (body.categories) {
    const parts = body.categories.split(',').map(s => s.trim()).filter(Boolean);
    const validCategories = ['VERIFY', 'NOTIFY', 'MARKETING', 'SYSTEM'];
    for (const p of parts) {
      if (!validCategories.includes(p)) {
        return c.json({ success: false, error: `Invalid category: ${p}. Valid: ${validCategories.join(', ')}` }, 400);
      }
    }
    body.categories = parts.join(',');
  }

  const provider = await db.getProviderById(body.provider_id);
  if (!provider) {
    return c.json({ success: false, error: 'Provider not found' }, 404);
  }

  const account = {
    id: uuidv7(),
    provider_id: body.provider_id,
    name: body.name,
    email: body.email,
    display_name: body.display_name || null,
    config: null,
    daily_limit: body.daily_limit || 1000,
    sent_today: 0,
    categories: body.categories || '',
    enabled: 1,
  };

  await db.createAccount(account);

  invalidateAdminCache();
  return c.json({ success: true, data: account }, 201);
});

router.delete('/accounts/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id')!;
  await c.env.DB.prepare('DELETE FROM accounts WHERE id = ?').bind(id).run();
  invalidateAdminCache();
  return c.json({ success: true });
});

router.put('/accounts/:id', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const id = c.req.param('id')!;

  const existing = await db.getAccountById(id);
  if (!existing) return c.json({ success: false, error: 'Account not found' }, 404);

  let body: { enabled?: number; daily_limit?: number; display_name?: string; name?: string; email?: string; provider_id?: string; categories?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  if (body.categories !== undefined) {
    const parts = body.categories.split(',').map(s => s.trim()).filter(Boolean);
    const validCategories = ['VERIFY', 'NOTIFY', 'MARKETING', 'SYSTEM'];
    for (const p of parts) {
      if (!validCategories.includes(p)) {
        return c.json({ success: false, error: `Invalid category: ${p}. Valid: ${validCategories.join(', ')}` }, 400);
      }
    }
    body.categories = parts.join(',');
  }

  if (body.provider_id) {
    const provider = await db.getProviderById(body.provider_id);
    if (!provider) return c.json({ success: false, error: 'Provider not found' }, 404);
  }

  const sets: string[] = [];
  const vals: unknown[] = [];
  if (body.enabled !== undefined) { sets.push('enabled = ?'); vals.push(body.enabled); }
  if (body.daily_limit !== undefined) { sets.push('daily_limit = ?'); vals.push(body.daily_limit); }
  if (body.display_name !== undefined) { sets.push('display_name = ?'); vals.push(body.display_name); }
  if (body.name !== undefined) { sets.push('name = ?'); vals.push(body.name); }
  if (body.email !== undefined) { sets.push('email = ?'); vals.push(body.email); }
  if (body.provider_id !== undefined) { sets.push('provider_id = ?'); vals.push(body.provider_id); }
  if (body.categories !== undefined) { sets.push('categories = ?'); vals.push(body.categories); }
  if (sets.length === 0) return c.json({ success: false, error: 'Nothing to update' }, 400);

  sets.push("updated_at = datetime('now')");
  vals.push(id);
  await c.env.DB.prepare(`UPDATE accounts SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  invalidateAdminCache();
  return c.json({ success: true });
});

router.post('/accounts/:id/test', superAdminMiddleware(), async (c) => {
  const db = getDB(c.env.DB);
  const auth = getAuth(c);
  const id = c.req.param('id')!;

  const account = await db.getAccountById(id);
  if (!account) {
    return c.json({ success: false, error: 'Account not found' }, 404);
  }

  const provider = await db.getProviderById(account.provider_id);
  if (!provider) {
    return c.json({ success: false, error: 'Associated provider not found' }, 404);
  }

  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }

  const toEmail = body.to || account.email;

  const result = await sendEmail(provider, {
    from: account.email,
    fromName: account.display_name || undefined,
    to: toEmail,
    subject: '[Teaven Email] 测试邮件 - 账号配置验证',
    html: '<div style="font-family: -apple-system, BlinkMacSystemFont, \'PingFang SC\', \'Microsoft YaHei\', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">' +
  '<div style="text-align: center; margin-bottom: 32px;">' +
    '<div style="display: inline-block; width: 48px; height: 48px; background: #f97316; border-radius: 12px; text-align: center; line-height: 48px; font-size: 24px; font-weight: bold; color: white; margin-bottom: 16px;">T</div>' +
    '<h2 style="margin: 0; font-size: 20px; color: #1f2937;">Teaven Email 测试邮件</h2>' +
    '<p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">这是一封自动发送的测试邮件，用于验证发件账号配置是否正确。</p>' +
  '</div>' +
  '<table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">' +
    '<tr><td style="padding: 10px 16px; background: #f9fafb; font-weight: 600; font-size: 13px; color: #4b5563; width: 100px;">账号名称</td><td style="padding: 10px 16px; font-size: 14px; color: #1f2937;">' + escapeHtml(account.name) + '</td></tr>' +
    '<tr><td style="padding: 10px 16px; background: #f9fafb; font-weight: 600; font-size: 13px; color: #4b5563;">发件邮箱</td><td style="padding: 10px 16px; font-size: 14px; color: #1f2937;">' + escapeHtml(account.email) + '</td></tr>' +
    '<tr><td style="padding: 10px 16px; background: #f9fafb; font-weight: 600; font-size: 13px; color: #4b5563;">发送通道</td><td style="padding: 10px 16px; font-size: 14px; color: #1f2937;">' + escapeHtml(provider.name) + ' (' + escapeHtml(provider.type) + ')</td></tr>' +
    '<tr><td style="padding: 10px 16px; background: #f9fafb; font-weight: 600; font-size: 13px; color: #4b5563;">发送时间</td><td style="padding: 10px 16px; font-size: 14px; color: #1f2937;">' + new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + '</td></tr>' +
  '</table>' +
  '<div style="margin-top: 24px; padding: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">' +
    '<p style="margin: 0; font-size: 14px; color: #059669;">如果你收到了这封邮件，说明发件账号 <strong>' + escapeHtml(account.name) + '</strong> 配置正确，可以正常使用。</p>' +
  '</div>' +
'</div>',
  }, c.env);

  await db.createMailLog({
    id: uuidv7(),
    user_id: auth.userId,
    api_key_id: auth.apiKeyId,
    template_id: null,
    provider_id: provider.id,
    account_id: account.id,
    category: 'SYSTEM',
    to_email: toEmail,
    subject: '[Teaven Email] 测试邮件 - 账号配置验证',
    status: result.success ? 'sent' : 'failed',
    provider_response: result.providerResponse || null,
    error_message: result.error || null,
    retry_count: 0,
    // [tsc 门禁] 不落库请求参数：mail_logs.request_params 可能含模板变量（验证码/PII），见 [H-2] 脱敏约定
    request_params: null,
  });

  invalidateAdminCache();
  if (result.success) {
    return c.json({ success: true, message: '测试邮件发送成功', messageId: result.messageId });
  }
  return c.json({ success: false, error: result.error || '发送失败', detail: result.providerResponse });
});

export default router;