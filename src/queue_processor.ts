// Teaven Email - 邮件发送队列处理 (Cron Worker)
// 在 wrangler.toml 中配置：
// [triggers]
// crons = ["*/10 * * * *"]  // 每10秒处理一次

import { getDB } from './db';
import { sendWithRetry } from './mailer';
import type { EmailProvider, MailQueueItem } from './types';

const QUEUE_BATCH_SIZE = 10;
const PROCESSING_LEASE_SECONDS = 15 * 60;
type QueueDB = ReturnType<typeof getDB>;

export async function processQueue(env: Env): Promise<{ processed: number; failed: number }> {
  const db = getDB(env.DB);
  let processed = 0;
  let failed = 0;

  // processing 状态使用 next_retry_at 作为租约过期时间，避免异常中断后永久卡住。
  const reclaimed = await db.requeueStaleProcessingQueueItems(PROCESSING_LEASE_SECONDS);
  if (reclaimed > 0) {
    console.warn(`[queue] Requeued ${reclaimed} stale processing item(s)`);
  }

  // 原子领取待发送队列项，避免并发处理器拿到同一批记录。
  const items = await db.claimPendingQueueItems(QUEUE_BATCH_SIZE, PROCESSING_LEASE_SECONDS);

  for (const item of items) {
    let provider: EmailProvider | null;
    try {
      provider = await db.getProviderById(item.provider_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[queue] Failed to load provider for queue item ${item.id}:`, err);

      try {
        await recordQueueFailure(env, db, item, message);
      } catch (recordErr) {
        console.error(`[queue] Failed to record queue item ${item.id} provider-load error:`, recordErr);
      }
      failed++;
      continue;
    }

    if (!provider) {
      try {
        await recordQueueFailure(env, db, item, 'Provider not found', undefined, true);
      } catch (err) {
        console.error(`[queue] Failed to record provider-missing queue item ${item.id}:`, err);
      }
      failed++;
      continue;
    }

    let result: Awaited<ReturnType<typeof sendWithRetry>>;
    try {
      // 解析 Provider 配置
      const providerWithConfig: EmailProvider = {
        ...provider,
        config: typeof provider.config === 'string' ? JSON.parse(provider.config) : provider.config,
      };

      // 获取发件人信息（全局账号）
      let fromEmail = 'noreply@teaven.email';
      let fromName: string | undefined;

      if (item.account_id) {
        const account = await db.getAccountById(item.account_id);
        if (account) {
          fromEmail = account.email;
          fromName = account.display_name || undefined;
        }
      }

      // 发送邮件
      result = await sendWithRetry(providerWithConfig, {
        from: fromEmail,
        fromName,
        to: item.to_email,
        subject: item.subject,
        html: item.html,
        text: item.text_content || undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[queue] Failed to process queue item ${item.id}:`, err);

      try {
        await recordQueueFailure(env, db, item, message);
      } catch (recordErr) {
        console.error(`[queue] Failed to record queue item ${item.id} error:`, recordErr);
      }
      failed++;
      continue;
    }

    if (result.success) {
      try {
        await db.updateQueueItemStatus(item.id, 'completed');
        await db.updateMailLogStatus(item.mail_log_id, 'sent', result.providerResponse);

        // 更新每日统计
        const today = new Date().toISOString().split('T')[0];
        await db.upsertDailyStats(item.user_id, today, 'sent');

        // 触发 Webhook
        await triggerWebhooks(env, item.user_id, 'sent', item);
      } catch (err) {
        console.error(`[queue] Sent queue item ${item.id}, but failed to record success:`, err);
        try {
          await db.updateQueueItemStatus(item.id, 'completed');
          await db.updateMailLogStatus(item.mail_log_id, 'sent', result.providerResponse);
        } catch (recordErr) {
          console.error(`[queue] Failed to finalize sent queue item ${item.id}:`, recordErr);
        }
      }
      processed++;
      continue;
    }

    try {
      await recordQueueFailure(env, db, item, result.error || 'Unknown send failure', result.providerResponse);
    } catch (err) {
      console.error(`[queue] Failed to record queue item ${item.id} send failure:`, err);
    }
    failed++;
  }

  return { processed, failed };
}

async function recordQueueFailure(
  env: Env,
  db: QueueDB,
  item: MailQueueItem,
  errorMessage: string,
  providerResponse?: string,
  permanent: boolean = false
): Promise<void> {
  // 注意：item.retry_count 是处理前的重试次数，本次失败后需 +1。
  if (permanent || item.retry_count >= item.max_retries - 1) {
    // 达到最大重试次数或永久错误 → 永久失败
    await db.updateQueueItemStatus(item.id, 'failed', errorMessage);
    await db.updateMailLogStatus(item.mail_log_id, 'failed', providerResponse, errorMessage);

    const today = new Date().toISOString().split('T')[0];
    await db.upsertDailyStats(item.user_id, today, 'failed');

    await triggerWebhooks(env, item.user_id, 'failed', item);
  } else {
    // 未达最大重试 → 回到 queued，设置延迟重试
    await db.updateQueueItemStatus(item.id, 'queued', errorMessage, true);
    await db.updateMailLogStatus(item.mail_log_id, 'pending', providerResponse, errorMessage);
  }
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
    try {
      const events = typeof w.events === 'string' ? JSON.parse(w.events) : w.events;
      return Array.isArray(events) && events.includes(event);
    } catch (err) {
      console.error(`[queue] Invalid webhook events for webhook ${w.id}:`, err);
      return false;
    }
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
