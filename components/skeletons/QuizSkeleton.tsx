import {
  Skeleton,
  SkeletonScreen,
  SkeletonText,
} from "@/components/ui/Skeleton";
import type { Locale } from "@/lib/i18n/config";

/** The knowledge check's intro card while the quiz loads: the pitch and
 * Start on one side, the four areas on the other. */
export const QuizSkeleton = ({ locale }: { locale: Locale }) => (
  <SkeletonScreen
    locale={locale}
    className="mx-auto grid max-w-5xl gap-8 rounded-card border border-ink-600 bg-ink-800 p-6 sm:p-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-10 md:p-10"
  >
    <div>
      <Skeleton className="h-8 w-2/3" />
      <SkeletonText lines={3} className="mt-5" />
      <Skeleton className="mt-5 h-20 rounded-field" />
      <Skeleton className="mt-6 h-12 w-32 rounded-field" />
    </div>
    <div className="grid content-center gap-2.5">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-16 rounded-field" />
      ))}
    </div>
  </SkeletonScreen>
);
