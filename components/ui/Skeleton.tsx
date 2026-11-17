import { type Locale, translate } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Skeleton kit for a page or a whole section whose data is on its way: grey
 * shapes where the real content will land, so the layout is already in place
 * and nothing jumps when it arrives. `SkeletonScreen` wraps a composed
 * skeleton (see `components/skeletons`) and says "Loading…" once to a screen
 * reader; the shapes themselves are hidden from it. A button that waits
 * shows its own spinner instead (`Button loading`), a tiny inline wait a
 * `Spinner`.
 */
export const Skeleton = ({ className }: { className?: string }) => (
  <span
    aria-hidden
    className={cn("animate-shimmer block rounded-md", className)}
  />
);

/** Lines of placeholder text, the last one shorter, like a paragraph's. */
export const SkeletonText = ({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) => (
  <span aria-hidden className={cn("flex flex-col gap-2.5", className)}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        className={cn("h-3", lines > 1 && i === lines - 1 ? "w-3/5" : "w-full")}
      />
    ))}
  </span>
);

/** A form field's placeholder: its label over its input. */
export const SkeletonField = ({ className }: { className?: string }) => (
  <span aria-hidden className={cn("flex flex-col gap-2", className)}>
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-11 w-full rounded-field" />
  </span>
);

export const SkeletonScreen = ({
  label,
  locale = "en",
  className,
  children,
}: {
  label?: string;
  /** Language of the hidden "Loading…" when no `label` is given. */
  locale?: Locale;
  className?: string;
  children: React.ReactNode;
}) => (
  <div role="status" aria-live="polite" aria-busy className={className}>
    <span className="sr-only">
      {label ?? translate(locale, "common.loading")}
    </span>
    {children}
  </div>
);
