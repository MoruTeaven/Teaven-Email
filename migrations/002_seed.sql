-- Teaven Email - 初始化默认用户和 API Key
-- 运行方式: npx wrangler d1 execute teaven-email-db --local --file=./migrations/002_seed.sql

-- 创建默认管理员用户 (密码: admin123)
INSERT OR IGNORE INTO users (id, name, email, password_hash, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Admin',
  'admin@teaven.email',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'active'
);

-- 创建默认 API Key (sk_dev_0000000000000000000000000000000000000000000000000000000000000001)
-- 哈希值预计算
INSERT OR IGNORE INTO api_keys (id, user_id, name, api_key_hash, api_key_prefix, permissions, enabled)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Default Dev Key',
  'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
  'sk_dev_000',
  '["SEND_MAIL","MANAGE_TEMPLATE","READ_LOG","MANAGE_PROVIDER"]',
  1
);
