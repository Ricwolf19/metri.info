"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { favorite } from "@/lib/db/schema";

export type FavoriteItemType = "calculator" | "doc";

export type ToggleResult =
  | { ok: true; favorited: boolean }
  | { ok: false; reason: "unauthenticated" | "error" };

/**
 * Pin or unpin an item for the current user. Inserts when absent, deletes when
 * present. Requires a session — returns `unauthenticated` so the UI can prompt
 * sign-in rather than throwing.
 */
export const toggleFavorite = async ({
  itemType,
  itemId,
}: {
  itemType: FavoriteItemType;
  itemId: string;
}): Promise<ToggleResult> => {
  const session = await auth.api.getSession({ headers: await headers() });
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

    if (existing) {
      await db.delete(favorite).where(eq(favorite.id, existing.id));
      return { ok: true, favorited: false };
    }
    await db.insert(favorite).values({
      id: crypto.randomUUID(),
      userId,
      itemType,
      itemId,
    });
    return { ok: true, favorited: true };
  } catch {
    return { ok: false, reason: "error" };
  }
};

export type FavoriteRow = {
  itemType: FavoriteItemType;
  itemId: string;
};

/** All favorites for the current user (newest first). Empty when logged out. */
export const listFavorites = async (): Promise<FavoriteRow[]> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  try {
    const rows = await db
      .select({ itemType: favorite.itemType, itemId: favorite.itemId })
      .from(favorite)
      .where(eq(favorite.userId, session.user.id))
      .orderBy(favorite.createdAt);
    return rows.map((r) => ({
      itemType: r.itemType as FavoriteItemType,
      itemId: r.itemId,
    }));
  } catch {
    return [];
  }
};
