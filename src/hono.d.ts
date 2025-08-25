import type { DrizzleD1Database } from "drizzle-orm/d1";

declare module "hono" {
  interface ContextVariableMap {
    db: DrizzleD1Database;
  }
}
