-- [H-2] 存量 request_params 原样保存了调用参数（模板 variables 的值可能含验证码/PII 明文）。
-- 存量行无法按字段可靠区分敏感与非敏感（VERIFY 变量与普通变量长得一样），直接清空；
-- 该字段只是排障辅助，模板/分类/收件人/主题均可由列与 JOIN 还原。
-- 新数据自迁移起只写白名单元数据（见 src/routes/mail.ts 的 [H-2] 注释）。
UPDATE mail_logs SET request_params = NULL WHERE request_params IS NOT NULL;
