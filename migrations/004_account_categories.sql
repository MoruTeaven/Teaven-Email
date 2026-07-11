-- Migration 004: 分类路由合并到发件账号
-- accounts 表增加 categories 字段，废弃 category_routes 表

-- 1. 给 accounts 添加 categories 列（逗号分隔的分类，如 "VERIFY,NOTIFY,MARKETING"）
ALTER TABLE accounts ADD COLUMN categories TEXT DEFAULT '';

-- 2. 删除已废弃的 category_routes 表
DROP TABLE IF EXISTS category_routes;
