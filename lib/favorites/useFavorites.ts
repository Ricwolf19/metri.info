"use client";

import { useEffect, useState } from "react";

import { useSession } from "@/lib/auth/client";
import { type FavoriteItemType, listFavorites } from "@/lib/favorites/actions";

/**
 * Client set of the current user's favorite ids for one item type. Refetched on
 * mount so it's always consistent with the server (e.g. unpinning from the
 * account page is reflected everywhere). Empty for anonymous visitors. The DB
 * read behind `listFavorites` is server-cached + tagged, so the round-trip is
 * cheap; a brief star fill on first paint is the only cost.
 */
export const useFavoriteIds = (itemType: FavoriteItemType): Set<string> => {
  const { data } = useSession();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
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
  }, [data, itemType]);

  return ids;
};
