import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * Drizzle client over Neon's serverless HTTP driver. Constructed lazily on first
 * use — no fallback connection string — so the static site builds and serves
 * without a database. Touching `db` without DATABASE_URL throws a clear error.
 */
type DB = ReturnType<typeof drizzle<typeof schema>>;

let cached: DB | null = null;

const init = (): DB => {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — database features (accounts, saved history) are unavailable.",
    );
  }
  cached = drizzle(neon(url), { schema });
  return cached;
};

export const db = new Proxy({} as DB, {
  get: (_target, prop) => init()[prop as keyof DB],
});
