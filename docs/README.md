# Teaven Email 开发文档

## 文档导航

| 文档 | 说明 |
|------|------|
| [架构设计](./architecture.md) | 系统整体架构、模块划分、数据流 |
| [数据库设计](./database.md) | 表结构、索引、关系说明 |
| [API 参考](./api.md) | 全部 API 端点、请求/响应格式 |
| [部署指南](./deployment.md) | Cloudflare Workers 部署流程 |
| [开发指南](./development.md) | 本地开发、调试、代码规范 |

## 项目概述

Teaven Email 是一个基于 **Cloudflare Workers** 的**多租户邮件基础设施平台**，为 SaaS 应用提供完整的邮件发送、模板管理、发送通道管理和异步队列处理能力。

### 核心能力

- **多租户隔离**：每个租户独立管理自己的模板、API Key 和分类路由
- **全局资源共享**：发送通道和发件账号由超级管理员统一配置，所有租户共享使用
- **三种发送通道**：SMTP（MailChannels）、Cloudflare Email Routing、第三方 API（SendGrid/Mailgun/Resend/AhaSend）
- **模板引擎**：基于 Handlebars，支持版本管理、变量提取和模板预览
- **分类路由调度**：可将不同类别的邮件路由到不同发送通道和发件账号
- **异步队列**：邮件先入队列，由 Cron 定时批量处理，支持自动重试和指数退避
- **负载均衡**：发件账号按 `daily_limit` 和 `sent_today` 选择最少使用的账号
- **Webhook 回调**：邮件状态变更时通知外部系统
- **每日统计**：按租户按天汇总发送数据
- **管理后台**：租户后台（`/dashboard`）和超管后台（`/admin`），均为内联 SPA

### 技术栈

| 组件 | 技术 |
|------|------|
| 运行时 | Cloudflare Workers |
| Web 框架 | Hono v4 |
| 数据库 | Cloudflare D1 (SQLite) |
| 缓存 | Cloudflare KV |
| 对象存储 | Cloudflare R2 |
| 模板引擎 | Handlebars v4 |
| 语言 | TypeScript 5 |
| CLI | Wrangler v3 |

### 项目结构

```
Teaven Email/
├── docs/                      # 开发文档（不同步 git）
├── migrations/                # D1 数据库迁移脚本
│   ├── 001_init.sql           # 初始化建表
│   ├── 002_global_accounts.sql # 账号全局化
│   └── 003_global_providers.sql # 发送通道全局化
├── src/
│   ├── index.ts               # Worker 入口，Hono 路由挂载
│   ├── types.ts               # TypeScript 类型定义
│   ├── db.ts                  # D1 数据库访问层
│   ├── auth.ts                # API Key 认证中间件
│   ├── template_engine.ts     # Handlebars 模板引擎封装
│   ├── mailer.ts              # 邮件发送引擎（3 通道）
│   ├── queue_processor.ts     # 邮件队列处理器
│   ├── admin_html.ts          # 超管后台 HTML
│   ├── dashboard_html.ts      # 租户后台 HTML
│   ├── env.d.ts               # 环境变量类型声明
│   └── routes/
│       ├── mail.ts            # 邮件发送路由
│       ├── templates.ts       # 模板管理路由
│       ├── providers.ts       # 发送通道管理路由
│       ├── api_keys.ts        # API Key 管理路由
│       ├── webhooks.ts        # Webhook 管理路由
│       ├── dashboard.ts       # 仪表盘 API
│       ├── setup.ts           # 初始化/登录
│       └── admin.ts           # 超管跨租户管理
├── wrangler.toml              # Cloudflare Workers 配置
├── package.json
├── tsconfig.json
└── README.md
```
