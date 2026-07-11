-- Migration 010: 原子每日用户发信配额
-- mail_logs 的 COUNT 检查在高并发下会先查后写导致超发；此表用 UPSERT + WHERE 原子预约配额。
CREATE TABLE IF NOT EXISTS daily_send_usage (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_send_usage_user_date ON daily_send_usage(user_id, date);
