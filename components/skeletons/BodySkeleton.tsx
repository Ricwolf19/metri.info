import { Container } from "@/components/shared/Container";
import { HeroSkeleton } from "@/components/skeletons/HeroSkeleton";
import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

const BodySection = ({ height }: { height: string }) => (
  <section className="mt-10">
    <Skeleton className="h-5 w-40" />
    <Skeleton className="mt-2.5 h-3 w-72 max-w-full" />
    <Skeleton className={`mt-5 rounded-card ${height}`} />
  </section>
);

/** `/account/body` while it loads: the hero, the four headline numbers, the
 * weight chart and the map. */
export const BodySkeleton = ({ label }: { label: string }) => (
  <SkeletonScreen label={label}>
    <HeroSkeleton actions={1} />
    <Container className="py-10 sm:py-14">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-card border border-ink-600 bg-ink-800 p-4 sm:p-5"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-24" />
          </div>
        ))}
      </div>
      <BodySection height="h-72" />
      <BodySection height="h-96" />
    </Container>
  </SkeletonScreen>
);
