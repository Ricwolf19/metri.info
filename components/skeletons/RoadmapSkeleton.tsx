import {
  Skeleton,
  SkeletonScreen,
  SkeletonText,
} from "@/components/ui/Skeleton";
import type { Locale } from "@/lib/i18n/config";

/** The roadmap's card while the plan (or the lack of one) is read: the same
 * width as the diagnostic, so the first question lands where this was. */
export const RoadmapSkeleton = ({ locale }: { locale: Locale }) => (
  <SkeletonScreen
    locale={locale}
    className="mx-auto max-w-xl rounded-card border border-ink-600 bg-ink-800 p-6 sm:p-8"
  >
    <Skeleton className="h-6 w-2/3" />
    <SkeletonText lines={3} className="mt-4" />
    <Skeleton className="mt-4 h-3 w-4/5" />
    <Skeleton className="mt-6 h-11 w-full rounded-field sm:w-28" />
  </SkeletonScreen>
);
