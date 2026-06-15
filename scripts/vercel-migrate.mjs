/**
 * Applies pending Drizzle migrations during the Vercel build, then `next build`
 * runs (see the `vercel-build` script). This is what makes production schema
 * changes ship automatically on push — no manual `db:migrate` against prod.
 *
 * If DATABASE_URL is absent (e.g. a preview deploy without a database wired up)
 * we WARN and skip rather than failing the build, so the static site still
 * deploys. Account / saved-history features simply stay unavailable until the
 * variable is configured.
 */
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠  DATABASE_URL not set — skipping migrations for this build. " +
      "Database features (accounts, saved history) will be unavailable until it is configured.",
  );
  process.exit(0);
}

console.log("▸ Applying database migrations…");
execSync("bun run db:migrate", { stdio: "inherit" });
console.log("✓ Database schema up to date.");
