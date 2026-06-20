-- Migration 007: 验证码表
-- 支持生成验证码、按 user_id + email + scene_type 验证
-- scene_type 为用户自定义场景字符串（如 "login"、"register"、"reset_password"）
CREATE TABLE IF NOT EXISTS verification_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  scene_type TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_email_scene ON verification_codes(email, scene_type);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_email_scene ON verification_codes(user_id, email, scene_type);
