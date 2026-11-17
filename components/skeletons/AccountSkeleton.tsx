import { Container } from "@/components/shared/Container";
import { HeroSkeleton } from "@/components/skeletons/HeroSkeleton";
import {
  Skeleton,
  SkeletonField,
  SkeletonScreen,
  SkeletonText,
} from "@/components/ui/Skeleton";

const SettingsCard = ({ fields }: { fields: number }) => (
  <div className="rounded-card border border-ink-600 bg-ink-800 p-5 sm:p-6">
    <Skeleton className="h-5 w-40" />
    <SkeletonText lines={1} className="mt-3 w-2/3" />
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      {Array.from({ length: fields }, (_, i) => (
        <SkeletonField key={i} />
      ))}
    </div>
    <Skeleton className="mt-6 h-9 w-28 rounded-field" />
  </div>
);

/** `/account` while it loads: the hero, the identity card, the settings nav
 * and the first two settings sections. */
export const AccountSkeleton = ({ label }: { label: string }) => (
  <SkeletonScreen label={label}>
    <HeroSkeleton actions={2} />
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-5 rounded-card border border-ink-600 bg-ink-800 p-5 sm:flex-row sm:items-center sm:p-6">
        <Skeleton className="size-14 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:w-80">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-14 rounded-field" />
          ))}
        </div>
      </div>
      <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex gap-2 overflow-hidden lg:w-52 lg:flex-col">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton
              key={i}
              className="h-9 w-24 shrink-0 rounded-field lg:w-full"
            />
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-6">
          <SettingsCard fields={4} />
          <SettingsCard fields={2} />
        </div>
      </div>
    </Container>
  </SkeletonScreen>
);
