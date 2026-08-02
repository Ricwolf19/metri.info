import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("user").notNull(),
  // Denormalized entitlement cache, recomputed from `subscription` on every
  // change so it rides on the Better Auth session (fast client read). The
  // client never writes it (additionalFields `input: false`).
  plan: text("plan").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Billing source-of-truth (Stripe-shaped). Today rows are created by the admin
 * "manual" grant; a future Stripe/RevenueCat webhook updates the same shape and
 * recomputes `user.plan`. Feature access is derived via `lib/entitlements.ts`,
 * never by reading `plan` directly.
 */
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  plan: text("plan").default("free").notNull(), // 'free' | 'premium'
  status: text("status").default("active").notNull(), // active|canceled|past_due|trialing|expired
  provider: text("provider").default("manual").notNull(), // 'manual' | 'stripe' | ...
  providerCustomerId: text("provider_customer_id"),
  providerSubscriptionId: text("provider_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  grantedBy: text("granted_by"), // admin.id for manual grants (audit)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfile = pgTable("user_profile", {
  id: text("id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  username: text("username").unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  unitsPreference: text("units_preference").default("kg").notNull(),
  bodyWeightKg: real("body_weight_kg"),
  bodyHeightCm: real("body_height_cm"),
  sex: text("sex"),
  // Account-level profile the mobile app restores after a reinstall (free
  // feature — this is who the account is, not premium training sync).
  age: integer("age"),
  bodyFatPct: real("body_fat_pct"),
  activityLevel: text("activity_level"),
  latestBmr: real("latest_bmr"),
  latestTdee: real("latest_tdee"),
  bmrFormula: text("bmr_formula"),
  locale: text("locale"),
  clockFormat: text("clock_format"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const calculationLog = pgTable("calculation_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  calculatorType: text("calculator_type").notNull(),
  inputs: jsonb("inputs").notNull(),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorite = pgTable(
  "favorite",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    itemId: text("item_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("favorite_user_item_unique").on(t.userId, t.itemType, t.itemId),
  ],
);

/**
 * Generic per-user row mirror for the premium SQLite↔Neon sync (training data,
 * adherence, custom programs/exercises). Each device pushes its changed rows as
 * opaque JSON; the server stores them keyed by (user, table, row) and hands them
 * back to the user's other devices on pull. `updatedAt` is the client content
 * time (Last-Write-Wins); `serverUpdatedAt` is the pull cursor. `deleted` rows
 * are tombstones (data cleared) so removals propagate. Kept opaque on purpose —
 * the mobile client owns the schema; add relational mirrors later only if the
 * web needs to render training natively.
 */
export const syncRow = pgTable(
  "sync_row",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tableName: text("table_name").notNull(),
    rowId: text("row_id").notNull(),
    data: jsonb("data"),
    deleted: boolean("deleted").default(false).notNull(),
    /** Device that wrote this version (null for legacy rows) — lets the pull
     * exclude a device's own writes (echo suppression). */
    origin: text("origin"),
    /** Client content-modified time — the LWW comparison key. */
    updatedAt: timestamp("updated_at").notNull(),
    /** Server write time — the delta-pull cursor. */
    serverUpdatedAt: timestamp("server_updated_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.tableName, t.rowId] }),
    index("sync_row_pull_idx").on(t.userId, t.serverUpdatedAt),
  ],
);
