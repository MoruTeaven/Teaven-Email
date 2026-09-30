// Teaven Email - 邮件发送队列处理 (Cron Worker)
// 在 wrangler.toml 中配置：
// [triggers]
// crons = ["*/10 * * * *"]  // 每10秒处理一次

import { getDB } from './db';
import { sendWithRetry } from './mailer';
import { getSetting } from './settings';
import { assertRuntimeSecrets, resolveWebhookSigningSecret } from './secrets';
import type { EmailProvider, MailQueueItem } from './types';
import { getLocalDateString } from './utils';

const QUEUE_BATCH_SIZE = 10;
const PROCESSING_LEASE_SECONDS = 15 * 60;
type QueueDB = ReturnType<typeof getDB>;

export async function processQueue(env: Env): Promise<{ processed: number; failed: number }> {
  // [H-3] 队列处理会解密服务商凭据（JWT_SECRET）并投递 webhook，属于密钥消费入口：缺失即抛错。
  assertRuntimeSecrets(env);
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

    if (provider.enabled !== 1) {
      try {
        await recordQueueFailure(env, db, item, 'Provider is disabled', undefined, true);
      } catch (err) {
        console.error(`[queue] Failed to record disabled-provider queue item ${item.id}:`, err);
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
      let fromEmail = await getSetting(env.DB, 'default_from_email');
      let fromName: string | undefined;

      if (item.account_id) {
        const account = await db.getAccountById(item.account_id);
        if (!account) {
          await recordQueueFailure(env, db, item, 'Account not found', undefined, true);
          failed++;
          continue;
        }
        if (account.enabled !== 1) {
          await recordQueueFailure(env, db, item, 'Account is disabled', undefined, true);
          failed++;
          continue;
        }
        fromEmail = account.email;
        fromName = account.display_name || undefined;
      }

      // 发送邮件
      result = await sendWithRetry(providerWithConfig, {
        from: fromEmail,
        fromName,
        to: item.to_email,
        subject: item.subject,
        html: item.html,
        text: item.text_content || undefined,
      }, env, 1);
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
        const today = getLocalDateString();
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

    const today = getLocalDateString();
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
      const body = JSON.stringify({
        event,
        queue_id: item.id,
        to: item.to_email,
        subject: item.subject,
        category: item.category,
        timestamp: new Date().toISOString(),
      });

      // [H-3] 空密钥会被 WebCrypto 以 DataError 拒绝，旧写法 `wh.secret || ''` 会让整条投递
      // 静默失败（catch 里什么都不做）。现在：未配置 secret 就显式跳过签名头，并留下可排查的日志。
      const signingSecret = resolveWebhookSigningSecret(wh.secret);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
      };

      if (signingSecret !== null) {
        const encoder = new TextEncoder();
        const cryptoKey = await crypto.subtle.importKey(
          'raw', encoder.encode(signingSecret), { name: 'HMAC', hash: 'SHA-256' },
          false, ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(body));
        const signatureHex = Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0')).join('');
        headers['X-Webhook-Signature'] = `sha256=${signatureHex}`;
      } else {
        console.warn(`[webhook] webhook ${wh.id} has no signing secret configured; delivering without X-Webhook-Signature`);
      }

      await fetch(wh.url, { method: 'POST', headers, body });
    } catch (err) {
      // [H-3] 投递失败仍不阻塞主流程，但必须可见：空 catch {} 会掩盖签名/网络/密钥配置错误。
      console.error(`[webhook] delivery failed for webhook ${wh.id} (event=${event}, queue_id=${item.id}):`, err);
    }
  }
}
