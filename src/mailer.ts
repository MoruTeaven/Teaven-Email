// Teaven Email - 邮件发送引擎
import { connect } from 'cloudflare:sockets';
import type { EmailProvider, SmtpConfig, ApiProviderConfig, CloudflareEmailConfig, ProviderConfig } from './types';
import { uuidv7 } from './uuid';
import { decryptApiKey } from './auth';
import { htmlToText } from './utils';

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

interface SmtpResponse {
  code: number;
  message: string;
}

const SENSITIVE_CONFIG_KEYS = new Set(['password', 'api_key']);
const ENCRYPTED_VALUE_PREFIX = 'enc:v1:';

function toBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(i, i + 0x8000));
  }
  return btoa(binary);
}

function foldBase64(input: string): string {
  return input.replace(/.{1,76}/g, '$&\r\n').trimEnd();
}

function encodeHeader(value: string): string {
  return /^[\x20-\x7e]*$/.test(value) ? value : `=?UTF-8?B?${toBase64(value)}?=`;
}

function formatAddress(email: string, name?: string): string {
  if (!name) return `<${email}>`;
  return `${encodeHeader(name)} <${email}>`;
}

function buildMimeMessage(params: SendParams): string {
  const boundary = `teaven-${uuidv7()}`;
  const text = params.text || htmlToText(params.html);
  const headers = [
    `From: ${formatAddress(params.from, params.fromName)}`,
    `To: <${params.to}>`,
    `Subject: ${encodeHeader(params.subject)}`,
    'MIME-Version: 1.0',
    `Message-ID: <${uuidv7()}@teaven-email>`,
    `Date: ${new Date().toUTCString()}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];

  return `${headers.join('\r\n')}\r\n\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: text/plain; charset=UTF-8\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    `${foldBase64(toBase64(text))}\r\n\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: text/html; charset=UTF-8\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    `${foldBase64(toBase64(params.html))}\r\n\r\n` +
    `--${boundary}--\r\n`;
}

// SMTP 发送（通过 Cloudflare Workers TCP sockets 直连 SMTP 服务）
async function sendViaSmtp(config: SmtpConfig, params: SendParams): Promise<SendResult> {
  const { host, port, username, password, encryption } = config;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let socket: Socket | null = null;
  let reader: ReadableStreamDefaultReader | null = null;
  let writer: WritableStreamDefaultWriter | null = null;
  let pending = '';

  const readLine = async (): Promise<string> => {
    while (true) {
      const newline = pending.indexOf('\n');
      if (newline >= 0) {
        const line = pending.slice(0, newline).replace(/\r$/, '');
        pending = pending.slice(newline + 1);
        return line;
      }

      if (!reader) throw new Error('SMTP socket reader is not available');
      const chunk = await reader.read();
      if (chunk.done) throw new Error('SMTP connection closed unexpectedly');
      pending += decoder.decode(chunk.value, { stream: true });
    }
  };

  const readResponse = async (): Promise<SmtpResponse> => {
    const lines: string[] = [];
    while (true) {
      const line = await readLine();
      lines.push(line);
      const match = /^(\d{3})([ -])/.exec(line);
      if (match && match[2] === ' ') {
        return { code: Number(match[1]), message: lines.join('\n') };
      }
    }
  };

  const writeCommand = async (command: string): Promise<void> => {
    if (!writer) throw new Error('SMTP socket writer is not available');
    await writer.write(encoder.encode(`${command}\r\n`));
  };

  const expect = async (allowed: number[]): Promise<SmtpResponse> => {
    const response = await readResponse();
    if (!allowed.includes(response.code)) {
      throw new Error(response.message);
    }
    return response;
  };

  try {
    socket = connect({ hostname: host, port }, {
      secureTransport: encryption === 'ssl' ? 'on' : (encryption === 'tls' ? 'starttls' : 'off'),
      allowHalfOpen: false,
    });
    reader = socket.readable.getReader();
    writer = socket.writable.getWriter();

    await expect([220]);
    await writeCommand(`EHLO ${host}`);
    await expect([250]);

    if (encryption === 'tls') {
      await writeCommand('STARTTLS');
      await expect([220]);
      reader.releaseLock();
      writer.releaseLock();
      socket = socket.startTls({ expectedServerHostname: host });
      reader = socket.readable.getReader();
      writer = socket.writable.getWriter();
      pending = '';
      await writeCommand(`EHLO ${host}`);
      await expect([250]);
    }

    if (username || password) {
      await writeCommand('AUTH LOGIN');
      await expect([334]);
      await writeCommand(toBase64(username));
      await expect([334]);
      await writeCommand(toBase64(password));
      await expect([235]);
    }

    await writeCommand(`MAIL FROM:<${params.from}>`);
    await expect([250]);
    await writeCommand(`RCPT TO:<${params.to}>`);
    await expect([250, 251]);
    await writeCommand('DATA');
    await expect([354]);
    await writeCommand(`${buildMimeMessage(params)}\r\n.`);
    const dataResponse = await expect([250]);
    await writeCommand('QUIT');

    return { success: true, messageId: uuidv7(), providerResponse: dataResponse.message };
  } catch (error) {
    return { success: false, error: `SMTP error: ${error instanceof Error ? error.message : 'Unknown'}` };
  } finally {
    try { reader?.releaseLock(); } catch {}
    try { writer?.releaseLock(); } catch {}
    try { await socket?.close(); } catch {}
  }
}

// Cloudflare Email Sending 发送（Workers send_email binding）
async function sendViaCloudflareEmail(
  config: CloudflareEmailConfig,
  params: SendParams,
  env?: Env
): Promise<SendResult> {
  try {
    if (!env?.EMAIL) {
      return { success: false, error: 'Cloudflare Email binding EMAIL is not configured' };
    }

    const domain = config.domain?.trim().toLowerCase();
    const fromDomain = params.from.split('@')[1]?.toLowerCase();
    if (domain && fromDomain !== domain) {
      return { success: false, error: `Cloudflare Email from domain mismatch: expected ${domain}, got ${fromDomain || 'unknown'}` };
    }

    const response = await env.EMAIL.send({
      to: params.to,
      from: { email: params.from, name: params.fromName || params.from },
      subject: params.subject,
      html: params.html,
      text: params.text || htmlToText(params.html),
    });

    return { success: true, messageId: response.messageId || uuidv7(), providerResponse: JSON.stringify(response) };
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

      case 'sweego':
        url = api_url || 'https://api.sweego.io/send';
        headers = {
          'Api-Key': api_key,
          'Content-Type': 'application/json',
        };
        body = JSON.stringify({
          channel: 'email',
          provider: 'sweego',
          recipients: [{ email: params.to }],
          from: {
            name: params.fromName || params.from,
            email: params.from,
          },
          subject: params.subject,
          'message-html': params.html,
          'message-txt': params.text || params.html.replace(/<[^>]*>/g, ''),
        });
        break;

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
      return { success: true, messageId: uuidv7(), providerResponse: responseBody };
    }
    return { success: false, error: `API send failed: ${response.status}`, providerResponse: responseBody };
  } catch (error) {
    return { success: false, error: `API error: ${error instanceof Error ? error.message : 'Unknown'}` };
  }
}

// 根据发送通道类型分发发送
export async function sendEmail(
  provider: EmailProvider,
  params: SendParams,
  env?: Env
): Promise<SendResult> {
  let config: ProviderConfig;
  try {
    const parsed = typeof provider.config === 'string'
      ? JSON.parse(provider.config) as ProviderConfig
      : provider.config;
    config = await decryptProviderConfig(parsed, env);
  } catch (error) {
    return { success: false, error: `Provider config error: ${error instanceof Error ? error.message : 'Unknown'}` };
  }

  switch (provider.type) {
    case 'smtp':
      return sendViaSmtp(config as SmtpConfig, params);
    case 'cloudflare_email':
      return sendViaCloudflareEmail(config as CloudflareEmailConfig, params, env);
    case 'api':
      return sendViaApi(config as ApiProviderConfig, params);
    default:
      return { success: false, error: `Unknown provider type: ${provider.type}` };
  }
}

async function decryptProviderConfig(config: ProviderConfig, env?: Env): Promise<ProviderConfig> {
  const decrypted = { ...(config as unknown as Record<string, unknown>) };
  for (const key of SENSITIVE_CONFIG_KEYS) {
    const value = decrypted[key];
    if (typeof value !== 'string' || !value.startsWith(ENCRYPTED_VALUE_PREFIX)) continue;
    if (!env?.JWT_SECRET) {
      throw new Error('JWT_SECRET is required to decrypt provider credentials');
    }
    decrypted[key] = await decryptApiKey(value.substring(ENCRYPTED_VALUE_PREFIX.length), env.JWT_SECRET);
  }
  return decrypted as unknown as ProviderConfig;
}

// 带重试的发送
export async function sendWithRetry(
  provider: EmailProvider,
  params: SendParams,
  env?: Env,
  maxRetries: number = 3
): Promise<SendResult> {
  let lastError: SendResult = { success: false, error: 'No attempt made' };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendEmail(provider, params, env);
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
export function selectAccount<T extends { id: string; email: string; display_name: string | null; provider_id?: string; sent_today: number; daily_limit: number; enabled: number }>(
  accounts: T[]
): T | null {
  const available = accounts
    .filter(a => a.enabled === 1 && a.sent_today < a.daily_limit)
    .sort((a, b) => a.sent_today - b.sent_today); // 最少发送的优先

  if (available.length === 0) return null;
  return available[0];
}
