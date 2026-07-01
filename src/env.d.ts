// Teaven Email - 环境类型声明
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

declare global {
  interface Env {
    DB: D1Database;
    KV: KVNamespace;
    ENVIRONMENT: string;
    JWT_SECRET?: string;
    IMPERSONATION_SECRET?: string;
  }
}

export {};
