"use client";

import { useEffect, useState } from "react";

import { useSession } from "@/lib/auth/client";
import { type FavoriteItemType, listFavorites } from "@/lib/favorites/actions";

/**
 * Client set of the current user's favorite ids for one item type. Seed it with
 * `initialIds` from the RSC parent so the stars paint filled on first render —
 * without it every navigation showed them empty until the round-trip resolved.
 * The mount refetch still runs (so unpinning elsewhere propagates), but it
 * confirms the seeded value instead of replacing it. Empty for anonymous
 * visitors. The DB read behind `listFavorites` is server-cached + tagged.
 */
export const useFavoriteIds = (
  itemType: FavoriteItemType,
  initialIds: string[] = [],
): Set<string> => {
  const { data, isPending } = useSession();
  const [ids, setIds] = useState<Set<string>>(() => new Set(initialIds));

  useEffect(() => {
    // Never clobber the seeded set while the session is still resolving —
    // `data` is undefined mid-flight and would blank the stars.
    if (isPending) return;

    let active = true;
    if (!data) {
      void Promise.resolve().then(() => {
        if (active) setIds(new Set());
      });
      return () => {
        active = false;
      };
    }
    void listFavorites().then((rows) => {
      if (!active) return;
      setIds(
        new Set(
          rows.filter((r) => r.itemType === itemType).map((r) => r.itemId),
        ),
      );
    });
    return () => {
      active = false;
    };
  }, [data, isPending, itemType]);

  return ids;
};
