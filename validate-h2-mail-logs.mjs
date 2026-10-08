// [H-2] 自检：mail_logs 参数脱敏迁移 + 保留期清理 SQL
// 运行：node validate-h2-mail-logs.mjs   （Node 22+，用内置 node:sqlite，不连真实数据库）
// 覆盖：①迁移 012 清空存量 request_params；②保留期 DELETE 先删 mail_queue 子行再删 mail_logs，
//       且 datetime('now', ?) 绑定参数写法确实生效（否则会静默一行都删不掉）；③写入侧白名单不回退。
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';

const root = dirname(fileURLToPath(import.meta.url));
const mig = (f) => readFileSync(join(root, 'migrations', f), 'utf8');

const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON');
db.exec(mig('001_init.sql'));
db.exec(mig('011_add_request_params.sql'));

db.prepare("INSERT INTO users (id, name, email, password_hash) VALUES ('u1','t','t@x.com','h')").run();
const insLog = db.prepare(
  "INSERT INTO mail_logs (id, user_id, to_email, subject, request_params, created_at) VALUES (?,?,?,?,?,datetime('now','-40 days'))"
);
const insLogNow = db.prepare(
  "INSERT INTO mail_logs (id, user_id, to_email, subject, request_params) VALUES (?,?,?,?,?)"
);
const insQueue = db.prepare(
  "INSERT INTO mail_queue (id, mail_log_id, user_id, provider_id, to_email, subject, html) VALUES (?,?,?,?,?,?,?)"
);
// 40 天前的超期日志（含验证码明文）与其队列子行；今天的日志与队列子行（created_at 走表默认值）
insLog.run('old', 'u1', 'a@x.com', 'code 482913', '{"template":"verify","variables":{"code":"482913"}}');
insQueue.run('q-old', 'old', 'u1', 'p1', 'a@x.com', 'code 482913', '<b>482913</b>');
insLogNow.run('new', 'u1', 'b@x.com', 'hi', null);
insQueue.run('q-new', 'new', 'u1', 'p1', 'b@x.com', 'hi', '<b>hi</b>');

// ① 迁移 012：存量 request_params 全部清空
db.exec(mig('012_mail_log_params_redact.sql'));
assert.equal(db.prepare('SELECT request_params FROM mail_logs WHERE id = ?').get('old').request_params, null, '存量验证码明文未被清空');

// ② 保留期清理 SQL（镜像 db.ts cleanupOldMailLogs）
const retentionDays = 30;
const cutoff = `-${retentionDays} days`;
db.prepare("DELETE FROM mail_queue WHERE mail_log_id IN (SELECT id FROM mail_logs WHERE created_at < datetime('now', ?))").run(cutoff);
db.prepare("DELETE FROM mail_logs WHERE created_at < datetime('now', ?)").run(cutoff);
assert.equal(db.prepare('SELECT COUNT(*) c FROM mail_logs').get().c, 1, '超期 mail_logs 应只剩 1 行');
assert.equal(db.prepare('SELECT COUNT(*) c FROM mail_queue').get().c, 1, '超期子行应先被删除，且新行保留');
assert.equal(db.prepare("SELECT COUNT(*) c FROM mail_logs WHERE id = 'old'").get().c, 0, '超期日志未删除（datetime 绑定参数可能失效）');
assert.equal(db.prepare("SELECT COUNT(*) c FROM mail_queue WHERE id = 'q-old'").get().c, 0, '超期队列子行未删除');

// ③ 写入侧白名单不回退：request_params 不再原样塞正文/主题/变量值
const mailSrc = readFileSync(join(root, 'src', 'routes', 'mail.ts'), 'utf8');
assert.ok(!mailSrc.includes('variables: body.variables'), 'request_params 不得再落变量值');
assert.ok(!mailSrc.includes("html: body.html ? '***'"), 'request_params 不得再落正文占位');
assert.ok(mailSrc.includes('variable_keys'), '应保留变量键名白名单');

console.log('H-2 self-check: all assertions passed');
