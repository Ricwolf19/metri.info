"use server";

import { and, eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";

import { getSession } from "@/lib/auth/session";
import { tags } from "@/lib/cache/tags";
import { db } from "@/lib/db";
import { favorite } from "@/lib/db/schema";

export type FavoriteItemType = "calculator" | "doc";

export type ToggleResult =
  | { ok: true; favorited: boolean }
  | { ok: false; reason: "unauthenticated" | "error" };

/** Per-user cache tag — lets `toggleFavorite` invalidate exactly one user's
 * pinned list without touching anyone else's. */

/**
 * Pin or unpin an item for the current user. Inserts when absent, deletes when
 * present. Requires a session — returns `unauthenticated` so the UI can prompt
 * sign-in rather than throwing. Invalidates the user's cached list and the admin
 * favorites total on success.
 */
export const toggleFavorite = async ({
  itemType,
  itemId,
}: {
  itemType: FavoriteItemType;
  itemId: string;
}): Promise<ToggleResult> => {
  const session = await getSession();
  if (!session) return { ok: false, reason: "unauthenticated" };

  try {
    const userId = session.user.id;
    const where = and(
      eq(favorite.userId, userId),
      eq(favorite.itemType, itemType),
      eq(favorite.itemId, itemId),
    );
    const [existing] = await db
      .select({ id: favorite.id })
      .from(favorite)
      .where(where)
      .limit(1);

    let favorited: boolean;
    if (existing) {
      await db.delete(favorite).where(eq(favorite.id, existing.id));
      favorited = false;
    } else {
      await db.insert(favorite).values({
        id: crypto.randomUUID(),
        userId,
        itemType,
        itemId,
      });
      favorited = true;
    }
    updateTag(tags.favorites(userId));
    updateTag(tags.metrics.db);
    return { ok: true, favorited };
  } catch {
    return { ok: false, reason: "error" };
  }
};

export type FavoriteRow = {
  itemType: FavoriteItemType;
  itemId: string;
};

/** Cached per user and tagged `favorites:<userId>` — `toggleFavorite` calls
 * `updateTag` on the same tag, so a pin is visible on the very next read.
 * `userId` is a parameter, not read from the session inside: a `use cache`
 * function can't touch `headers()`. */
const loadFavorites = async (userId: string): Promise<FavoriteRow[]> => {
  "use cache";
  cacheTag(tags.favorites(userId));
  cacheLife("hours");
  try {
    const rows = await db
      .select({ itemType: favorite.itemType, itemId: favorite.itemId })
      .from(favorite)
      .where(eq(favorite.userId, userId))
      .orderBy(favorite.createdAt);
    return rows.map((r) => ({
      itemType: r.itemType as FavoriteItemType,
      itemId: r.itemId,
    }));
  } catch {
    return [];
  }
};

/** All favorites for the current user (newest first). Empty when logged out. */
export const listFavorites = async (): Promise<FavoriteRow[]> => {
  const session = await getSession();
  if (!session) return [];
  return loadFavorites(session.user.id);
};
