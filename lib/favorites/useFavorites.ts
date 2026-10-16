"use client";

import { useEffect, useState } from "react";

import { useSession } from "@/lib/auth/client";
import { type FavoriteItemType, listFavorites } from "@/lib/favorites/actions";

export type FavoriteIds = {
  ids: Set<string>;
  /** False until the session has resolved and the first fetch has landed, so
   * stars can show a loading state instead of reading as "not pinned". */
  ready: boolean;
};

/**
 * Client set of the current user's favorite ids for one item type. Seed it with
 * `initialIds` from the RSC parent so the stars paint filled on first render —
 * without it every navigation showed them empty until the round-trip resolved.
 * The mount refetch still runs (so unpinning elsewhere propagates), but it
 * confirms the seeded value instead of replacing it. Empty and ready for
 * anonymous visitors. The DB read behind `listFavorites` is server-cached.
 */
export const useFavoriteIds = (
  itemType: FavoriteItemType,
  initialIds: string[] = [],
): FavoriteIds => {
  const { data, isPending } = useSession();
  const [state, setState] = useState<FavoriteIds>(() => ({
    ids: new Set(initialIds),
    ready: initialIds.length > 0,
  }));

  useEffect(() => {
    // Never clobber the seeded set while the session is still resolving —
    // `data` is undefined mid-flight and would blank the stars.
    if (isPending) return;

    let active = true;
    if (!data) {
      void Promise.resolve().then(() => {
        if (active) setState({ ids: new Set(), ready: true });
      });
      return () => {
        active = false;
      };
    }
    void listFavorites().then((rows) => {
      if (!active) return;
      setState({
        ids: new Set(
          rows.filter((r) => r.itemType === itemType).map((r) => r.itemId),
        ),
        ready: true,
      });
    });
    return () => {
      active = false;
    };
  }, [data, isPending, itemType]);

  return state;
};
