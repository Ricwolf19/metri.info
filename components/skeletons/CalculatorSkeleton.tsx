import {
  Skeleton,
  SkeletonField,
  SkeletonScreen,
} from "@/components/ui/Skeleton";
import type { Locale } from "@/lib/i18n/config";

/** A calculator while its client half loads: the units switch and the
 * Share / Save / Compare row, the result band, then the inputs in two
 * columns. Also what the prerendered page shows until it hydrates. */
export const CalculatorSkeleton = ({ locale }: { locale: Locale }) => (
  <SkeletonScreen
    locale={locale}
    className="rounded-card border border-ink-600 bg-ink-800 p-4 sm:p-6"
  >
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Skeleton className="h-10 w-full max-w-xs rounded-field" />
      <div className="flex gap-2 sm:ml-auto">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-field" />
        ))}
      </div>
    </div>
    <div className="rounded-card border border-ink-600 bg-ink-850 p-5">
      <div className="grid gap-6 md:grid-cols-[minmax(0,15rem)_1fr] md:items-center">
        <Skeleton className="mx-auto size-40 rounded-full md:mx-0" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
    <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonField key={i} />
      ))}
    </div>
  </SkeletonScreen>
);
