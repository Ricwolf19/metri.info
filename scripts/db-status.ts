import { neon } from "@neondatabase/serverless";

import journal from "../drizzle/migrations/meta/_journal.json";

/**
 * Shows which Drizzle migrations the database has applied vs. what the repo
 * expects — the drift this catches is "schema.ts/queries reference a column the
 * live DB doesn't have yet" (a guaranteed runtime 500).
 *
 *   bun run db:status   → exits 1 when migrations are pending (run db:migrate)
 *
 * Uses the raw neon driver (not lib/db) because that module is `server-only`
 * and can't be imported from a plain script.
 */

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("db:status — DATABASE_URL is not set (check .env).");
  process.exit(1);
}

const sql = neon(url);

type JournalEntry = { idx: number; when: number; tag: string };
const entries = (journal as { entries: JournalEntry[] }).entries;

let appliedCount = 0;
try {
  const rows = (await sql`
    select created_at from drizzle.__drizzle_migrations order by created_at asc
  `) as { created_at: string }[];
  appliedCount = rows.length;
} catch {
  // Table missing = brand-new database, nothing applied yet.
  appliedCount = 0;
}

const pending = entries.slice(appliedCount);

console.log(`db:status — ${appliedCount}/${entries.length} migrations applied`);
if (pending.length === 0) {
  console.log("Database is up to date.");
  process.exit(0);
}

console.log("\nPENDING (the live DB is missing these):");
for (const entry of pending) {
  console.log(`  - ${entry.tag}`);
}
console.log("\nRun: bun run db:migrate");
process.exit(1);
