# Teaven Email - 多租户邮件基础设施平台

基于 Cloudflare Workers 的多租户邮件平台，支持多用户、多项目、多 Provider、多模板、多发件账号和分类调度。

## 架构

```
┌─────────────────────────────────────────────────┐
│                  Teaven Email                     │
├─────────────────────────────────────────────────┤
│  API Layer (Hono)                                │
│  ├─ /v1/mail/send         普通发送               │
│  ├─ /v1/mail/send-template  模板发送             │
│  ├─ /v1/templates         模板管理               │
│  ├─ /v1/providers         Provider 管理           │
│  ├─ /v1/api-keys          API Key 管理           │
│  └─ /dashboard            后台管理界面           │
├─────────────────────────────────────────────────┤
│  Core Services                                   │
│  ├─ Auth (API Key)         认证中间件             │
│  ├─ Template Engine (Handlebars) 模板渲染        │
│  ├─ Mailer (3 channels)    邮件发送引擎           │
│  │   ├─ SMTP                                    │
│  │   ├─ Cloudflare Email                        │
│  │   └─ Third-party API                         │
│  ├─ Queue Processor        异步队列处理           │
│  └─ Category Router        分类路由调度           │
├─────────────────────────────────────────────────┤
│  Storage                                         │
│  ├─ D1 Database           主数据存储             │
│  ├─ KV Namespace          缓存/配置              │
│  └─ R2 Bucket             静态资源               │
└─────────────────────────────────────────────────┘
```

## 技术栈

- **Runtime**: Cloudflare Workers
- **框架**: Hono (轻量 Web 框架)
- **数据库**: Cloudflare D1 (SQLite)
- **缓存**: Cloudflare KV
- **存储**: Cloudflare R2
- **模板引擎**: Handlebars
- **语言**: TypeScript

## 部署

```bash
npm install
npx wrangler d1 create teaven-email-db
npx wrangler kv:namespace create "teaven-email-kv"
npx wrangler r2 bucket create teaven-email
```

将创建的 database_id、namespace id 填入 `wrangler.toml`，然后：

```bash
npx wrangler d1 execute teaven-email-db --remote --file=./migrations/001_init.sql
npm run deploy
```

部署后访问 `/dashboard`，页面会自动引导创建管理员账户。

> **注意**：如果未提前运行迁移脚本，首次注册时系统会自动建表。

## API 文档

### 认证

所有 API 请求需要在 Header 中携带 API Key：

```http
Authorization: Bearer sk_xxxxxx
```

### 邮件发送

#### 模板发送

```http
POST /v1/mail/send-template
Content-Type: application/json

{
  "template": "VERIFY_CODE",
  "to": "user@example.com",
  "variables": {
    "code": "123456"
  }
}
```

#### 普通发送

```http
POST /v1/mail/send
Content-Type: application/json

{
  "category": "NOTIFY",
  "to": "user@example.com",
  "subject": "通知标题",
  "html": "<h1>Hello</h1>"
}
```

### 模板管理

```http
GET    /v1/templates              # 获取模板列表
GET    /v1/templates/:code        # 获取模板详情
POST   /v1/templates              # 创建模板
PUT    /v1/templates/:code        # 更新模板（创建新版本）
DELETE /v1/templates/:code        # 删除模板
POST   /v1/templates/:code/preview # 预览模板渲染
GET    /v1/templates/:code/versions # 版本历史
```

### Provider 管理

```http
GET    /v1/providers              # Provider 列表
POST   /v1/providers              # 创建 Provider
PUT    /v1/providers/:id          # 更新 Provider
DELETE /v1/providers/:id          # 删除 Provider
GET    /v1/providers/accounts     # 发件账号列表
POST   /v1/providers/accounts     # 创建发件账号
DELETE /v1/providers/accounts/:id # 删除发件账号
GET    /v1/providers/routes       # 分类路由列表
POST   /v1/providers/routes       # 创建分类路由
DELETE /v1/providers/routes/:id   # 删除分类路由
```

### API Key 管理

```http
GET    /v1/api-keys              # API Key 列表
POST   /v1/api-keys              # 创建 API Key
DELETE /v1/api-keys/:id          # 删除 API Key
PUT    /v1/api-keys/:id/toggle   # 启用/禁用
```

### 日志 & 统计

```http
GET    /v1/mail/logs             # 发送日志
GET    /v1/mail/logs/:id         # 单条日志
GET    /v1/mail/stats            # 发送统计
GET    /v1/dashboard/overview    # 仪表盘概览
```

## 发送通道

### 1. SMTP

```json
{
  "type": "smtp",
  "config": {
    "host": "smtp.example.com",
    "port": 587,
    "username": "user@example.com",
    "password": "password",
    "encryption": "tls"
  }
}
```

### 2. Cloudflare Email

利用 Cloudflare Email Routing 发送邮件。

```json
{
  "type": "cloudflare_email",
  "config": {
    "domain": "example.com",
    "dkim_selector": "mailchannels"
  }
}
```

### 3. 第三方 API

支持 SendGrid、Mailgun、Resend 等。

```json
{
  "type": "api",
  "config": {
    "provider_name": "sendgrid",
    "api_key": "SG.xxxxxx",
    "api_url": ""
  }
}
```

## 目录结构

```
src/
├── index.ts              # Worker 入口
├── types.ts              # 类型定义
├── db.ts                 # 数据库访问层
├── auth.ts               # API Key 认证
├── template_engine.ts    # Handlebars 模板引擎
├── mailer.ts             # 邮件发送引擎
├── queue_processor.ts    # 队列处理器
├── dashboard_html.ts     # 后台管理界面
├── env.d.ts              # 环境类型声明
└── routes/
    ├── mail.ts           # 邮件发送路由
    ├── templates.ts      # 模板管理路由
    ├── providers.ts      # Provider 管理路由
    ├── api_keys.ts       # API Key 管理路由
    ├── webhooks.ts       # Webhook 路由
    └── dashboard.ts      # 仪表盘路由
```

## 后台管理

访问 `/dashboard` 进入后台管理界面，支持：

- 仪表盘概览
- API Key 管理
- 模板创建/编辑/预览
- Provider 配置（SMTP/API/Cloudflare Email）
- 发件账号管理
- 分类路由规则
- 发送日志查看

## 队列处理

邮件发送采用异步队列模式。配置 Cron Trigger 自动处理：

```toml
[triggers]
crons = ["*/30 * * * *"]
```

也可以手动触发：

```http
POST /__internal/process-queue
```
