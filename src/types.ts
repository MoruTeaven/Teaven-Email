// Teaven Email - 类型定义

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  status: 'active' | 'disabled' | 'deleted';
  is_super_admin: number;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  api_key_hash: string;
  api_key_prefix: string;
  permissions: Permission[];
  enabled: number;
  auto_created: number;       // 1 = 登录自动创建, 0 = 手动创建
  expires_at: string | null;  // 自动创建的 key 过期时间，NULL = 永不过期
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Permission = 'SEND_MAIL' | 'MANAGE_TEMPLATE' | 'READ_LOG' | 'MANAGE_PROVIDER';

export type ProviderType = 'smtp' | 'api' | 'cloudflare_email';

export interface EmailProvider {
  id: string;
  name: string;
  type: ProviderType;
  config: ProviderConfig;
  priority: number;
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'tls' | 'ssl' | 'none';
}

export interface ApiProviderConfig {
  api_url: string;
  api_key: string;
  provider_name: string; // 'sendgrid' | 'mailgun' | 'resend' | 'ahasend' | etc.
  account_id?: string; // 用于 ahasend 等需要 account_id 的 provider
}

export interface CloudflareEmailConfig {
  domain: string;
  dkim_selector: string;
}

export type ProviderConfig = SmtpConfig | ApiProviderConfig | CloudflareEmailConfig;

export interface Account {
  id: string;
  provider_id: string;
  name: string;
  email: string;
  display_name: string | null;
  config: string | null;
  daily_limit: number;
  sent_today: number;
  categories: string;  // 逗号分隔的分类，如 "VERIFY,NOTIFY,MARKETING"。超管统一管理，全平台共享。
  enabled: number;
  created_at: string;
  updated_at: string;
}

export type TemplateCategory = 'VERIFY' | 'NOTIFY' | 'MARKETING' | 'SYSTEM';

export interface Template {
  id: string;
  user_id: string;
  template_code: string;
  name: string;
  category: TemplateCategory;
  version: number;
  subject: string;
  html: string;
  text_content: string | null;
  variables: string[];
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version: number;
  subject: string;
  html: string;
  text_content: string | null;
  variables: string[];
  changelog: string | null;
  created_at: string;
}

export type MailStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'spam';

export interface MailLog {
  id: string;
  user_id: string;
  api_key_id: string | null;
  template_id: string | null;
  provider_id: string | null;
  account_id: string | null;
  category: string | null;
  to_email: string;
  subject: string;
  status: MailStatus;
  provider_response: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
}

export type QueueStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface MailQueueItem {
  id: string;
  mail_log_id: string;
  user_id: string;
  provider_id: string;
  account_id: string | null;
  to_email: string;
  subject: string;
  html: string;
  text_content: string | null;
  category: string | null;
  priority: number;
  status: QueueStatus;
  scheduled_at: string | null;
  next_retry_at: string | null;
  retry_count: number;
  max_retries: number;
  created_at: string;
}

export interface CategoryRoute {
  id: string;
  user_id: string;
  category: string;
  provider_id: string;
  account_id: string | null;
  priority: number;
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  enabled: number;
  created_at: string;
  updated_at: string;
}

// API 请求/响应类型

export interface SendTemplateRequest {
  template: string;
  version?: number;
  to: string;
  variables: Record<string, string>;
  category?: TemplateCategory;
}

export interface SendMailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  category?: TemplateCategory;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthContext {
  userId: string;
  apiKeyId: string | null;  // null when using impersonation token
  permissions: Permission[];
  impersonated?: boolean;    // true when using impersonation token
}
