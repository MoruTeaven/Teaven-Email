-- ============================================
-- 发送通道全局化：移除 user_id 绑定
-- ============================================

-- 删除旧的 user_id 索引
DROP INDEX IF EXISTS idx_providers_user_id;

-- 重建 providers 表（SQLite 不直接支持 DROP COLUMN）
CREATE TABLE IF NOT EXISTS providers_new (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('smtp', 'api', 'cloudflare_email')),
    config TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 迁移数据
INSERT INTO providers_new (id, name, type, config, priority, enabled, created_at, updated_at)
    SELECT id, name, type, config, priority, enabled, created_at, updated_at
    FROM providers;

-- 替换旧表
DROP TABLE providers;
ALTER TABLE providers_new RENAME TO providers;
