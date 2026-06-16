"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { StarIcon, StarSolidIcon } from "@/components/icons";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/lib/auth/client";
import { type FavoriteItemType, toggleFavorite } from "@/lib/favorites/actions";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

/**
 * Star/pin toggle for a calculator or doc card. Rendered only when a session
 * exists. Optimistic: flips immediately, reverting on failure. Stops the parent
 * <Link> navigation so pinning never opens the card.
 */
export const PinButton = ({
  itemType,
  itemId,
  initialPinned = false,
  className,
}: {
  itemType: FavoriteItemType;
  itemId: string;
  initialPinned?: boolean;
  className?: string;
}) => {
  const { data } = useSession();
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const [pinned, setPinned] = useState(initialPinned);
  const [pending, startTransition] = useTransition();
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current && !pending) setPinned(initialPinned);
  }, [initialPinned, pending]);

  if (!data) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !pinned;
    dirty.current = true;
    setPinned(next);
    startTransition(async () => {
      const res = await toggleFavorite({ itemType, itemId });
      if (!res.ok) {
        setPinned(!next);
        if (res.reason === "unauthenticated") {
          window.location.href = routePath("signIn", locale);
        } else {
          toast({ title: t("toast.favError"), variant: "error" });
        }
      } else {
        setPinned(res.favorited);
      }
    });
  };

  const label = pinned ? t("favorites.unpin") : t("favorites.pin");
  const Icon = pinned ? StarSolidIcon : StarIcon;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={label}
      aria-pressed={pinned}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink-600 bg-ink-800/60 transition-colors hover:bg-ink-700 focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none",
        pinned ? "text-accent" : "text-ink-400 hover:text-ink-100",
        pending && "opacity-60",
        className,
      )}
    >
      <Icon size={16} />
    </button>
  );
};
