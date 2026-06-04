-- Migration 006: 加密存储 API Key 原始值
-- 允许用户在验证密码后随时重新查看/复制 API Key
-- api_key_encrypted: AES-256-GCM 加密的原始 Key（base64），NULL = 旧 Key 无加密值
ALTER TABLE api_keys ADD COLUMN api_key_encrypted TEXT;
