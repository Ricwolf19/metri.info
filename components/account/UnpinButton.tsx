"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { StarSolidIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/Spinner";
import { type FavoriteItemType, toggleFavorite } from "@/lib/favorites/actions";
import { useT } from "@/lib/i18n";

/** Unpin a favorite from the account view, then refresh the server data. */
export const UnpinButton = ({
  itemType,
  itemId,
}: {
  itemType: FavoriteItemType;
  itemId: string;
}) => {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await toggleFavorite({ itemType, itemId });
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={t("favorites.unpin")}
      title={t("favorites.unpin")}
      className="inline-flex w-10 shrink-0 items-center justify-center rounded-card border border-ink-600 bg-ink-800 text-accent transition-colors hover:bg-ink-700 focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none disabled:opacity-50"
    >
      {pending ? <Spinner size="sm" /> : <StarSolidIcon size={16} />}
    </button>
  );
};
