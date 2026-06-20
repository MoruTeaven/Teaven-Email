-- Migration 008: 验证码租户隔离查询索引
-- 验证码查询、旧码失效和限流均按 user_id + email + scene_type 隔离。
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_email_scene
ON verification_codes(user_id, email, scene_type);
