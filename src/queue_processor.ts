// Teaven Email - 邮件发送队列处理 (Cron Worker)
// 在 wrangler.toml 中配置：
// [triggers]
// crons = ["*/10 * * * *"]  // 每10秒处理一次

import { getDB } from './db';
import { sendWithRetry } from './mailer';
import type { EmailProvider } from './types';

export async function processQueue(env: Env): Promise<{ processed: number; failed: number }> {
  const db = getDB(env.DB);
  let processed = 0;
  let failed = 0;

  // 获取待发送队列项
  const items = await db.getPendingQueueItems(10);

  for (const item of items) {
    // 标记为处理中
    await db.updateQueueItemStatus(item.id, 'processing');

    // 获取 Provider
    const provider = await db.getProviderById(item.provider_id, item.user_id);
    if (!provider) {
      await db.updateQueueItemStatus(item.id, 'failed', 'Provider not found');
      await db.updateMailLogStatus(item.mail_log_id, 'failed', undefined, 'Provider not found');
      failed++;
      continue;
    }

    // 解析 Provider 配置
    const providerWithConfig: EmailProvider = {
      ...provider,
      config: typeof provider.config === 'string' ? JSON.parse(provider.config) : provider.config,
    };

    // 获取发件人信息
    let fromEmail = 'noreply@teaven.email';
    let fromName: string | undefined;

    if (item.account_id) {
      const accounts = await db.getEnabledAccountsByProvider(item.user_id, item.provider_id);
      const account = accounts.find(a => a.id === item.account_id);
      if (account) {
        fromEmail = account.email;
        fromName = account.display_name || undefined;
      }
    }

    // 发送邮件
    const result = await sendWithRetry(providerWithConfig, {
      from: fromEmail,
      fromName,
      to: item.to_email,
      subject: item.subject,
      html: item.html,
      text: item.text_content || undefined,
    });

    if (result.success) {
      await db.updateQueueItemStatus(item.id, 'completed');
      await db.updateMailLogStatus(item.mail_log_id, 'sent', result.providerResponse);

      // 更新账号发送计数
      if (item.account_id) {
        await db.incrementAccountSent(item.account_id, item.user_id);
      }

      // 更新每日统计
      const today = new Date().toISOString().split('T')[0];
      await db.upsertDailyStats(item.user_id, today, 'sent');

      // 触发 Webhook
      await triggerWebhooks(env, item.user_id, 'sent', item);

      processed++;
    } else {
      if (item.retry_count >= item.max_retries - 1) {
        // 达到最大重试次数
        await db.updateQueueItemStatus(item.id, 'failed', result.error);
        await db.updateMailLogStatus(item.mail_log_id, 'failed', result.providerResponse, result.error);

        const today = new Date().toISOString().split('T')[0];
        await db.upsertDailyStats(item.user_id, today, 'failed');

        await triggerWebhooks(env, item.user_id, 'failed', item);
      } else {
        await db.updateQueueItemStatus(item.id, 'failed', result.error);
      }
      failed++;
    }
  }

  return { processed, failed };
}

async function triggerWebhooks(
  env: Env,
  userId: string,
  event: string,
  item: { id: string; to_email: string; subject: string; category: string | null }
): Promise<void> {
  const db = getDB(env.DB);
  const webhooks = await db.getWebhooks(userId);

  const matchingWebhooks = webhooks.filter(w => {
    const events = typeof w.events === 'string' ? JSON.parse(w.events) : w.events;
    return events.includes(event);
  });

  for (const wh of matchingWebhooks) {
    try {
      await fetch(wh.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Secret': wh.secret || '',
        },
        body: JSON.stringify({
          event,
          queue_id: item.id,
          to: item.to_email,
          subject: item.subject,
          category: item.category,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Webhook 失败不影响主流程
    }
  }
}
