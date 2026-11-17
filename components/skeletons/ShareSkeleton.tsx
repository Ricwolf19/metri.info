import { Container } from "@/components/shared/Container";
import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

/** A shared result (`/s/[id]`) while it loads: the calculator's name, the
 * big number, its card image and the call to try it. */
export const ShareSkeleton = ({ label }: { label?: string }) => (
  <SkeletonScreen label={label}>
    <Container className="py-16 sm:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-4 h-14 w-56" />
        <Skeleton className="mt-3 h-4 w-32" />
        <Skeleton className="mt-8 aspect-[1200/630] w-full rounded-card" />
        <Skeleton className="mt-8 h-12 w-48 rounded-xl" />
        <Skeleton className="mt-4 h-3 w-64 max-w-full" />
      </div>
    </Container>
  </SkeletonScreen>
);
