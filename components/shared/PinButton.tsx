"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { StarIcon, StarSolidIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics/track";
import { useSession } from "@/lib/auth/client";
import { type FavoriteItemType, toggleFavorite } from "@/lib/favorites/actions";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

/**
 * Star/pin toggle for a calculator or doc card. Rendered only when a session
 * exists. Three visible states: `loading` (the pinned set is still being read:
 * a dimmed, pulsing star, never a false "not pinned"), pending (spinner while
 * the server action runs) and settled. Optimistic: flips immediately with a
 * pop, reverting on failure. Stops the parent <Link> navigation so pinning
 * never opens the card.
 */
export const PinButton = ({
  itemType,
  itemId,
  initialPinned = false,
  loading = false,
  className,
}: {
  itemType: FavoriteItemType;
  itemId: string;
  initialPinned?: boolean;
  loading?: boolean;
  className?: string;
}) => {
  const { data } = useSession();
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const [pinned, setPinned] = useState(initialPinned);
  const [pending, startTransition] = useTransition();
  // `dirty` guards the seed effect (ref: read in an effect); `touched` drives
  // the pop class (state: read during render).
  const dirty = useRef(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!dirty.current && !pending) setPinned(initialPinned);
  }, [initialPinned, pending]);

  if (!data) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || pending) return;
    const next = !pinned;
    dirty.current = true;
    setTouched(true);
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
        track("favorite_toggled", {
          item_type: itemType,
          item_id: itemId,
          favorited: res.favorited,
        });
      }
    });
  };

  const label = pinned ? t("favorites.unpin") : t("favorites.pin");
  const Icon = pinned ? StarSolidIcon : StarIcon;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={label}
      aria-pressed={pinned}
      aria-busy={loading || pending || undefined}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-600 bg-ink-800/60 transition-colors hover:bg-ink-700 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none",
        pinned ? "text-brand" : "text-ink-400 hover:text-ink-100",
        loading && "animate-pulse cursor-wait text-ink-500",
        className,
      )}
    >
      {pending ? (
        <Spinner size="sm" />
      ) : (
        // Re-keyed on flip so the pop keyframe replays each toggle.
        <span key={String(pinned)} className={touched ? "pin-pop" : undefined}>
          <Icon size={16} />
        </span>
      )}
    </button>
  );
};
