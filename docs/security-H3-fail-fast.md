# [安全][H-3] JWT_SECRET / IMPERSONATION_SECRET 可选类型背后的兜底链 —— 审计与修复

- 任务：`t-mumm04jk-8yzuki`　基线：`main` @ `e5c91f1`（GitHub `MoruTeaven/Teaven-Email`）
- 结论：**成立（已确认）**。类型 `JWT_SECRET?` / `IMPERSONATION_SECRET?` 不只是类型宽松，运行期确实存在"缺失即用空串继续"的路径，其中模拟登录签名密钥还会回落到加密密钥。
- 状态：**代码已修复并本地验证**（见 §4/§5）。上线仍需人工执行 §6 的两步 `wrangler secret put`（处置⑧），否则 Worker 会对所有请求返回 503 —— 这正是预期的 fail-fast 行为。

## 1. 审计发现（按危险度）

| # | 位置（修复前） | 问题 |
|---|---|---|
| 缺陷 1 | `src/auth.ts:195-197` `return env.IMPERSONATION_SECRET \|\| env.JWT_SECRET \|\| '';` | 三重问题：缺失返回空串；**签名密钥回落复用加密密钥**；调用方只能靠 `if (!secret)` 兜底 |
| 缺陷 2 | `src/env.d.ts:10-11` 两把密钥均为 `?: string` | 类型层面允许缺失，`tsc` 不会拦下任何新增的漏配调用点 |
| 缺陷 3 | `routes/api_keys.ts:72/80`、`routes/admin/users.ts:117/125`、`routes/setup.ts:82/90`、`routes/setup.ts:227/236`：`const secret = c.env.JWT_SECRET || ''` + `secret ? await encryptApiKey(raw, secret) : null` | **静默降级**：密钥缺失时 API Key 明文不落库、密文写 `NULL`，接口照样返回 201/200，运维毫无感知；事后 `reveal` 才报 "created before encryption support" |
| 缺陷 4 | `queue_processor.ts:208` `encoder.encode(wh.secret || '')` + 同函数末尾 `} catch { // Webhook 失败不影响主流程 }` | 空密钥让 `crypto.subtle.importKey` 抛 `DataError`，被**空 catch 吞掉**：webhook 从不投递且无任何日志（同时是 E-11 的成因，已跨条到 `t-mumoroql-2k3anc`） |

补充：`mailer.ts:384`、`routes/admin/common.ts:57` 已有 `if (!env.JWT_SECRET) throw`，属于"抛错但错误信息/校验分散"，本次统一收敛到 `src/secrets.ts`。

## 2. 为什么"空串兜底"不是安全无害

在 Workers 的 WebCrypto 语义下实测（Node 24 同实现）：

| 操作 | secret = `''` 的结果 |
|---|---|
| `importKey(raw, <empty>, HMAC-SHA256)` | 抛 `DataError`（零长密钥被拒） |
| `crypto.subtle.digest('SHA-256', <empty>)` → 用作 AES 派生盐 | **成功**，且是全网所有部署共享的同一个确定值 |
| PBKDF2(password=`''`, salt=固定串, 100000) → AES-256-GCM | **成功派生出可预测密钥**：任何人可离线重放同一算法解开 `enc:v1:` 密文 |
| 攻击面 | 只要有人删掉 `if (!secret)` / `secret ? … : null` 这类"三元保护"，缺失密钥就从"报错"退化为"用公开常量加密/签名"；`imp_` 令牌一旦被空串常量签名，任何人可自签任意用户的 24 小时管理员模拟登录令牌 |

因此修复方向是 **fail-fast 拒绝服务**，而不是"给个默认值"或"跳过加密"。

## 3. 修复设计

- 新增 **`src/secrets.ts`**（零依赖、可单测）：
  - `requireSecret(name, value)`：拒绝 `undefined/null/非字符串/空串/首尾空白/UTF-8 字节 < 32/命中已知占位串/字符多样性 < 12`，错误信息**只描述缺什么、怎么补，绝不回显密钥内容**。
  - `getJwtSecret(env)` / `getImpersonationSecret(env)`：**用途分离**，后者不再回落 `JWT_SECRET`；两把值相等或互为前缀一律拒绝（`assertDistinctSecrets`）。
  - `assertRuntimeSecrets(env)`：入口级总校验，per-isolate memo（仅引用比较，不参与安全判定，故幂等且不放松）。
  - `resolveWebhookSigningSecret(secret)`：未配置返回 `null`（显式跳过签名头），占位串抛错。
  - `describeSecretError(err)`：可安全记录的摘要。
- 入口拦截（Workers 无模块级 env 可阻断，入口首行即"拒绝启动"的等价位置）：`index.ts fetch()` → 校验失败返回 **503 + 不泄露细节**；`index.ts scheduled()` 与 `queue_processor.processQueue()` → **不加 try/catch，让 cron 显式失败**并在 Workers 日志可见。
- 取值点全部替换：`src/auth.ts`（删除回落链 + 再导出）、`routes/api_keys.ts`、`routes/admin/users.ts`、`routes/setup.ts`（两处）、`routes/admin/common.ts`、`mailer.ts`。所有 `secret ? … : null` 静默降级三元一并删除 —— 要么加密入库，要么请求失败。

## 4. 变更清单（本次提交涉及文件）

```
src/secrets.ts                 新增：fail-fast 校验模块（处置②③）
src/env.d.ts                   两把密钥改为必填 + 指向 secrets.ts 的说明（处置①的类型侧）
src/index.ts                   fetch/scheduled 入口校验（处置②）
src/queue_processor.ts         入口校验 + webhook 空密钥显化 + 空 catch 改为 console.error（缺陷 4）
src/auth.ts                    删除 IMPERSONATION_SECRET||JWT_SECRET||'' 回落链；删除 if(!secret) 伪保护（处置③）
src/routes/api_keys.ts         getJwtSecret ×2；删除降级三元
src/routes/setup.ts            getJwtSecret ×2（超管 bootstrap + key-from-password 登录）；删除降级三元
src/routes/admin/users.ts      getJwtSecret；删除降级三元；impersonate 走 fail-fast
src/routes/admin/common.ts     getJwtSecret（服务商凭据入库前）
src/mailer.ts                  requireSecret（服务商凭据解密前）
README.md                      新增"运行时密钥（fail-fast，必读）"小节
AGENTS.md                      新增密钥取值规范，禁止再写 `|| ''` 兜底
```

## 5. 验证方式与结果

- 本机 `node_modules` 不可用（`Teaven Email - 源码` 目录内 `typescript`/`wrangler` 的 `package.json` 已被清零），因此**未跑 `npm run typecheck`（tsc）与 `wrangler dev`**；改用 Node 24 的 `module.stripTypeScriptTypes()` + ESM 解析做语法门禁，并直接加载 `secrets.ts` 做行为断言。
- 结果：33/33 断言通过；10 个改动文件 ESM 解析全部无 `SyntaxError`；仓库内 `JWT_SECRET||` / `IMPERSONATION_SECRET||` / `secret ? await` 形式残留 **0 处**（注释除外）；14 项接线静态检查全部命中。
- 关键回归断言：`getImpersonationSecret({ JWT_SECRET: <合法值> })` 现在抛 `SecretConfigError(secretName=IMPERSONATION_SECRET)` —— 即缺陷 1 的回落链确已消失。
- 待补（需要有依赖环境）：`npm ci && npm run typecheck`、`wrangler dev` + 一次真实发信、`wrangler tail` 看 cron 失败可见性。

## 6. 上线步骤（处置⑧，必须**先配密钥再部署**）

```bash
# 0) 先看现状：若只有 JWT_SECRET、没有 IMPERSONATION_SECRET，
#    说明线上一直在走缺陷 1 的回落链 —— 属于"已发生"的密钥复用事故，按泄露处理。
npx wrangler secret list

# 1) 各自生成独立随机密钥（48 字节 base64url，UTF-8 长度远大于 32）
node -p "require('crypto').randomBytes(48).toString('base64url')"   # 生成两次，取两个不同值
npx wrangler secret put JWT_SECRET            # 用途：API Key / 服务商凭据 AES-256-GCM 加密
npx wrangler secret put IMPERSONATION_SECRET  # 用途：管理员模拟登录令牌 HMAC-SHA256 签名

# 2) 部署并观察
npx wrangler deploy
npx wrangler tail
```

本地开发：`.dev.vars`（已被 gitignore）同样需要两个**随机**值，不能用 `changeme`/`development` 之类 —— 会被 `requireSecret` 直接拒绝。

注意事项：
- 部署后若 `IMPERSONATION_SECRET` 缺失，**所有** HTTP 请求返回 503、cron 显式失败。这是设计意图，不是回归。
- 旧版本用回落链签发的 `imp_` 令牌在新密钥下自动失效：管理员需重新点一次"模拟登录"，无需改数据。
- 历史 `api_key_encrypted IS NULL` 的行（缺陷 3 期间产生）保持原样，`reveal` 仍返回 400 提示"请新建 Key"；本次不做数据回填（无法回填：明文当初就未持久化）。
- 服务商凭据一直要求 `JWT_SECRET` 存在，故不存在"用空串加密入库"的存量数据。

## 7. 本任务未覆盖（处置④⑤，已另立任务跟踪）

- `imp_` 令牌仍缺 `aud` / `jti`，无吊销表；`exp` 固定 24 小时偏长；模拟登录无二次确认与审计落库。
- Cookie 目前 `HttpOnly`（+ Secure/SameSite 由 `buildAuthCookie` 按请求判定）仍需复核；`/v1/admin/*`、`/v1/*` 缺少 Origin/Sec-Fetch-Site 校验（CSRF 面）。
- 其余与密钥无关的空 catch（`routes/setup.ts` 迁移探测、`mailer.ts` socket 释放、前端 `dashboard_html.ts`）应作为技术债单独清理，本任务为避免扩大改动面未处理。

