-- Migration 005: 登录自动创建 API Key 24 小时过期机制
-- 新增 auto_created 标记和 expires_at 过期时间字段

-- 添加 auto_created 字段（1 = 登录自动创建, 0 = 手动或管理员创建）
ALTER TABLE api_keys ADD COLUMN auto_created INTEGER NOT NULL DEFAULT 0;

-- 添加 expires_at 字段（自动创建的 key 过期时间，NULL = 永不过期）
ALTER TABLE api_keys ADD COLUMN expires_at TEXT;

-- 创建索引加速过期清理查询
CREATE INDEX IF NOT EXISTS idx_api_keys_auto_expires ON api_keys(auto_created, expires_at);

-- 说明：
-- 1. 用户登录时通过 POST /v1/setup/key-from-password 自动创建的 key，
--    auto_created = 1, expires_at = 创建时间 + 24 小时
-- 2. 这些 key 不在 Dashboard 的 API Keys 列表中展示
-- 3. 24 小时后自动清理（Cron 触发 + 每次请求懒清理）
-- 4. 过期 key 在认证中间件中直接拒绝并删除
