import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";
import { siteUrl } from "@/lib/utils";

const githubId = process.env.GITHUB_CLIENT_ID;
const githubSecret = process.env.GITHUB_CLIENT_SECRET;

/**
 * Better Auth server config. Self-hosted on our Neon DB via Drizzle. Builds
 * fine without env vars (no connection at construction); sign-in works once
 * BETTER_AUTH_SECRET + DATABASE_URL are set. GitHub OAuth turns on only when its
 * client id/secret are present.
 */
export const auth = betterAuth({
  baseURL: siteUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: { enabled: true },
  socialProviders:
    githubId && githubSecret
      ? { github: { clientId: githubId, clientSecret: githubSecret } }
      : undefined,
});
