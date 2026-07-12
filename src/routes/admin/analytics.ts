import { Hono } from 'hono';
import { superAdminMiddleware } from '../../auth';
import { _statsCache, _analyticsCache, STATS_CACHE_TTL, ANALYTICS_CACHE_TTL, getIntSetting, extract } from './common';
import { getLocalDateString, convertDBTimestamp } from '../../utils';
import type { MailStatus } from '../../types';

const router = new Hono<{ Bindings: Env }>();

type AnalyticsRangeRow = { start_date: string; end_date: string };
type CountByNameRow = { status: string; c: number | string | null };
type AnalyticsSummaryRow = {
  total: number | string | null;
  active_users: number | string | null;
  sent: number | string | null;
  delivered: number | string | null;
  pending: number | string | null;
  failed: number | string | null;
  bounced: number | string | null;
  spam: number | string | null;
};
type AnalyticsDailyRow = {
  date: string;
  total: number | string | null;
  success: number | string | null;
  failed: number | string | null;
  pending: number | string | null;
};
type AnalyticsCategoryRow = {
  category: string;
  total: number | string | null;
  success: number | string | null;
  failed: number | string | null;
};
type AnalyticsTopUserRow = {
  user_id: string | null;
  user_name: string;
  user_email: string;
  total: number | string | null;
  success: number | string | null;
  failed: number | string | null;
};
type AnalyticsTopProviderRow = {
  provider_id: string | null;
  provider_name: string;
  provider_type: string;
  total: number | string | null;
  success: number | string | null;
  failed: number | string | null;
};
type AnalyticsTopAccountRow = {
  account_id: string | null;
  account_name: string;
  account_email: string;
  total: number | string | null;
  success: number | string | null;
  failed: number | string | null;
};
type AnalyticsErrorRow = {
  id: string;
  created_at: string;
  status: string;
  to_email: string;
  subject: string;
  error_message: string | null;
  user_email: string | null;
  provider_name: string | null;
  account_email: string | null;
};

function parseAnalyticsDays(raw: string | undefined): number {
  const parsed = parseInt(raw || '30', 10);
  if (Number.isNaN(parsed)) return 30;
  return Math.min(Math.max(parsed, 1), 365);
}

function toCount(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseInt(value, 10) || 0;
  return 0;
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function successRate(success: number, failed: number): number {
  const finished = success + failed;
  return finished > 0 ? roundOne((success / finished) * 100) : 0;
}

function normalizeAnalyticsSummary(row: AnalyticsSummaryRow | null, days: number) {
  const sent = toCount(row?.sent);
  const delivered = toCount(row?.delivered);
  const failed = toCount(row?.failed);
  const bounced = toCount(row?.bounced);
  const spam = toCount(row?.spam);
  const total = toCount(row?.total);
  const success = sent + delivered;
  const failure = failed + bounced + spam;

  return {
    total,
    active_users: toCount(row?.active_users),
    sent,
    delivered,
    pending: toCount(row?.pending),
    failed,
    bounced,
    spam,
    success,
    failure,
    success_rate: successRate(success, failure),
    avg_per_day: days > 0 ? roundOne(total / days) : 0,
  };
}

function countsToRecord(rows: CountByNameRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = toCount(row.c);
  return counts;
}

router.get('/stats', superAdminMiddleware(), async (c) => {
  const cached = _statsCache.entry;
  if (cached && Date.now() - cached.t < STATS_CACHE_TTL) {
    return c.json({ success: true, data: cached.data });
  }

  const today = getLocalDateString();
  const [userCount, providerCount, accountCount, templateCount, mailCount, todayMails] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE status != 'deleted'").first<{ c: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM providers').first<{ c: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM accounts').first<{ c: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM templates').first<{ c: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM mail_logs').first<{ c: number }>(),
    c.env.DB.prepare("SELECT status, COUNT(*) as c FROM mail_logs WHERE date(created_at) = ? GROUP BY status").bind(today).all<{ status: string; c: number }>(),
  ]);

  const todayStats: Record<string, number> = {};
  for (const row of todayMails.results) { todayStats[row.status] = row.c; }

  const data = {
    users: userCount?.c || 0,
    providers: providerCount?.c || 0,
    accounts: accountCount?.c || 0,
    templates: templateCount?.c || 0,
    total_mails: mailCount?.c || 0,
    today_sent: todayStats.sent || 0,
    today_failed: todayStats.failed || 0,
  };
  _statsCache.entry = { t: Date.now(), data };
  return c.json({ success: true, data });
});

router.get('/analytics', superAdminMiddleware(), async (c) => {
  const days = parseAnalyticsDays(c.req.query('days'));
  const cached = _analyticsCache.get(days);
  if (cached && Date.now() - cached.t < ANALYTICS_CACHE_TTL) {
    return c.json({ success: true, data: cached.data });
  }
  const startModifier = `-${days - 1} days`;

  const [rangeRow, summaryRow, queueRows, dailyRows, statusRows, categoryRows, topUserRows, topProviderRows, topAccountRows, errorRows] = await Promise.all([
    c.env.DB.prepare("SELECT date('now', ?) as start_date, date('now') as end_date").bind(startModifier).first<AnalyticsRangeRow>(),
    c.env.DB.prepare(
      `SELECT COUNT(*) as total,
        COUNT(DISTINCT user_id) as active_users,
        COALESCE(SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END), 0) as sent,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) as delivered,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) as failed,
        COALESCE(SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END), 0) as bounced,
        COALESCE(SUM(CASE WHEN status = 'spam' THEN 1 ELSE 0 END), 0) as spam
       FROM mail_logs
       WHERE date(created_at) >= date('now', ?)`
    ).bind(startModifier).first<AnalyticsSummaryRow>(),
    c.env.DB.prepare('SELECT status, COUNT(*) as c FROM mail_queue GROUP BY status').all<CountByNameRow>(),
    c.env.DB.prepare(
      `WITH RECURSIVE dates(d) AS (
         SELECT date('now', ?)
         UNION ALL
         SELECT date(d, '+1 day') FROM dates WHERE d < date('now')
       )
       SELECT dates.d as date,
         COUNT(ml.id) as total,
         COALESCE(SUM(CASE WHEN ml.status IN ('sent','delivered') THEN 1 ELSE 0 END), 0) as success,
         COALESCE(SUM(CASE WHEN ml.status IN ('failed','bounced','spam') THEN 1 ELSE 0 END), 0) as failed,
         COALESCE(SUM(CASE WHEN ml.status = 'pending' THEN 1 ELSE 0 END), 0) as pending
       FROM dates
       LEFT JOIN mail_logs ml ON date(ml.created_at) = dates.d
       GROUP BY dates.d
       ORDER BY dates.d ASC`
    ).bind(startModifier).all<AnalyticsDailyRow>(),
    c.env.DB.prepare(
      `SELECT status, COUNT(*) as c
       FROM mail_logs
       WHERE date(created_at) >= date('now', ?)
       GROUP BY status
       ORDER BY c DESC`
    ).bind(startModifier).all<CountByNameRow>(),
    c.env.DB.prepare(
      `SELECT COALESCE(category, 'SYSTEM') as category,
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status IN ('sent','delivered') THEN 1 ELSE 0 END), 0) as success,
        COALESCE(SUM(CASE WHEN status IN ('failed','bounced','spam') THEN 1 ELSE 0 END), 0) as failed
       FROM mail_logs
       WHERE date(created_at) >= date('now', ?)
       GROUP BY COALESCE(category, 'SYSTEM')
       ORDER BY total DESC`
    ).bind(startModifier).all<AnalyticsCategoryRow>(),
    c.env.DB.prepare(
      `SELECT ml.user_id, COALESCE(u.name, '未知用户') as user_name, COALESCE(u.email, '') as user_email,
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN ml.status IN ('sent','delivered') THEN 1 ELSE 0 END), 0) as success,
        COALESCE(SUM(CASE WHEN ml.status IN ('failed','bounced','spam') THEN 1 ELSE 0 END), 0) as failed
       FROM mail_logs ml
       LEFT JOIN users u ON u.id = ml.user_id
       WHERE date(ml.created_at) >= date('now', ?)
       GROUP BY ml.user_id
       ORDER BY total DESC
       LIMIT 8`
    ).bind(startModifier).all<AnalyticsTopUserRow>(),
    c.env.DB.prepare(
      `SELECT ml.provider_id, COALESCE(p.name, '未配置通道') as provider_name, COALESCE(p.type, '') as provider_type,
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN ml.status IN ('sent','delivered') THEN 1 ELSE 0 END), 0) as success,
        COALESCE(SUM(CASE WHEN ml.status IN ('failed','bounced','spam') THEN 1 ELSE 0 END), 0) as failed
       FROM mail_logs ml
       LEFT JOIN providers p ON p.id = ml.provider_id
       WHERE date(ml.created_at) >= date('now', ?)
       GROUP BY ml.provider_id
       ORDER BY total DESC
       LIMIT 8`
    ).bind(startModifier).all<AnalyticsTopProviderRow>(),
    c.env.DB.prepare(
      `SELECT ml.account_id, COALESCE(a.name, '未配置账号') as account_name, COALESCE(a.email, '') as account_email,
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN ml.status IN ('sent','delivered') THEN 1 ELSE 0 END), 0) as success,
        COALESCE(SUM(CASE WHEN ml.status IN ('failed','bounced','spam') THEN 1 ELSE 0 END), 0) as failed
       FROM mail_logs ml
       LEFT JOIN accounts a ON a.id = ml.account_id
       WHERE date(ml.created_at) >= date('now', ?)
       GROUP BY ml.account_id
       ORDER BY total DESC
       LIMIT 8`
    ).bind(startModifier).all<AnalyticsTopAccountRow>(),
    c.env.DB.prepare(
      `SELECT ml.id, ml.created_at, ml.status, ml.to_email, ml.subject, ml.error_message,
        u.email as user_email, p.name as provider_name, a.email as account_email
       FROM mail_logs ml
       LEFT JOIN users u ON u.id = ml.user_id
       LEFT JOIN providers p ON p.id = ml.provider_id
       LEFT JOIN accounts a ON a.id = ml.account_id
       WHERE date(ml.created_at) >= date('now', ?)
         AND ml.status IN ('failed','bounced','spam')
       ORDER BY ml.created_at DESC
       LIMIT 8`
    ).bind(startModifier).all<AnalyticsErrorRow>(),
  ]);

  const summary = normalizeAnalyticsSummary(summaryRow, days);
  const queue = countsToRecord(queueRows.results);

  const data = {
    range: {
      days,
      start_date: rangeRow?.start_date || '',
      end_date: rangeRow?.end_date || '',
    },
    summary: {
      ...summary,
      queue_queued: queue.queued || 0,
      queue_processing: queue.processing || 0,
      queue_failed: queue.failed || 0,
    },
    daily: dailyRows.results.map((row) => ({
      date: row.date,
      total: toCount(row.total),
      success: toCount(row.success),
      failed: toCount(row.failed),
      pending: toCount(row.pending),
    })),
    status_breakdown: statusRows.results.map((row) => ({
      status: row.status,
      count: toCount(row.c),
    })),
    category_breakdown: categoryRows.results.map((row) => ({
      category: row.category,
      total: toCount(row.total),
      success: toCount(row.success),
      failed: toCount(row.failed),
      success_rate: successRate(toCount(row.success), toCount(row.failed)),
    })),
    top_users: topUserRows.results.map((row) => ({
      user_id: row.user_id,
      name: row.user_name,
      email: row.user_email,
      total: toCount(row.total),
      success: toCount(row.success),
      failed: toCount(row.failed),
      success_rate: successRate(toCount(row.success), toCount(row.failed)),
    })),
    top_providers: topProviderRows.results.map((row) => ({
      provider_id: row.provider_id,
      name: row.provider_name,
      type: row.provider_type,
      total: toCount(row.total),
      success: toCount(row.success),
      failed: toCount(row.failed),
      success_rate: successRate(toCount(row.success), toCount(row.failed)),
    })),
    top_accounts: topAccountRows.results.map((row) => ({
      account_id: row.account_id,
      name: row.account_name,
      email: row.account_email,
      total: toCount(row.total),
      success: toCount(row.success),
      failed: toCount(row.failed),
      success_rate: successRate(toCount(row.success), toCount(row.failed)),
    })),
    recent_errors: errorRows.results,
  };
  _analyticsCache.set(days, { t: Date.now(), data });
  return c.json({ success: true, data });
});

router.get('/logs', superAdminMiddleware(), async (c) => {
  const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '50', 10) || 50, 1), 200);
  const offset = Math.max(parseInt(c.req.query('offset') || '0', 10) || 0, 0);
  const status = c.req.query('status') || '';
  const category = c.req.query('category') || '';
  const userId = c.req.query('user_id') || '';
  const providerId = c.req.query('provider_id') || '';
  const accountId = c.req.query('account_id') || '';
  const startDate = c.req.query('start_date') || '';
  const endDate = c.req.query('end_date') || '';
  const q = (c.req.query('q') || '').trim();

  const where: string[] = [];
  const values: (string | number)[] = [];
  const validStatuses: MailStatus[] = ['pending', 'sent', 'delivered', 'failed', 'bounced', 'spam'];
  const validCategories = ['VERIFY', 'NOTIFY', 'MARKETING', 'SYSTEM'];

  if (status) {
    if (!validStatuses.includes(status as MailStatus)) {
      return c.json({ success: false, error: 'Invalid status' }, 400);
    }
    where.push('ml.status = ?');
    values.push(status);
  }
  if (category) {
    if (!validCategories.includes(category)) {
      return c.json({ success: false, error: 'Invalid category' }, 400);
    }
    where.push('ml.category = ?');
    values.push(category);
  }
  if (userId) {
    where.push('ml.user_id = ?');
    values.push(userId);
  }
  if (providerId) {
    where.push('ml.provider_id = ?');
    values.push(providerId);
  }
  if (accountId) {
    where.push('ml.account_id = ?');
    values.push(accountId);
  }
  if (startDate) {
    where.push('date(ml.created_at) >= ?');
    values.push(startDate);
  }
  if (endDate) {
    where.push('date(ml.created_at) <= ?');
    values.push(endDate);
  }
  if (q) {
    where.push('(ml.to_email LIKE ? OR ml.subject LIKE ? OR u.email LIKE ? OR u.name LIKE ? OR a.email LIKE ?)');
    const keyword = `%${q}%`;
    values.push(keyword, keyword, keyword, keyword, keyword);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const fromSql = `FROM mail_logs ml
     LEFT JOIN users u ON u.id = ml.user_id
     LEFT JOIN api_keys ak ON ak.id = ml.api_key_id
     LEFT JOIN providers p ON p.id = ml.provider_id
     LEFT JOIN accounts a ON a.id = ml.account_id
     LEFT JOIN templates t ON t.id = ml.template_id`;

  const countStmt = c.env.DB.prepare(`SELECT COUNT(*) as total ${fromSql} ${whereSql}`);
  const countPromise = values.length > 0
    ? countStmt.bind(...values).first<{ total: number }>()
    : countStmt.first<{ total: number }>();

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(
      `SELECT ml.*, u.name as user_name, u.email as user_email,
        ak.name as api_key_name, ak.api_key_prefix,
        p.name as provider_name, p.type as provider_type,
        a.name as account_name, a.email as account_email,
        t.template_code, t.name as template_name
       ${fromSql}
       ${whereSql}
       ORDER BY ml.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(...values, limit, offset).all(),
    countPromise,
  ]);

  const resultRows = rows.results;
  for (const row of resultRows) {
    if (row.created_at) row.created_at = convertDBTimestamp(row.created_at as string) as string;
  }

  return c.json({
    success: true,
    data: resultRows,
    meta: { total: countRow?.total || 0, limit, offset },
  });
});

router.get('/logs/:id', superAdminMiddleware(), async (c) => {
  const id = c.req.param('id')!;
  const row = await c.env.DB.prepare(
    `SELECT ml.*, u.name as user_name, u.email as user_email,
      ak.name as api_key_name, ak.api_key_prefix,
      p.name as provider_name, p.type as provider_type,
      a.name as account_name, a.email as account_email,
      t.template_code, t.name as template_name
     FROM mail_logs ml
     LEFT JOIN users u ON u.id = ml.user_id
     LEFT JOIN api_keys ak ON ak.id = ml.api_key_id
     LEFT JOIN providers p ON p.id = ml.provider_id
     LEFT JOIN accounts a ON a.id = ml.account_id
     LEFT JOIN templates t ON t.id = ml.template_id
     WHERE ml.id = ?`
  ).bind(id).first();

  if (!row) return c.json({ success: false, error: 'Mail log not found' }, 404);
  if (row.created_at) row.created_at = convertDBTimestamp(row.created_at as string) as string;
  return c.json({ success: true, data: row });
});

export default router;