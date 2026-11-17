import {
  Skeleton,
  SkeletonField,
  SkeletonScreen,
} from "@/components/ui/Skeleton";
import type { Locale } from "@/lib/i18n/config";

/** The contact form while it loads: name and email side by side, the topic,
 * the message box and Send. */
export const ContactFormSkeleton = ({ locale }: { locale: Locale }) => (
  <SkeletonScreen locale={locale} className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-2">
      <SkeletonField />
      <SkeletonField />
    </div>
    <SkeletonField />
    <div className="flex flex-col gap-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-36 w-full rounded-field" />
    </div>
    <Skeleton className="h-11 w-full rounded-field sm:w-40" />
  </SkeletonScreen>
);
