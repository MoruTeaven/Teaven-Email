# Agents.md — AI 编码助手行为规范

## 部署约束

- **禁止本地部署尝试**：本项目只支持 Cloudflare Workers 部署，不要在任何情况下建议或执行本地服务器启动、`npm run dev` 中的本地 HTTP 服务、或其他非 Cloudflare 的部署方式。
- 本地开发仅使用 `wrangler dev`（Cloudflare Workers 本地模拟），如涉及预览也仅通过 wrangler 本地环境。

## Git 约束

- **不要主动同步 git**：不要执行 `git add`、`git commit`、`git push`、`git pull` 等 git 操作，除非用户明确要求。不得擅自修改 git 历史或分支状态。

## 其他约定

- 优先使用 `wrangler` CLI 进行所有 Workers 相关的开发、调试和部署操作。
- 涉及数据库变更时，通过 D1 migrations 进行，不要直接操作生产数据库。
