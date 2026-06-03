# Teaven Email 项目记忆

## 项目概述
多租户邮件基础设施平台，部署在 Cloudflare Workers 上。

## 技术栈
- Runtime: Cloudflare Workers
- 框架: Hono v4
- 数据库: Cloudflare D1 (SQLite)
- 模板引擎: Handlebars
- 语言: TypeScript

## 核心架构
- 三通道邮件发送：SMTP、Cloudflare Email、第三方 API (SendGrid/Mailgun/Resend)
- API Key 认证 + 多租户数据隔离 (WHERE user_id = current_user_id)
- 异步队列 + Cron Trigger 处理邮件发送
- Handlebars 模板引擎，支持变量替换和版本管理
- 分类路由调度 (VERIFY/NOTIFY/MARKETING/SYSTEM → 不同 Provider)

## API 设计
- 所有 API 以 `/v1/` 前缀
- 认证：`Authorization: Bearer sk_xxxxxx`
- 权限粒度：SEND_MAIL, MANAGE_TEMPLATE, READ_LOG, MANAGE_PROVIDER
- 后台管理：`/dashboard`

## 文件结构
```
src/
├── index.ts              # Worker 入口
├── types.ts              # 类型定义
├── db.ts                 # D1 数据库访问层
├── auth.ts               # API Key 认证
├── template_engine.ts    # Handlebars 模板引擎
├── mailer.ts             # 三通道邮件发送
├── queue_processor.ts    # 队列处理器
├── dashboard_html.ts     # 内联后台界面
└── routes/
    ├── mail.ts           # 邮件发送路由
    ├── templates.ts      # 模板管理
    ├── providers.ts      # Provider/Account/Route 管理
    ├── api_keys.ts       # API Key 管理
    ├── webhooks.ts       # Webhook 配置
    └── dashboard.ts      # 仪表盘 API
```

## 用户偏好
- 用户希望平台运行在 Cloudflare 上
- 发送方式：第三方API + SMTP + Cloudflare Email 三种
