import { Container } from "@/components/shared/Container";
import { Skeleton } from "@/components/ui/Skeleton";

/** Placeholder for a shared-result page (`/s/[id]`): eyebrow, big value, note
 * and CTA. Used by both the route's `loading.tsx` and the in-page Suspense
 * boundary, since the payload rides in the query string and is fully runtime. */
export const ShareSkeleton = () => (
  <Container className="py-16 sm:py-24">
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-14 w-64" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="mt-4 h-11 w-48" />
    </div>
  </Container>
);
