import "server-only";

import { neon } from "@neondatabase/serverless";

type Pool = {
  query(text: string, params?: unknown[]): Promise<{ rows: unknown[] }>;
};

let client: ReturnType<typeof neon> | null = null;

/**
 * The `{ query(text, params) }` client listkit's SQL executor expects, over the
 * same Neon HTTP driver Drizzle uses. listkit builds `$n` placeholders and a
 * column whitelist from the list config, so this is the one place its text
 * SQL runs; everything else in the app stays on Drizzle.
 */
export const listPool: Pool = {
  query: async (text, params = []) => {
    if (!client) {
      const url = process.env.DATABASE_URL;
      if (!url) throw new Error("DATABASE_URL is not set");
      client = neon(url);
    }
    const result = await client.query(text, params, { fullResults: true });
    return { rows: result.rows as unknown[] };
  },
};
