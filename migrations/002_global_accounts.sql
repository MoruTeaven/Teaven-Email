-- ============================================
-- 发件账号全局化：移除 user_id 绑定
-- ============================================

-- 删除旧的 user_id 索引
DROP INDEX IF EXISTS idx_accounts_user_id;

-- 重建 accounts 表（SQLite 不直接支持 DROP COLUMN，通过重建实现）
CREATE TABLE IF NOT EXISTS accounts_new (
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

-- 迁移数据
INSERT INTO accounts_new (id, provider_id, name, email, display_name, config, daily_limit, sent_today, enabled, created_at, updated_at)
    SELECT id, provider_id, name, email, display_name, config, daily_limit, sent_today, enabled, created_at, updated_at
    FROM accounts;

-- 替换旧表
DROP TABLE accounts;
ALTER TABLE accounts_new RENAME TO accounts;

-- 重建索引
CREATE INDEX IF NOT EXISTS idx_accounts_provider_id ON accounts(provider_id);
