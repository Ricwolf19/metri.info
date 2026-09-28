import "server-only";

import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { tags } from "@/lib/cache/tags";
import { db } from "@/lib/db";
import { appRelease } from "@/lib/db/schema";
import { event } from "@/lib/log/logger";

import { fetchLatestFromGithub } from "./github";
import type { AppRelease } from "./types";

type Row = typeof appRelease.$inferSelect;

const toRelease = (row: Row): AppRelease => ({
  version: row.version,
  tag: row.tag,
  runtimeVersion: row.runtimeVersion,
  apkUrl: row.apkUrl,
  sha256: row.sha256,
  sizeBytes: row.sizeBytes,
  notes: row.notes,
  publishedAt: row.publishedAt.toISOString(),
  releaseUrl: row.releaseUrl,
});

const readNewestStored = async (): Promise<AppRelease | null> => {
  const [row] = await db
    .select()
    .from(appRelease)
    .orderBy(desc(appRelease.publishedAt))
    .limit(1);
  return row ? toRelease(row) : null;
};

/**
 * Newest release: the stored row with the latest `publishedAt`, else GitHub
 * (empty table, or the DB is unreachable — e.g. a build without
 * `DATABASE_URL`). Null only when neither has one; callers then link the
 * GitHub releases list. Never throws.
 *
 * Cached for hours and tagged: the release webhook expires the tag, so a new
 * release shows up immediately, and the window only bounds how long a GitHub
 * fallback (or its failure) is reused.
 */
export const getLatestRelease = async (): Promise<AppRelease | null> => {
  "use cache";
  cacheTag(tags.appRelease);
  cacheLife("hours");

  try {
    const stored = await readNewestStored();
    if (stored) return stored;
  } catch (error) {
    event.warn("release.db-read-failed", { error });
  }
  return fetchLatestFromGithub();
};

/**
 * Insert or refresh a release by tag (a re-run webhook may carry a rebuilt
 * manifest). Never touches `notifiedAt`/`notifyCursor`, so an upsert can't
 * re-arm the announcement; returns them for the caller to skip or resume.
 */
export const upsertRelease = async (
  release: AppRelease,
): Promise<{ notified: boolean; cursor: string | null }> => {
  const values = {
    version: release.version,
    runtimeVersion: release.runtimeVersion,
    apkUrl: release.apkUrl,
    sha256: release.sha256,
    sizeBytes: release.sizeBytes,
    notes: release.notes,
    releaseUrl: release.releaseUrl,
    publishedAt: new Date(release.publishedAt),
  };
  const [row] = await db
    .insert(appRelease)
    .values({ id: crypto.randomUUID(), tag: release.tag, ...values })
    .onConflictDoUpdate({ target: appRelease.tag, set: values })
    .returning({
      notifiedAt: appRelease.notifiedAt,
      notifyCursor: appRelease.notifyCursor,
    });
  return {
    notified: row?.notifiedAt != null,
    cursor: row?.notifyCursor ?? null,
  };
};

export const saveNotifyCursor = async (
  tag: string,
  cursor: string,
): Promise<void> => {
  await db
    .update(appRelease)
    .set({ notifyCursor: cursor })
    .where(eq(appRelease.tag, tag));
};

export const markNotified = async (tag: string): Promise<void> => {
  await db
    .update(appRelease)
    .set({ notifiedAt: new Date() })
    .where(eq(appRelease.tag, tag));
};
