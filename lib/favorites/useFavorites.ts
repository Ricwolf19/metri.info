"use client";

import { useEffect, useState } from "react";

import { useSession } from "@/lib/auth/client";
import { type FavoriteItemType, listFavorites } from "@/lib/favorites/actions";

/**
 * Client set of the current user's favorite ids for one item type. Loads once a
 * session is present; empty for anonymous visitors. Used to seed each card's
 * initial pinned state without an extra request per card.
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
