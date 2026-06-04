-- Migration 004: 分类路由合并到发件账号
-- accounts 表增加 categories 字段，废弃 category_routes 表

-- 1. 给 accounts 添加 categories 列（逗号分隔的分类，如 "VERIFY,NOTIFY,MARKETING"）
ALTER TABLE accounts ADD COLUMN categories TEXT DEFAULT '';

-- 2. category_routes 表标记废弃（不删除，保留历史数据）
-- DROP TABLE IF EXISTS category_routes; -- 暂不执行，等确认迁移无误后再清理
