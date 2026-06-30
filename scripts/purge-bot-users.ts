/**
 * Purge bot-created users from the Neon DB.
 *
 *   # Dry-run (default) — lists candidates, deletes NOTHING:
 *   DATABASE_URL='<url>' bun run bots:preview
 *
 *   # Real delete:
 *   DATABASE_URL='<url>' bun run bots:purge
 *
 * Detection (any flags a row as a bot), scoped to role='user',
 * email_verified=false, created in the last 30 days:
 *   1. nanoid-style name (no spaces, >= 12 chars, internal lower→UPPER transition or 3+ capital run)
 *   2. dot-separated email like a.b.c.d@gmail.com
 *   3. known throwaway / generator domain
 *
 * Cascade: schema's `onDelete: "cascade"` cleans session / account /
 * user_profile / calculation_log / favorite per deleted user.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "✗ DATABASE_URL is not set.\n  Inject it inline, e.g.:\n  DATABASE_URL='<prod url>' bun run bots:preview",
  );
  process.exit(1);
}

const run = process.argv.includes("--run") || process.argv.includes("--commit");
const sql = neon(url);

// Shared by preview + delete — single source of truth for the bot heuristic.
const WHERE = `
  role = 'user'
  AND email_verified = false
  AND created_at > now() - interval '30 days'
  AND (
    -- nanoid-style display name: no spaces, long enough, and carrying a shape real names don't — internal lower→UPPER transition ("zatRxFGH…") or 3+ capitals ("SNBTQN…"). Catches the 16–17-char ids the old length>=18 rule missed; "test", "admin-metri" and "Alejandro Aguirre" stay safe (short / has a space).
    (
      name !~ '\\s'
      AND length(name) >= 12
      AND (name ~ '[a-z][A-Z]' OR name ~ '[A-Z]{3,}')
    )
    -- dot-separated letter clusters like a.b.c.d@gmail.com
    OR email ~ '^([a-z0-9]\\.){2,}[a-z0-9]+@'
    -- known throwaway / generator domains
    OR email ~* '@(mailinator|guerrillamail|10minutemail|trashmail|throwaway|tempmail|fakeinbox|yopmail|dispostable|korper\\.)'
  )
`;

const main = async () => {
  // Always preview first, in both modes.
  const rows = (await sql.query(
    `SELECT id, name, email, email_verified, role, created_at
     FROM "user"
     WHERE ${WHERE}
     ORDER BY created_at DESC`,
  )) as Array<{
    id: string;
    name: string;
    email: string;
    created_at: string;
  }>;

  console.log(`\n${rows.length} bot candidate(s) matched:\n`);
  if (rows.length) {
    console.table(
      rows.map((r) => ({
        name: r.name,
        email: r.email,
        created: new Date(r.created_at).toISOString().slice(0, 10),
      })),
    );
  }

  if (!run) {
    console.log(
      "\nDRY RUN — nothing deleted. Re-run with `bun run bots:purge` (or --run) to delete.\n",
    );
    return;
  }

  if (!rows.length) {
    console.log("\nNothing to delete.\n");
    return;
  }

  const deleted = (await sql.query(
    `DELETE FROM "user" WHERE ${WHERE} RETURNING id`,
  )) as Array<{ id: string }>;
  console.log(
    `\n✓ Deleted ${deleted.length} user(s) (cascade cleaned their related rows).\n`,
  );
};

main().catch((err) => {
  console.error("✗ purge failed:", err);
  process.exit(1);
});
