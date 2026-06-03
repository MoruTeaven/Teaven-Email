# 架构设计

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │                   Hono HTTP Layer                   │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐  │  │
│  │  │ /v1/*   │ │/dashboard│ │ /admin │ │ /setup  │  │  │
│  │  │ API路由 │ │ 租户后台  │ │超管后台 │ │初始化   │  │  │
│  │  └─────────┘ └──────────┘ └────────┘ └─────────┘  │  │
│  ├───────────────────────────────────────────────────┤  │
│  │                  Middleware Layer                   │  │
│  │  ┌──────────┐ ┌───────────────┐ ┌──────────────┐  │  │
│  │  │ CORS     │ │ Auth (API Key) │ │ SuperAdmin   │  │  │
│  │  └──────────┘ └───────────────┘ └──────────────┘  │  │
│  ├───────────────────────────────────────────────────┤  │
│  │                   Core Services                     │  │
│  │  ┌───────────┐ ┌──────────────┐ ┌──────────────┐  │  │
│  │  │ Mailer    │ │ Template     │ │ Queue        │  │  │
│  │  │ SMTP/API/ │ │ Engine       │ │ Processor    │  │  │
│  │  │ CF Email  │ │ (Handlebars) │ │ (Cron)       │  │  │
│  │  └───────────┘ └──────────────┘ └──────────────┘  │  │
│  │  ┌───────────┐ ┌──────────────┐ ┌──────────────┐  │  │
│  │  │ Auth      │ │ DB Layer     │ │ Category     │  │  │
│  │  │ (SHA-256) │ │ (D1 client)  │ │ Router       │  │  │
│  │  └───────────┘ └──────────────┘ └──────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                 Cloudflare Services                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │  │
│  │  │ D1 (DB)  │  │ KV Cache │  │ R2 (Object Store)│ │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 模块详解

### 1. 入口模块 (`index.ts`)

Worker 的入口文件，负责：
- 创建 Hono app 实例
- 配置全局 CORS（允许所有来源，支持常见 method 和 header）
- 挂载 HTML 页面路由（`/dashboard`、`/admin`）
- 创建 `/v1` 子路由组，挂载所有业务路由模块
- 暴露 `/__internal/process-queue` 手动队列处理端点
- 导出 `scheduled()` 处理 Cron 触发器（定时调用 `processQueue()`）

### 2. 认证模块 (`auth.ts`)

采用 **API Key + SHA-256 哈希** 的认证方案：

**生成流程**：
1. 调用 `generateApiKey()` → 生成 64 位随机 hex 字符串，前缀 `sk_`
2. 对原始 key 做 SHA-256 哈希 → `hashApiKey()`
3. 将 hash、prefix（`sk_xxxx` 前 12 字符）存入 `api_keys` 表
4. **仅在创建时返回原始 key 一次**，之后无法再次获取

**验证流程**：
1. 从 `Authorization: Bearer sk_...` 提取 key → `extractApiKey()`
2. 对 key 做 SHA-256 哈希
3. 查 `api_keys` 表匹配 hash → `getApiKeyByHash()`
4. 校验 key 状态（enabled）和用户状态（active）
5. 校验权限（与 key 的 `permissions` 字段对比）
6. 通过后设置 `AuthContext` 到 context，更新 `last_used_at`

**权限级别**：
- `SEND_MAIL` — 发送邮件
- `READ_LOG` — 查看日志和统计
- `MANAGE_TEMPLATE` — 模板管理
- `MANAGE_PROVIDER` — Provider 配置管理

### 3. 数据库层 (`db.ts`)

**设计模式**：工厂函数 `getDB(db: D1Database)` 返回封装好的数据访问对象。

覆盖全部 10 张表的 CRUD 操作，关键特点：
- 所有 SQL 用参数化查询，防止注入
- JSON 字段（`config`、`permissions`、`variables`、`events`）在应用层做序列化/反序列化
- `getTemplatesByUser()` 使用子查询只返回每个 `template_code` 的最新版本
- `updateProvider()` 动态构建 SET 子句，只更新有值的字段
- `incrementAccountSent()` 使用 `UPDATE ... SET sent_today = sent_today + 1`
- `upsertDailyStats()` 使用 `INSERT OR REPLACE`

### 4. 邮件发送引擎 (`mailer.ts`)

**三种通道**：

#### SMTP 通道 (`sendViaSmtp`)
- 通过 **MailChannels API**（`https://api.mailchannels.net/tx/v1/send`）中转发送
- 构造标准的 MailChannels SendRequest JSON 格式
- 支持 `tls`/`starttls` 加密方式

#### Cloudflare Email 通道 (`sendViaCloudflareEmail`)
- 同样通过 MailChannels API 发送
- 使用 Cloudflare Email Routing 的 DKIM 签名
- 需配置 `domain` 和 `dkim_selector`

#### 第三方 API 通道 (`sendViaApi`)
支持四种服务商：
- **SendGrid** — `POST https://api.sendgrid.com/v3/mail/send`
- **Mailgun** — `POST https://api.mailgun.net/v3/{domain}/messages`
- **Resend** — `POST https://api.resend.com/emails`
- **通用** — 自定义 `api_url`，`POST` 发送 JSON body

**负载均衡** (`selectAccount`)：
- 过滤 `enabled` 且 `sent_today < daily_limit` 的账号
- 选择 `sent_today` 最小的账号（最少使用优先）
- 发送成功后调用 `incrementAccountSent()`

**重试机制** (`sendWithRetry`)：
- 默认最多 3 次重试
- 指数退避：`delay = 2^n * 1000ms`（n 为重试次数）
- 最后一次尝试失败才标记为失败

### 5. 模板引擎 (`template_engine.ts`)

基于 Handlebars，提供：
- **内置 Helpers**：`{{uppercase str}}`、`{{lowercase str}}`、`{{date format}}`、`{{currentYear}}`
- **变量提取**：正则匹配 `{{变量名}}` 模式
- **变量验证**：检查提供的变量是否包含所有模板需要的变量
- **HTML 转文本**：`htmlToText()` 处理 `<br>`、`<p>`、`<h1>`-`<h6>`、HTML 实体
- **模板编译**：`Handlebars.compile()` 编译后缓存（同一 session 内）

### 6. 队列处理器 (`queue_processor.ts`)

**处理流程**：
1. Cron 或手动触发 `processQueue(env)`
2. 从 `mail_queue` 表查询 `status='queued'` 且 `scheduled_at <= now` 的记录（最多 10 条）
3. 对每条：
   - 标记 `status='processing'`
   - 获取 Provider 配置（含 config JSON 反序列化）
   - 调用 `sendWithRetry(provider, params, item.max_retries)`
   - 成功 → `status='completed'`，更新 `mail_logs` 状态，`incrementAccountSent()`，`upsertDailyStats()`，触发 webhook
   - 失败 → 递增 `retry_count`，计算下次重试时间（指数退避），未达上限则重置为 `queued`，否则标记 `failed`，触发 webhook

**重试策略**：`next_retry_at = now + 2^retry_count * 60 秒`

### 7. 分类路由

邮件发送时的路由决策链：
1. 根据请求中的 `category`（VERIFY/NOTIFY/MARKETING/SYSTEM）查找 `category_routes` 表
2. 有匹配规则 → 使用指定的 `provider_id` 和 `account_id`
3. 无匹配规则 → 使用默认 Provider（优先级最高且 enabled）
4. 通过 `selectAccount()` 在 Provider 的账号中选择负载均衡的账号

## 数据流

### 模板发送流程

```
Client API Call (POST /v1/mail/send-template)
  │
  ├─ 1. authMiddleware → 验证 API Key
  │
  ├─ 2. 查找模板 (getTemplateByCode)
  │    └─ 验证变量完整性 (validateVariables)
  │
  ├─ 3. 渲染模板 (renderTemplate + renderSubject)
  │
  ├─ 4. 路由决策
  │    ├─ 查 category_routes → 获取 provider_id + account_id
  │    ├─ 或找默认 Provider (getEnabledProviders)
  │    └─ selectAccount → 负载均衡选账号
  │
  ├─ 5. 记录 mail_logs (status='pending')
  │
  ├─ 6. 入队 mail_queue (status='queued')
  │
  └─ 7. 返回 { success: true, message: "邮件已加入发送队列" }
```

### 队列处理流程

```
Cron Trigger (scheduled) / Manual (POST /__internal/process-queue)
  │
  ├─ 1. processQueue(env)
  │
  ├─ 2. 查询 mail_queue (status='queued', scheduled_at <= now, LIMIT 10)
  │
  ├─ 3. 对每条:
  │    ├─ UPDATE status='processing'
  │    ├─ 获取 Provider 配置
  │    ├─ sendWithRetry(provider, params, maxRetries)
  │    ├─ 成功:
  │    │   ├─ UPDATE queue status='completed'
  │    │   ├─ UPDATE mail_logs status='sent'
  │    │   ├─ incrementAccountSent
  │    │   ├─ upsertDailyStats
  │    │   └─ triggerWebhooks('sent')
  │    └─ 失败:
  │        ├─ retry_count++
  │        ├─ 未达上限 → next_retry_at = now + backoff, status='queued'
  │        └─ 达到上限 → status='failed', triggerWebhooks('failed')
  │
  └─ 4. 返回 { processed: N }
```

## 安全设计

1. **API Key 哈希存储**：只存 SHA-256 哈希，原始 key 仅在创建时返回一次
2. **参数化 SQL**：全部使用 `?` 占位符，防止 SQL 注入
3. **权限粒度控制**：4 种权限按需分配，中间件校验
4. **超管隔离**：`is_super_admin` 字段 + `superAdminMiddleware` 中间件
5. **JWT_SECRET**：环境变量存储，用于 session 签名
