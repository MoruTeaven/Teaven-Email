# Agents.md — AI 编码助手行为规范

## 部署约束

- **禁止本地部署尝试**：本项目只支持 Cloudflare Workers 部署，不要在任何情况下建议或执行本地服务器启动、`npm run dev` 中的本地 HTTP 服务、或其他非 Cloudflare 的部署方式。
- 本地开发仅使用 `wrangler dev`（Cloudflare Workers 本地模拟），如涉及预览也仅通过 wrangler 本地环境。

## Git 约束

- **不要主动同步 git**：不要执行 `git add`、`git commit`、`git push`、`git pull` 等 git 操作，除非用户明确要求。不得擅自修改 git 历史或分支状态。

## 其他约定

- 优先使用 `wrangler` CLI 进行所有 Workers 相关的开发、调试和部署操作。
- 涉及数据库变更时，通过 D1 migrations 进行，不要直接操作生产数据库。

## 密钥取值（fail-fast，硬性规范）

- `JWT_SECRET`（加密：API Key、服务商凭据）与 `IMPERSONATION_SECRET`（签名：模拟登录令牌）是**两把独立密钥**，各自 ≥32 字节随机值，禁止相等或互为前缀，禁止任何内置默认值。
- 所有取值必须经过 `src/secrets.ts`：`getJwtSecret(env)` / `getImpersonationSecret(env)` / `requireSecret(name, value)`；缺失或过弱会抛 `SecretConfigError`（消息不含密钥内容）。**严禁**再写 `env.JWT_SECRET || ''`、`secret ? await encryptApiKey(...) : null` 这类兜底或静默降级写法。
- 新增任何运行时入口（fetch / scheduled / queue，以及未来的 DO、R2 触发器）首行调用 `assertRuntimeSecrets(env)`：HTTP 入口用 try/catch 返回 503，非 HTTP 入口**不要捕获**，让漏配在 Workers 日志里显式失败。
- Webhook 的 `secret` 属于用户可选配置：未配置时显式跳过 `X-Webhook-Signature` 并 `console.warn`，禁止用空串去做 HMAC（WebCrypto 会抛 DataError，空 catch 会让投递静默失败）。
- 上线顺序：先 `npx wrangler secret put` 两把密钥，再 `wrangler deploy`。审计背景见 `docs/security-H3-fail-fast.md`。

## 权限与资源归属

- **发送通道和发件账号为全局资源**，不由任何用户私有。仅超级管理员（`/v1/admin/*`）可创建、修改、删除。
- **普通用户**只能查看全局发送通道列表、管理自己的模板/API Key。发送邮件时自动使用管理员配置的全局发送通道和账号。
- **分类路由**：已合并到发件账号的 `categories` 字段（逗号分隔的分类列表）。超管在创建/编辑账号时可多选分类（VERIFY/NOTIFY/MARKETING/SYSTEM），发信时按分类匹配可用账号（负载均衡）。无用户隔离，所有用户共享。
- **`category_routes` 表已废弃**（迁移 004），保留但不使用。
- **登录自动 API Key / Cookie 会话**：用户通过 `POST /v1/setup/key-from-password` 登录时自动创建的 Key 标记 `auto_created=1`，过期时间由 `auto_api_key_ttl_hours` 控制。这类 Key **不展示在** Dashboard API Keys 列表和 Admin 用户 Key 计数中。后台页面通过 `teaven_auth` HttpOnly Cookie 使用该 Key，前端不得把登录 Key 持久化到 `localStorage`。Cron + 懒清理 + 认证中间件三重机制确保过期 Key 被及时删除。
- **API Key 权限边界**：通过已有 API Key 创建新 Key 时，新 Key 权限不得超过当前 Key 已有权限，防止低权限 Key 自我提权。
- **密码存储**：新密码使用 PBKDF2-SHA256 加盐哈希。旧 SHA-256 密码仅用于兼容，成功登录或 reveal 后必须自动升级。
- **Provider 凭据保护**：SMTP `password` 和 API `api_key` 使用 `JWT_SECRET` 以 `enc:v1:` 加密入库；`/v1/admin/providers` 只返回掩码。创建/更新含敏感 Provider 配置前必须确保 `JWT_SECRET` 已配置。
- 前端 `dashboard_html.ts` 为用户后台（只读），`admin_html.ts` 为超级管理员后台（完整管理）。用户后台含"个人中心"页面，普通用户可通过 `PUT /v1/dashboard/profile` 修改自己的昵称（邮箱不可改）；`GET /v1/dashboard/profile` 返回当前用户资料。
- 用户注册后自动获得使用全局资源的权限，无需单独绑定。
- **用户管理**：超级管理员通过 `PUT /v1/admin/tenants/:id` 可更新用户的昵称（`name`，非空、≤50 字符）、状态（`status`）、超管标记（`is_super_admin`）。后台用户列表提供"编辑"按钮修改昵称，邮箱不可改（展示为只读）。
- **队列处理**：`/__internal/process-queue` 手动 HTTP 触发仅支持 `POST`，必须通过超级管理员 API Key/Cookie 鉴权；正常自动处理使用 Cloudflare Cron Trigger 和发信请求的 `waitUntil(processQueue)`。队列表领取必须使用原子 claim，`processing` 状态下 `next_retry_at` 表示处理租约过期时间，超时后回到 `queued` 防止卡死。队列层统一控制重试次数，发送层单次尝试，避免双层重试叠加。
- **每日发信配额**：每用户每日发信上限通过 `daily_send_usage`（migration 010）原子预约，不能回退到 `mail_logs` 先查后写。验证码发信也必须计入该配额。
- **邮件日志脱敏与保留期（H-2）**：`mail_logs.request_params` 只允许写白名单元数据（模板码/分类/版本/变量键名，**正文与变量值一律不入库**）；存量由 migration 012 清空；cron 每小时整点删除超过 30 天的 `mail_logs` 及其 `mail_queue` 子行（先删子表）。读取端 `getMailLogs` 必须保持 `user_id` 过滤。详见 `docs/security-H2-mail-logs.md`。
- **验证码租户隔离**：验证码记录、查询、旧码失效和 KV 限流必须按 `user_id + email + scene_type` 隔离，避免不同用户使用相同邮箱和场景时互相影响。
- **系统设置**：全局 key-value 配置存储在 `system_settings` 表（migration 009），仅超级管理员通过 `GET/PUT /v1/admin/settings` 读写。访问层在 `src/settings.ts`（`loadSettings` / `getSetting` / `getIntSetting` / `isMaintenanceMode`），数据库故障时自动降级到 `SETTING_DEFAULTS`，不阻塞业务。已接入实际行为的设置项：
  - `maintenance_mode` / `maintenance_message`：维护模式开启后，`/v1/mail/send`、`/v1/mail/send-template`、`/v1/verification/send` 返回 503（管理员后台 `/v1/admin/*` 不受影响）。
  - `default_max_retries`：邮件队列项 `max_retries` 默认值（替换原硬编码 `3`）。
  - `default_daily_limit_per_user`：每用户每日发信上限（0=不限制，超出返回 429）。
  - `verification_code_ttl_minutes` / `verification_code_length`：验证码默认有效期与长度（调用方未指定时回退）。
  - `verification_max_attempts`：单条验证码最大尝试次数（替换原硬编码 `MAX_ATTEMPTS_PER_CODE=5`）。
  - `auto_api_key_ttl_hours`：登录自动创建的 API Key 有效期（替换原硬编码 24h）。
  - `platform_name` / `admin_contact_email` / `announcement`：仅存储，供后续展示使用。
  - 写入受 `WRITABLE_KEYS` 白名单约束，整型设置在 `INT_SETTING_BOUNDS` 范围内夹取。

- **数据分析**：超级管理员后台的"数据分析"页面（`/v1/admin/analytics?days=N`）以 `mail_logs` 表为数据源实时聚合，不依赖 `daily_stats`。支持 7/30/90/365 天时间范围。返回每日趋势、状态分布（环形图）、分类统计、用户/通道/账号排行（Top 8）、最近错误列表和队列状态。统计口径：sent+delivered=成功，failed+bounced+spam=失败，pending 不计入成功率分母。前端实现见 `src/admin_html.ts` 的 `renderAnalytics` 函数。
- **管理面板前端体验**：`dashboard_html.ts` 和 `admin_html.ts` 采用单文件 Hash SPA。每个页面常驻独立 `section`，切换只改 active 状态；自动刷新基于 `visibilitychange`/`focus` 刷新当前页面，不使用后台定时轮询。
- **前后端两级缓存机制**：
  - 前端数据层（`apiCache`）采用两级 SWR（stale-while-revalidate）：每条缓存项有 `fresh`/`stale` 两个 TTL（按路由配置 `_ROUTE_TTL`，如 stats 短、analytics/settings 长）；命中 fresh 直接返回，命中 stale 立即返回旧值并后台 `_revalidate`（带 inflight 去重避免重复请求），miss 才发请求。写操作经 `apiMutate` 在 `await api()` 成功**之后**才 `invalidateCache`（删除受影响条目），失败不失效。`refreshPageInBackground` 只标记 dirty 重渲染，不再强制清缓存，让 SWR 自行决定是否刷新。
  - 后端 isolate 级内存缓存（`src/routes/admin.ts`）：`/stats`（TTL 15s）与 `/analytics`（TTL 60s，按 days 分桶）缓存重查询结果，跨请求复用 isolate 时生效，isolate 回收后自动失效不影响正确性。所有写操作（tenants/providers/accounts 增删改、测试邮件发件）成功后调用 `invalidateAdminCache()` 清空缓存。`/stats` 内部用 `Promise.all` 并行化 6 个 COUNT 查询。

** 一些重大的更改记得更新agents.md和 docs/ **
