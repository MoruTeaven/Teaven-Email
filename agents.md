# Agents.md — AI 编码助手行为规范

## 部署约束

- **禁止本地部署尝试**：本项目只支持 Cloudflare Workers 部署，不要在任何情况下建议或执行本地服务器启动、`npm run dev` 中的本地 HTTP 服务、或其他非 Cloudflare 的部署方式。
- 本地开发仅使用 `wrangler dev`（Cloudflare Workers 本地模拟），如涉及预览也仅通过 wrangler 本地环境。

## Git 约束

- **不要主动同步 git**：不要执行 `git add`、`git commit`、`git push`、`git pull` 等 git 操作，除非用户明确要求。不得擅自修改 git 历史或分支状态。

## 其他约定

- 优先使用 `wrangler` CLI 进行所有 Workers 相关的开发、调试和部署操作。
- 涉及数据库变更时，通过 D1 migrations 进行，不要直接操作生产数据库。

## 权限与资源归属

- **发送通道和发件账号为全局资源**，不由任何用户私有。仅超级管理员（`/v1/admin/*`）可创建、修改、删除。
- **普通用户**只能查看全局发送通道列表、管理自己的模板/API Key。发送邮件时自动使用管理员配置的全局发送通道和账号。
- **分类路由**：已合并到发件账号的 `categories` 字段（逗号分隔的分类列表）。超管在创建/编辑账号时可多选分类（VERIFY/NOTIFY/MARKETING/SYSTEM），发信时按分类匹配可用账号（负载均衡）。无用户隔离，所有用户共享。
- **`category_routes` 表已废弃**（迁移 004），保留但不使用。
- **登录自动 API Key**：用户通过 `POST /v1/setup/key-from-password` 登录时自动创建的 Key 标记 `auto_created=1`，24 小时后自动过期（`expires_at = now + 24h`）。这类 Key **不展示在** Dashboard API Keys 列表和 Admin 用户 Key 计数中。Cron + 懒清理 + 认证中间件三重机制确保过期 Key 被及时删除。
- 前端 `dashboard_html.ts` 为用户后台（只读），`admin_html.ts` 为超级管理员后台（完整管理）。
- 用户注册后自动获得使用全局资源的权限，无需单独绑定。
- **验证码租户隔离**：验证码记录、查询、旧码失效和 KV 限流必须按 `user_id + email + scene_type` 隔离，避免不同用户使用相同邮箱和场景时互相影响。

** 一些重大的更改记得更新agents.md和 docs/ **
