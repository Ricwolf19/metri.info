/**
 * Create (or promote) the admin user. Run once the DB is configured:
 *
 *   bun run admin:bootstrap                 # generates + prints a password
 *   ADMIN_PASSWORD='…' bun run admin:bootstrap
 *
 * In production, point a local shell at the prod DB and run it once:
 *   DATABASE_URL='<prod pooled url>' BETTER_AUTH_SECRET='<prod secret>' \
 *     ADMIN_PASSWORD='<chosen>' bun run admin:bootstrap
 *
 * Idempotent: re-running just ensures role=admin. The password is never stored
 * in the repo — it's read from env or generated and shown once.
 */
import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

for (const key of ["DATABASE_URL", "BETTER_AUTH_SECRET"]) {
  if (!process.env[key]) {
    console.error(`✗ ${key} is not set — configure it before bootstrapping.`);
    process.exit(1);
  }
}

const email = process.env.ADMIN_EMAIL ?? "rhtc19@gmail.com";
const name = process.env.ADMIN_NAME ?? "METRI Admin";
const generated = !process.env.ADMIN_PASSWORD;
const password =
  process.env.ADMIN_PASSWORD ?? randomBytes(18).toString("base64url");

const promote = () =>
  db.update(user).set({ role: "admin" }).where(eq(user.email, email));

const run = async () => {
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing) {
    await promote();
    console.log(`✓ ${email} already existed — ensured role=admin.`);
    return;
  }

  await auth.api.signUpEmail({ body: { email, password, name } });
  await promote();
  console.log(`✓ Created admin ${email} (role=admin).`);

  if (generated) {
    console.log(
      "\n  Generated password — store it now, it is shown only once:",
    );
    console.log(`  ${password}\n`);
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
