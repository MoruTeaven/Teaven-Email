// Teaven Email - 邮件发送引擎
import type { EmailProvider, SmtpConfig, ApiProviderConfig, CloudflareEmailConfig, ProviderConfig } from './types';

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  providerResponse?: string;
}

export interface SendParams {
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// SMTP 发送
async function sendViaSmtp(config: SmtpConfig, params: SendParams): Promise<SendResult> {
  const { host, port, username, password } = config;
  const url = `https://api.mailchannels.net/tx/v1/send`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: params.to }],
        }],
        from: {
          email: params.from,
          name: params.fromName || params.from,
        },
        subject: params.subject,
        content: [{
          type: 'text/html',
          value: params.html,
        }],
      }),
    });

    const body = await response.text();
    if (response.ok) {
      return { success: true, messageId: crypto.randomUUID(), providerResponse: body };
    }
    return { success: false, error: `SMTP send failed: ${response.status}`, providerResponse: body };
  } catch (error) {
    return { success: false, error: `SMTP error: ${error instanceof Error ? error.message : 'Unknown'}` };
  }
}

// Cloudflare Email Routing 发送
// 使用 Cloudflare Email Workers 的 EmailChannel API
async function sendViaCloudflareEmail(
  config: CloudflareEmailConfig,
  params: SendParams
): Promise<SendResult> {
  try {
    // Cloudflare Email Routing 通过 EmailChannel 发送
    // 需要 worker 绑定 email 类型的 send_email binding
    // 这里使用 MailChannels API 作为 Cloudflare Workers 上 SMTP 的替代方案
    const sendRequest = new Request('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: params.to }],
          dkim_domain: config.domain,
          dkim_selector: 'mailchannels',
          dkim_private_key: '', // Cloudflare 自动处理
        }],
        from: {
          email: params.from,
          name: params.fromName || '',
        },
        subject: params.subject,
        content: [{
          type: 'text/html',
          value: params.html,
        }],
      }),
    });

    const response = await fetch(sendRequest);
    const body = await response.text();

    if (response.ok) {
      return { success: true, messageId: crypto.randomUUID(), providerResponse: body };
    }
    return { success: false, error: `Cloudflare Email send failed: ${response.status}`, providerResponse: body };
  } catch (error) {
    return { success: false, error: `Cloudflare Email error: ${error instanceof Error ? error.message : 'Unknown'}` };
  }
}

// 第三方 API 发送 (SendGrid / Mailgun / Resend 等)
async function sendViaApi(config: ApiProviderConfig, params: SendParams): Promise<SendResult> {
  const { api_url, api_key, provider_name } = config;

  try {
    let url: string;
    let body: string;
    let headers: Record<string, string>;

    switch (provider_name.toLowerCase()) {
      case 'sendgrid':
        url = 'https://api.sendgrid.com/v3/mail/send';
        headers = {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        };
        body = JSON.stringify({
          personalizations: [{
            to: [{ email: params.to }],
            subject: params.subject,
          }],
          from: {
            email: params.from,
            name: params.fromName || params.from,
          },
          content: [{
            type: 'text/html',
            value: params.html,
          }],
        });
        break;

      case 'mailgun':
        url = api_url || 'https://api.mailgun.net/v3';
        headers = {
          'Authorization': `Basic ${btoa(`api:${api_key}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        };
        const mailgunParams = new URLSearchParams();
        mailgunParams.append('from', `${params.fromName || ''} <${params.from}>`);
        mailgunParams.append('to', params.to);
        mailgunParams.append('subject', params.subject);
        mailgunParams.append('html', params.html);
        body = mailgunParams.toString();
        break;

      case 'resend':
        url = 'https://api.resend.com/emails';
        headers = {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        };
        body = JSON.stringify({
          from: `${params.fromName || ''} <${params.from}>`,
          to: [params.to],
          subject: params.subject,
          html: params.html,
        });
        break;

      case 'ahasend': {
        const accountId = config.account_id;
        if (!accountId) {
          return { success: false, error: 'AhaSend 缺少 account_id 配置' };
        }
        url = `https://api.ahasend.com/v2/accounts/${accountId}/messages`;
        headers = {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        };
        body = JSON.stringify({
          from: {
            email: params.from,
            name: params.fromName || '',
          },
          recipients: [
            { email: params.to },
          ],
          subject: params.subject,
          html_content: params.html,
          text_content: params.text || '',
        });
        break;
      }

      default:
        // 通用 API
        url = api_url;
        headers = {
          'Authorization': `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        };
        body = JSON.stringify({
          from: `${params.fromName || ''} <${params.from}>`,
          to: params.to,
          subject: params.subject,
          html: params.html,
        });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    const responseBody = await response.text();
    if (response.ok) {
      return { success: true, messageId: crypto.randomUUID(), providerResponse: responseBody };
    }
    return { success: false, error: `API send failed: ${response.status}`, providerResponse: responseBody };
  } catch (error) {
    return { success: false, error: `API error: ${error instanceof Error ? error.message : 'Unknown'}` };
  }
}

// 根据发送通道类型分发发送
export async function sendEmail(
  provider: EmailProvider,
  params: SendParams
): Promise<SendResult> {
  const config = typeof provider.config === 'string'
    ? JSON.parse(provider.config) as ProviderConfig
    : provider.config;

  switch (provider.type) {
    case 'smtp':
      return sendViaSmtp(config as SmtpConfig, params);
    case 'cloudflare_email':
      return sendViaCloudflareEmail(config as CloudflareEmailConfig, params);
    case 'api':
      return sendViaApi(config as ApiProviderConfig, params);
    default:
      return { success: false, error: `Unknown provider type: ${provider.type}` };
  }
}

// 带重试的发送
export async function sendWithRetry(
  provider: EmailProvider,
  params: SendParams,
  maxRetries: number = 3
): Promise<SendResult> {
  let lastError: SendResult = { success: false, error: 'No attempt made' };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendEmail(provider, params);
    if (result.success) return result;
    lastError = result;

    if (attempt < maxRetries) {
      // 指数退避: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return lastError;
}

// 获取可用的发送账号（负载均衡）
export function selectAccount(
  accounts: { id: string; email: string; display_name: string | null; sent_today: number; daily_limit: number; enabled: number }[]
): { id: string; email: string; display_name: string | null } | null {
  const available = accounts
    .filter(a => a.enabled === 1 && a.sent_today < a.daily_limit)
    .sort((a, b) => a.sent_today - b.sent_today); // 最少发送的优先

  if (available.length === 0) return null;
  return available[0];
}
