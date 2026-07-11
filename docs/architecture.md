# 架构设计

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │                   Hono HTTP Layer                   │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐  │  │
│  │  │ /v1/*   │ │/dashboard│ │ /admin │ │ /setup  │  │  │
│  │  │ API路由 │ │ 用户后台  │ │超管后台 │ │初始化   │  │  │
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
│  │  │ CF Email  │ │ Engine       │ │ (Cron)       │  │  │
│  │  └───────────┘ └──────────────┘ └──────────────┘  │  │
│  │  ┌───────────┐ ┌──────────────┐ ┌──────────────┐  │  │
│  │  │ Auth      │ │ DB Layer     │ │ Category     │  │  │
│  │  │ PBKDF2/API│ │ (D1 client)  │ │ Router       │  │  │
│  │  └───────────┘ └──────────────┘ └──────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                 Cloudflare Services                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │  │
│  │  │ D1 (DB)  │  │ KV Cache │  │ Email Sending   │ │  │
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

### 1.1 管理面板前端 (`dashboard_html.ts` / `admin_html.ts`)

用户中心和超级管理员后台是无前端框架的单文件 Hash SPA：
- 每个页面常驻一个独立 `.page-section`，hash 切换只更新 active 状态、侧栏高亮和面包屑，不重新请求 HTML
- GET 请求进入内存缓存，已加载页面再次进入先展示已有 DOM，再通过 stale-while-revalidate 静默刷新数据
- 写操作只失效相关接口前缀和对应页面，避免保存一个资源后刷新整个面板
- 初始化后预加载轻量 L0/L1 页面；日志、分析等较重页面按需加载，管理员日志会预取相邻分页
- 自动刷新只监听 `visibilitychange` 和 `focus`，用户切回页面时刷新当前 section，不做后台定时轮询

### 2. 认证模块 (`auth.ts`)

采用 **API Key + SHA-256 哈希 + HttpOnly Cookie 会话** 的认证方案。账号密码使用 PBKDF2-SHA256 加盐慢哈希，旧 SHA-256 密码在成功登录后自动升级。

**生成流程**：
1. 调用 `generateApiKey()` → 生成 64 位随机 hex 字符串，前缀 `sk_`
2. 对原始 key 做 SHA-256 哈希 → `hashApiKey()`
3. 将 hash、prefix（`sk_xxxx` 前 12 字符）存入 `api_keys` 表
4. 手动 Key 仅创建时返回原始值；加密存储的 Key 可在验证密码后重新查看
5. 账号密码登录创建 `auto_created=1` 的短期 Key，并通过 HttpOnly Cookie 供后台页面使用

**验证流程**：
1. 从 `Authorization: Bearer sk_...` 或 `teaven_auth` HttpOnly Cookie 提取 key
2. 对 key 做 SHA-256 哈希
3. 查 `api_keys` 表匹配 hash → `getApiKeyByHash()`
4. 校验 key 状态（enabled）和用户状态（active）
5. 校验权限（与 key 的 `permissions` 字段对比）
6. 通过后设置 `AuthContext` 到 context，更新 `last_used_at`

**权限级别**：
- `SEND_MAIL` — 发送邮件
- `READ_LOG` — 查看日志和统计
- `MANAGE_TEMPLATE` — 模板管理
- `MANAGE_PROVIDER` — 历史权限标识；发送通道和账号本身为全局资源，仅超管可管理
- `VERIFY_CODE` — 验证码校验

**角色说明**：
- **超级管理员**（`is_super_admin=1`）：通过 `/v1/admin/*` 管理全局发送通道、发件账号和所有用户
- **普通用户**：管理自己的模板和 API Key，查看全局发送通道，使用全局发送通道和发件账号发送邮件

### 3. 数据库层 (`db.ts`)

**设计模式**：工厂函数 `getDB(db: D1Database)` 返回封装好的数据访问对象。

覆盖全部业务表的 CRUD 操作，关键特点：
- 所有 SQL 用参数化查询，防止注入
- JSON 字段（`config`、`permissions`、`variables`、`events`）在应用层做序列化/反序列化
- `getTemplatesByUser()` 使用子查询只返回每个 `template_code` 的最新版本
- `updateProvider()` 动态构建 SET 子句，只更新有值的字段
- `daily_send_usage` 使用 `INSERT ... ON CONFLICT DO UPDATE ... WHERE count < limit RETURNING` 原子预约每日用户配额
- `upsertDailyStats()` 使用 `ON CONFLICT(user_id, date) DO UPDATE`
- **发送通道和 Account 为全局资源**，查询不按 `user_id` 过滤

### 4. 邮件发送引擎 (`mailer.ts`)

**三种通道**：

#### SMTP 通道 (`sendViaSmtp`)
- 通过 Cloudflare Workers TCP sockets 直连 SMTP 服务
- 构造 MIME multipart/alternative 邮件内容
- 支持 `ssl` / `tls`(STARTTLS) / `none` 加密方式

#### Cloudflare Email 通道 (`sendViaCloudflareEmail`)
- 通过 Workers `send_email` binding 发送
- 校验发件域名与 Provider `domain` 一致

#### 第三方 API 通道 (`sendViaApi`)
支持五种服务商：
- **SendGrid** — `POST https://api.sendgrid.com/v3/mail/send`
- **Mailgun** — `POST https://api.mailgun.net/v3/{domain}/messages`
- **Resend** — `POST https://api.resend.com/emails`
- **AhaSend** — `POST https://api.ahasend.com/v2/accounts/{account_id}/messages`（需配置 `account_id`）
- **通用** — 自定义 `api_url`，`POST` 发送 JSON body

**负载均衡** (`selectAccount`)：
- 过滤 `enabled` 且 `sent_today < daily_limit` 的账号
- 选择 `sent_today` 最小的账号（最少使用优先）
- 发送成功后调用 `incrementAccountSent()`

**重试机制**：队列表 `max_retries` 统一控制重试次数；单次队列处理只执行一次投递尝试，避免发送层和队列层双重重试叠加。

### 5. 模板引擎 (`template_engine.ts`)

自定义零依赖字符串模板引擎，提供：
- **内置 Helpers**：`{{uppercase str}}`、`{{lowercase str}}`、`{{date}}`、`{{currentYear}}`
- **变量提取**：正则匹配 `{{变量名}}` 模式
- **变量验证**：检查提供的变量是否包含所有模板需要的变量
- **HTML 转文本**：`htmlToText()` 处理 `<br>`、`<p>`、`<h1>`-`<h6>`、HTML 实体
- 不使用 `eval` / `new Function`，兼容 Workers CSP

### 6. 队列处理器 (`queue_processor.ts`)

**处理流程**：
1. Cron 或手动触发 `processQueue(env)`
2. 从 `mail_queue` 表查询 `status='queued'` 且 `scheduled_at <= now` 的记录（最多 10 条）
3. 对每条：
   - 标记 `status='processing'`
   - 获取发送通道配置（含 config JSON 反序列化）
   - 检查 Provider/Account 仍启用，调用单次发送
   - 成功 → `status='completed'`，更新 `mail_logs` 状态，`incrementAccountSent()`，`upsertDailyStats()`，触发 webhook
   - 失败 → 递增 `retry_count`，计算下次重试时间（指数退避），未达上限则重置为 `queued`，否则标记 `failed`，触发 webhook

**重试策略**：`next_retry_at = now + retry_count * 30 秒`，`processing` 状态下 `next_retry_at` 也作为租约过期时间。

### 7. 分类路由

邮件发送时的路由决策链：
1. 根据请求中的 `category`（VERIFY/NOTIFY/MARKETING/SYSTEM）匹配全局发件账号的 `accounts.categories`
2. 有匹配账号 → 按当日 pending/sent/delivered 数量选择负载较低的账号
3. 无匹配账号 → 回退到启用的全局 Provider，再按账号负载均衡
4. `category_routes` 表已废弃，仅保留历史数据，不参与路由

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
  │    ├─ 按 accounts.categories 匹配全局发件账号
  │    ├─ 或找全局默认发送通道 (getEnabledProviders)
  │    └─ selectAccount → 从全局账号池负载均衡选账号
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
  │    ├─ 单次发送尝试（重试由队列表控制）
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
5. **凭据保护**：Provider 的 SMTP/API 凭据以 `JWT_SECRET` 加密入库，管理接口只返回掩码
6. **前端会话**：Dashboard/Admin 使用 HttpOnly Cookie，不持久化登录 Key 到 `localStorage`
7. **模板预览隔离**：用户模板 HTML 通过 sandbox iframe 预览，避免同源 DOM XSS
