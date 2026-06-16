/**
 * Database seed script. Run with a real DATABASE_URL: `bun run db:seed`.
 * There is currently no bundled catalog to seed.
 */
import { db } from "@/lib/db";

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set. Configure it before seeding.");
  process.exit(1);
}

const run = async () => {
  void db;
  console.log("✓ Nothing to seed.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
