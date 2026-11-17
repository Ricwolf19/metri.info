import { PageHeroFrame } from "@/components/shared/PageHeroFrame";
import { Skeleton } from "@/components/ui/Skeleton";

/** A compact, left-aligned page hero while its page loads (the account
 * pages): eyebrow, title, two lines of subtitle and the hero's own links. */
export const HeroSkeleton = ({ actions = 0 }: { actions?: number }) => (
  <PageHeroFrame compact>
    <div className="max-w-2xl">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-4 h-9 w-3/4 sm:h-11" />
      <Skeleton className="mt-6 h-4 w-full" />
      <Skeleton className="mt-3 h-4 w-2/3" />
      {actions > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: actions }, (_, i) => (
            <Skeleton key={i} className="h-9 w-36 rounded-field" />
          ))}
        </div>
      ) : null}
    </div>
  </PageHeroFrame>
);
