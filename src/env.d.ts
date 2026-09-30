// Teaven Email - 环境类型声明
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

declare global {
  interface Env {
    DB: D1Database;
    KV: KVNamespace;
    EMAIL: SendEmail;
    ENVIRONMENT: string;
    // [H-3] 两把密钥均为必填。类型层必填只是第一道闸（wrangler 漏配会在部署/类型检查时暴露），
    // 真正的运行时保护在 src/secrets.ts：一律通过 getJwtSecret / getImpersonationSecret /
    // assertRuntimeSecrets 取值，禁止 `env.JWT_SECRET || ''` 这类兜底写法。
    JWT_SECRET: string;
    IMPERSONATION_SECRET: string;
  }
}

export {};
