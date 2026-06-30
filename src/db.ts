// Teaven Email - 数据库访问层
import type { D1Database } from '@cloudflare/workers-types';
import type {
  User, ApiKey, EmailProvider, PublicEmailProvider, Account, Template,
  TemplateVersion, MailLog, MailQueueItem, Webhook,
  VerificationCode
} from './types';
import { uuidv7 } from './uuid';

export function getDB(db: D1Database) {
  return {
    // ============ Users ============
    async getUserById(id: string): Promise<User | null> {
      return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<User>();
    },

    async getUserByEmail(email: string): Promise<User | null> {
      return db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<User>();
    },

    async createUser(user: Omit<User, 'created_at' | 'updated_at'>): Promise<void> {
      await db.prepare(
        `INSERT INTO users (id, name, email, password_hash, status, is_super_admin)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(user.id, user.name, user.email, user.password_hash, user.status, user.is_super_admin || 0).run();
    },

    async getUsersBySuperAdmin(): Promise<User[]> {
      const result = await db.prepare(
        'SELECT * FROM users WHERE status != ? ORDER BY created_at DESC'
      ).bind('deleted').all<User>();
      return result.results;
    },

    // ============ API Keys ============
    async getApiKeyByHash(hash: string): Promise<ApiKey | null> {
      return db.prepare('SELECT * FROM api_keys WHERE api_key_hash = ? AND enabled = 1')
        .bind(hash).first<ApiKey>();
    },

    async getApiKeysByUser(userId: string, includeAutoCreated: boolean = false): Promise<ApiKey[]> {
      try {
        // 优先走完整查询（依赖 migration 005 的 auto_created / expires_at 列）
        const sql = includeAutoCreated
          ? 'SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC'
          : 'SELECT * FROM api_keys WHERE user_id = ? AND auto_created = 0 ORDER BY created_at DESC';
        const result = await db.prepare(sql).bind(userId).all<ApiKey>();
        return result.results;
      } catch (err) {
        // 如果 migration 005 尚未应用到生产库，auto_created 列不存在
        // 降级：不做 auto_created 过滤，应用层自行处理
        if (err instanceof Error && (err.message.includes('auto_created') || err.message.includes('no such column'))) {
          console.warn('[db] auto_created column missing, falling back to unfiltered query. Run migration 005.');
          const result = await db.prepare(
            'SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC'
          ).bind(userId).all<ApiKey>();
          return result.results;
        }
        throw err;
      }
    },

    async createApiKey(apiKey: Omit<ApiKey, 'created_at' | 'updated_at'>): Promise<void> {
      try {
        await db.prepare(
          `INSERT INTO api_keys (id, user_id, name, api_key_hash, api_key_prefix, api_key_encrypted, permissions, enabled, auto_created, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          apiKey.id, apiKey.user_id, apiKey.name, apiKey.api_key_hash,
          apiKey.api_key_prefix, apiKey.api_key_encrypted ?? null,
          JSON.stringify(apiKey.permissions), apiKey.enabled,
          apiKey.auto_created ?? 0, apiKey.expires_at ?? null
        ).run();
      } catch (err) {
        // 兼容旧 migration 未应用的情况
        if (err instanceof Error && (err.message.includes('auto_created') || err.message.includes('no such column'))) {
          console.warn('[db] auto_created column missing, creating api key without auto_created/expires_at. Run migration 005.');
          await db.prepare(
            `INSERT INTO api_keys (id, user_id, name, api_key_hash, api_key_prefix, permissions, enabled)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            apiKey.id, apiKey.user_id, apiKey.name, apiKey.api_key_hash,
            apiKey.api_key_prefix, JSON.stringify(apiKey.permissions), apiKey.enabled
          ).run();
          return;
        }
        throw err;
      }
    },

    async updateApiKeyLastUsed(id: string): Promise<void> {
      await db.prepare(
        `UPDATE api_keys SET last_used_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
      ).bind(id).run();
    },

    async getApiKeyById(id: string): Promise<ApiKey | null> {
      return db.prepare('SELECT * FROM api_keys WHERE id = ?').bind(id).first<ApiKey>();
    },

    async deleteApiKey(id: string, userId: string): Promise<void> {
      await db.prepare(
        'DELETE FROM api_keys WHERE id = ? AND user_id = ?'
      ).bind(id, userId).run();
    },

    async toggleApiKey(id: string, userId: string, enabled: number): Promise<void> {
      await db.prepare(
        `UPDATE api_keys SET enabled = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`
      ).bind(enabled, id, userId).run();
    },

    async cleanupExpiredKeys(): Promise<number> {
      try {
        const result = await db.prepare(
          `DELETE FROM api_keys WHERE auto_created = 1 AND expires_at IS NOT NULL AND expires_at <= datetime('now')`
        ).run();
        return result.meta?.changes ?? 0;
      } catch (err) {
        // 兼容 migration 005 未应用到生产库的情况（auto_created / expires_at 列不存在）
        if (err instanceof Error && (err.message.includes('auto_created') || err.message.includes('no such column'))) {
          console.warn('[db] auto_created column missing, skipping cleanupExpiredKeys. Run migration 005.');
          return 0;
        }
        throw err;
      }
    },

    // ============ 发送通道 (全局，不绑定用户) ============
    async getAllProviders(): Promise<EmailProvider[]> {
      const result = await db.prepare(
        'SELECT * FROM providers ORDER BY priority DESC'
      ).all<EmailProvider>();
      return result.results;
    },

    async getPublicProviders(): Promise<PublicEmailProvider[]> {
      const result = await db.prepare(
        'SELECT id, name, type, enabled FROM providers ORDER BY priority DESC'
      ).all<PublicEmailProvider>();
      return result.results;
    },

    async getProviderById(id: string): Promise<EmailProvider | null> {
      return db.prepare(
        'SELECT * FROM providers WHERE id = ?'
      ).bind(id).first<EmailProvider>();
    },

    async getEnabledProviders(): Promise<EmailProvider[]> {
      const result = await db.prepare(
        'SELECT * FROM providers WHERE enabled = 1 ORDER BY priority DESC'
      ).all<EmailProvider>();
      return result.results;
    },

    async createProvider(provider: Omit<EmailProvider, 'created_at' | 'updated_at'>): Promise<void> {
      await db.prepare(
        `INSERT INTO providers (id, name, type, config, priority, enabled)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        provider.id, provider.name, provider.type,
        JSON.stringify(provider.config), provider.priority, provider.enabled
      ).run();
    },

    async updateProvider(id: string, updates: Partial<EmailProvider>): Promise<void> {
      const fields: string[] = [];
      const values: unknown[] = [];
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          fields.push(`${key} = ?`);
          values.push(key === 'config' ? JSON.stringify(value) : value);
        }
      }
      if (fields.length === 0) return;
      fields.push("updated_at = datetime('now')");
      values.push(id);
      await db.prepare(
        `UPDATE providers SET ${fields.join(', ')} WHERE id = ?`
      ).bind(...values).run();
    },

    async deleteProvider(id: string): Promise<void> {
      await db.prepare(
        'DELETE FROM providers WHERE id = ?'
      ).bind(id).run();
    },

    // ============ Accounts (全局，不绑定用户) ============
    async getAllAccounts(): Promise<Account[]> {
      const result = await db.prepare(
        'SELECT * FROM accounts ORDER BY created_at DESC'
      ).all<Account>();
      return result.results;
    },

    async getEnabledAccountsByProvider(providerId: string): Promise<Account[]> {
      const result = await db.prepare(
        'SELECT * FROM accounts WHERE provider_id = ? AND enabled = 1 ORDER BY daily_limit ASC'
      ).bind(providerId).all<Account>();
      return result.results;
    },

    async getAccountById(id: string): Promise<Account | null> {
      return db.prepare('SELECT * FROM accounts WHERE id = ?').bind(id).first<Account>();
    },

    async createAccount(account: Omit<Account, 'created_at' | 'updated_at'>): Promise<void> {
      await db.prepare(
        `INSERT INTO accounts (id, provider_id, name, email, display_name, config, daily_limit, sent_today, categories, enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        account.id, account.provider_id, account.name,
        account.email, account.display_name, account.config,
        account.daily_limit, account.sent_today,
        account.categories || '',
        account.enabled
      ).run();
    },

    async incrementAccountSent(id: string): Promise<void> {
      await db.prepare(
        `UPDATE accounts SET sent_today = sent_today + 1, updated_at = datetime('now')
         WHERE id = ?`
      ).bind(id).run();
    },

    async resetAllAccountSentToday(): Promise<void> {
      await db.prepare(
        `UPDATE accounts SET sent_today = 0, updated_at = datetime('now')`
      ).run();
    },

    async deleteAccount(id: string): Promise<void> {
      await db.prepare(
        'DELETE FROM accounts WHERE id = ?'
      ).bind(id).run();
    },



    // ============ Templates ============
    async getTemplatesByUser(userId: string): Promise<Template[]> {
      const result = await db.prepare(
        `SELECT t.* FROM templates t
         WHERE t.user_id = ? AND t.enabled = 1
         AND t.version = (SELECT MAX(version) FROM templates WHERE user_id = t.user_id AND template_code = t.template_code)
         ORDER BY t.created_at DESC`
      ).bind(userId).all<Template>();
      return result.results;
    },

    async getTemplateByCode(userId: string, templateCode: string, version?: number): Promise<Template | null> {
      if (version) {
        return db.prepare(
          'SELECT * FROM templates WHERE user_id = ? AND template_code = ? AND version = ? AND enabled = 1'
        ).bind(userId, templateCode, version).first<Template>();
      }
      return db.prepare(
        `SELECT * FROM templates WHERE user_id = ? AND template_code = ? AND enabled = 1
         ORDER BY version DESC LIMIT 1`
      ).bind(userId, templateCode).first<Template>();
    },

    async getTemplateById(id: string, userId: string): Promise<Template | null> {
      return db.prepare(
        'SELECT * FROM templates WHERE id = ? AND user_id = ?'
      ).bind(id, userId).first<Template>();
    },

    async createTemplate(template: Omit<Template, 'created_at' | 'updated_at'>): Promise<void> {
      await db.prepare(
        `INSERT INTO templates (id, user_id, template_code, name, category, version, subject, html, text_content, variables, enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        template.id, template.user_id, template.template_code, template.name,
        template.category, template.version, template.subject, template.html,
        template.text_content, JSON.stringify(template.variables), template.enabled
      ).run();
    },

    async updateTemplate(id: string, userId: string, updates: Partial<Template>): Promise<void> {
      const fields: string[] = [];
      const values: unknown[] = [];
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && key !== 'id' && key !== 'user_id' && key !== 'created_at') {
          fields.push(`${key} = ?`);
          values.push(key === 'variables' ? JSON.stringify(value) : value);
        }
      }
      if (fields.length === 0) return;
      fields.push("updated_at = datetime('now')");
      values.push(id, userId);
      await db.prepare(
        `UPDATE templates SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`
      ).bind(...values).run();
    },

    async deleteTemplate(id: string, userId: string): Promise<void> {
      await db.prepare(
        'DELETE FROM templates WHERE id = ? AND user_id = ?'
      ).bind(id, userId).run();
    },

    // ============ Template Versions ============
    async createTemplateVersion(version: Omit<TemplateVersion, 'created_at'>): Promise<void> {
      await db.prepare(
        `INSERT INTO template_versions (id, template_id, version, subject, html, text_content, variables, changelog)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        version.id, version.template_id, version.version, version.subject,
        version.html, version.text_content, JSON.stringify(version.variables), version.changelog
      ).run();
    },

    async getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
      const result = await db.prepare(
        'SELECT * FROM template_versions WHERE template_id = ? ORDER BY version DESC'
      ).bind(templateId).all<TemplateVersion>();
      return result.results;
    },

    // ============ Category-Based Account Routing ============
    // 分类路由已合并到 accounts 表，通过 categories 字段（逗号分隔）匹配。
    // 查询已启用且未超每日限额的账号，按 sent_today 升序（最少用的优先）。

    async getAccountsByCategory(category: string): Promise<Account[]> {
      const result = await db.prepare(
        `SELECT * FROM accounts
         WHERE enabled = 1
           AND sent_today < daily_limit
           AND (',' || categories || ',') LIKE ?
         ORDER BY sent_today ASC`
      ).bind(`%,${category},%`).all<Account>();
      return result.results;
    },

    // ============ Mail Logs ============
    async createMailLog(log: Omit<MailLog, 'created_at'>): Promise<void> {
      await db.prepare(
        `INSERT INTO mail_logs (id, user_id, api_key_id, template_id, provider_id, account_id, category, to_email, subject, status, provider_response, error_message, retry_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        log.id, log.user_id, log.api_key_id, log.template_id, log.provider_id,
        log.account_id, log.category, log.to_email, log.subject, log.status,
        log.provider_response, log.error_message, log.retry_count
      ).run();
    },

    async updateMailLogStatus(id: string, status: string, providerResponse?: string, errorMessage?: string): Promise<void> {
      const retryIncrement = status === 'failed' || (status === 'pending' && !!errorMessage) ? 1 : 0;
      await db.prepare(
        `UPDATE mail_logs SET status = ?, provider_response = ?, error_message = ?, retry_count = retry_count + ?
         WHERE id = ?`
      ).bind(status, providerResponse || null, errorMessage || null, retryIncrement, id).run();
    },

    async getMailLogs(userId: string, limit: number = 50, offset: number = 0): Promise<MailLog[]> {
      const result = await db.prepare(
        'SELECT * FROM mail_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).bind(userId, limit, offset).all<MailLog>();
      return result.results;
    },

    // ============ Mail Queue ============
    async createQueueItem(item: Omit<MailQueueItem, 'created_at'>): Promise<void> {
      await db.prepare(
        `INSERT INTO mail_queue (id, mail_log_id, user_id, provider_id, account_id, to_email, subject, html, text_content, category, priority, status, scheduled_at, next_retry_at, retry_count, max_retries)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        item.id, item.mail_log_id, item.user_id, item.provider_id, item.account_id,
        item.to_email, item.subject, item.html, item.text_content, item.category,
        item.priority, item.status, item.scheduled_at, item.next_retry_at,
        item.retry_count, item.max_retries
      ).run();
    },

    async getPendingQueueItems(limit: number = 10): Promise<MailQueueItem[]> {
      const now = new Date().toISOString();
      const result = await db.prepare(
        `SELECT * FROM mail_queue
         WHERE status = 'queued'
         AND (scheduled_at IS NULL OR scheduled_at <= ?)
         AND (next_retry_at IS NULL OR next_retry_at <= ?)
         ORDER BY priority DESC, created_at ASC
         LIMIT ?`
      ).bind(now, now, limit).all<MailQueueItem>();
      return result.results;
    },

    async updateQueueItemStatus(id: string, status: string, _errorMessage?: string, retry?: boolean): Promise<void> {
      const fields = ['status = ?'];
      const values: unknown[] = [status];

      if (retry) {
        // 临时失败，等待重试：递增 retry_count，设置下次重试时间，状态回到 queued
        fields.push('retry_count = retry_count + 1');
        fields.push(`next_retry_at = datetime('now', '+' || (retry_count + 1) * 30 || ' seconds')`);
      } else if (status === 'failed') {
        // 永久失败，记录错误
        fields.push('retry_count = retry_count + 1');
      }

      values.push(id);
      await db.prepare(
        `UPDATE mail_queue SET ${fields.join(', ')} WHERE id = ?`
      ).bind(...values).run();
    },

    // ============ Webhooks ============
    async getWebhooks(userId: string): Promise<Webhook[]> {
      const result = await db.prepare(
        'SELECT * FROM webhooks WHERE user_id = ? AND enabled = 1'
      ).bind(userId).all<Webhook>();
      return result.results;
    },

    async createWebhook(webhook: Omit<Webhook, 'created_at' | 'updated_at'>): Promise<void> {
      await db.prepare(
        `INSERT INTO webhooks (id, user_id, name, url, events, secret, enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        webhook.id, webhook.user_id, webhook.name, webhook.url,
        JSON.stringify(webhook.events), webhook.secret, webhook.enabled
      ).run();
    },

    // ============ Stats ============
    async upsertDailyStats(userId: string, date: string, status: string): Promise<void> {
      const column = status === 'sent' ? 'total_sent'
        : status === 'delivered' ? 'total_delivered'
        : status === 'failed' ? 'total_failed'
        : status === 'bounced' ? 'total_bounced'
        : 'total_spam';

      await db.prepare(
        `INSERT INTO daily_stats (id, user_id, date, ${column})
         VALUES (?, ?, ?, 1)
         ON CONFLICT(user_id, date) DO UPDATE SET ${column} = ${column} + 1`
      ).bind(uuidv7(), userId, date).run();
    },

    async getDailyStats(userId: string, days: number = 30): Promise<unknown[]> {
      const result = await db.prepare(
        `SELECT * FROM daily_stats WHERE user_id = ? AND date >= date('now', ?) ORDER BY date DESC`
      ).bind(userId, `-${days} days`).all();
      return result.results;
    },

    // ============ Verification Codes ============
    async createVerificationCode(vc: Omit<VerificationCode, 'created_at'>): Promise<void> {
      await db.prepare(
        `INSERT INTO verification_codes (id, email, code, scene_type, user_id, expires_at, used, attempts)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(vc.id, vc.email, vc.code, vc.scene_type, vc.user_id, vc.expires_at, vc.used, vc.attempts).run();
    },

    async getLatestCode(userId: string, email: string, scene_type: string): Promise<VerificationCode | null> {
      return db.prepare(
        `SELECT * FROM verification_codes
         WHERE user_id = ? AND email = ? AND scene_type = ? AND used = 0
         ORDER BY created_at DESC LIMIT 1`
      ).bind(userId, email, scene_type).first<VerificationCode>();
    },

    async markCodeUsed(id: string, userId: string): Promise<void> {
      await db.prepare(
        `UPDATE verification_codes SET used = 1 WHERE id = ? AND user_id = ?`
      ).bind(id, userId).run();
    },

    async incrementCodeAttempts(id: string, userId: string): Promise<void> {
      await db.prepare(
        `UPDATE verification_codes SET attempts = attempts + 1 WHERE id = ? AND user_id = ?`
      ).bind(id, userId).run();
    },

    async deleteUsedCodes(userId: string, email: string, scene_type: string): Promise<void> {
      // 标记同一用户 + email + scene_type 下所有未使用的旧码为已使用。
      await db.prepare(
        `UPDATE verification_codes SET used = 1
         WHERE user_id = ? AND email = ? AND scene_type = ? AND used = 0`
      ).bind(userId, email, scene_type).run();
    },

    async cleanupExpiredCodes(): Promise<number> {
      const result = await db.prepare(
        `DELETE FROM verification_codes WHERE expires_at <= datetime('now') OR used = 1`
      ).run();
      return result.meta?.changes ?? 0;
    },
  };
}
