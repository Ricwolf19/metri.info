import { Container } from "@/components/shared/Container";
import { HeroSkeleton } from "@/components/skeletons/HeroSkeleton";
import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

const BlockHeading = () => (
  <>
    <Skeleton className="h-5 w-48" />
    <Skeleton className="mt-2.5 h-3 w-72 max-w-full" />
  </>
);

/** `/account/activity` while it loads: the hero, the knowledge-check card,
 * the pinned tools and the saved-calculations list. */
export const ActivitySkeleton = ({ label }: { label: string }) => (
  <SkeletonScreen label={label}>
    <HeroSkeleton actions={1} />
    <Container className="space-y-12 py-10 sm:py-14">
      <section>
        <BlockHeading />
        <Skeleton className="mt-5 h-40 rounded-card" />
      </section>
      <section>
        <BlockHeading />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-card" />
          ))}
        </div>
      </section>
      <section>
        <BlockHeading />
        <div className="mt-5">
          <ListSkeleton rows={4} />
        </div>
      </section>
    </Container>
  </SkeletonScreen>
);
