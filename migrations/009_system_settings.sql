-- ============================================
-- Teaven Email - 系统设置表
-- 采用 key-value 结构，按 category 分组
-- 超级管理员通过 /v1/admin/* 读写
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- 初始化默认设置项
INSERT OR IGNORE INTO system_settings (key, value, category, description) VALUES
    -- 平台设置
    ('platform_name', 'Teaven Email', 'platform', '平台名称，展示在后台与邮件中'),
    ('admin_contact_email', '', 'platform', '管理员联系邮箱'),
    ('announcement', '', 'platform', '系统公告，展示给用户（留空则不展示）'),
    -- 邮件发送
    ('default_max_retries', '3', 'mail', '单封邮件默认最大重试次数'),
    ('default_daily_limit_per_user', '1000', 'mail', '单用户每日发送上限（0 表示不限制）'),
    -- 验证码
    ('verification_code_ttl_minutes', '10', 'verification', '验证码默认有效期（分钟）'),
    ('verification_code_length', '6', 'verification', '验证码默认长度（4-10 位）'),
    ('verification_max_attempts', '5', 'verification', '单条验证码最大验证尝试次数'),
    -- 安全与维护
    ('maintenance_mode', '0', 'security', '维护模式开关（1=开启，开启后禁止发信）'),
    ('maintenance_message', '系统维护中，暂无法发送邮件，请稍后重试。', 'security', '维护模式开启时返回给用户的提示信息'),
    ('auto_api_key_ttl_hours', '24', 'security', '登录自动创建的 API Key 有效期（小时）');
