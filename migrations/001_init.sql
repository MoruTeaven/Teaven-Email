-- ============================================
-- Teaven Email - 多租户邮件平台 数据库初始化
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disabled', 'deleted')),
    is_super_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- API Key 表
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    api_key_hash TEXT NOT NULL,
    api_key_prefix TEXT NOT NULL,
    permissions TEXT NOT NULL DEFAULT '["SEND_MAIL"]',
    enabled INTEGER NOT NULL DEFAULT 1,
    last_used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(api_key_hash);

-- 发送通道配置表（全局，不绑定用户）
CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('smtp', 'api', 'cloudflare_email')),
    config TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 发件账号表（全局，不绑定用户）
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL REFERENCES providers(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    config TEXT,
    daily_limit INTEGER DEFAULT 1000,
    sent_today INTEGER DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_accounts_provider_id ON accounts(provider_id);

-- 模板表
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    template_code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'SYSTEM' CHECK(category IN ('VERIFY', 'NOTIFY', 'MARKETING', 'SYSTEM')),
    version INTEGER NOT NULL DEFAULT 1,
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    text_content TEXT,
    variables TEXT DEFAULT '[]',
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_templates_code_version ON templates(user_id, template_code, version);

-- 模板版本历史表
CREATE TABLE IF NOT EXISTS template_versions (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL REFERENCES templates(id),
    version INTEGER NOT NULL,
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    text_content TEXT,
    variables TEXT DEFAULT '[]',
    changelog TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_template_versions_template ON template_versions(template_id);

-- 分类路由规则表
CREATE TABLE IF NOT EXISTS category_routes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    category TEXT NOT NULL,
    provider_id TEXT NOT NULL REFERENCES providers(id),
    account_id TEXT,
    priority INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_category_routes_user ON category_routes(user_id);

-- 邮件日志表
CREATE TABLE IF NOT EXISTS mail_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    api_key_id TEXT,
    template_id TEXT,
    provider_id TEXT,
    account_id TEXT,
    category TEXT,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'spam')),
    provider_response TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mail_logs_user_id ON mail_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mail_logs_status ON mail_logs(status);
CREATE INDEX IF NOT EXISTS idx_mail_logs_created ON mail_logs(created_at);

-- 发送队列表
CREATE TABLE IF NOT EXISTS mail_queue (
    id TEXT PRIMARY KEY,
    mail_log_id TEXT NOT NULL REFERENCES mail_logs(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    provider_id TEXT NOT NULL,
    account_id TEXT,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    text_content TEXT,
    category TEXT,
    priority INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'processing', 'completed', 'failed')),
    scheduled_at TEXT,
    next_retry_at TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mail_queue_status ON mail_queue(status);
CREATE INDEX IF NOT EXISTS idx_mail_queue_scheduled ON mail_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_mail_queue_next_retry ON mail_queue(next_retry_at);

-- Webhook 配置表
CREATE TABLE IF NOT EXISTS webhooks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT NOT NULL DEFAULT '["sent","failed","bounced"]',
    secret TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);

-- 发送统计表（按天汇总）
CREATE TABLE IF NOT EXISTS daily_stats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_spam INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_stats_unique ON daily_stats(user_id, date);
