import { Container } from "@/components/shared/Container";
import { Skeleton } from "@/components/ui/Skeleton";

const SectionSkeleton = ({ cards = 3 }: { cards?: number }) => (
  <section className="mt-12 first:mt-0">
    <Skeleton className="h-6 w-48" />
    <Skeleton className="mt-2 h-4 w-72" />
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  </section>
);

const AccountLoading = () => (
  <Container className="py-16 sm:py-20">
    <div className="mb-6 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-80" />
    </div>
    <SectionSkeleton />
    <SectionSkeleton cards={4} />
  </Container>
);

export default AccountLoading;
