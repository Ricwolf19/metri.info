import { Container } from "@/components/shared/Container";
import { Skeleton } from "@/components/ui/Skeleton";

const PanelSkeleton = () => (
  <div className="overflow-hidden rounded-card border border-ink-600 bg-ink-800">
    <div className="border-b border-ink-700 px-5 py-4 sm:px-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-1.5 h-4 w-64" />
    </div>
    <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="flex justify-end border-t border-ink-700 bg-ink-900/40 px-5 py-4 sm:px-6">
      <Skeleton className="h-9 w-24" />
    </div>
  </div>
);

const SettingsLoading = () => (
  <Container className="py-16 sm:py-20">
    <Skeleton className="mb-6 h-4 w-40" />
    <div className="mb-10 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-80" />
    </div>
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <Skeleton className="h-40 w-full shrink-0 lg:w-52" />
      <div className="min-w-0 flex-1 space-y-6">
        <PanelSkeleton />
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
    </div>
  </Container>
);

export default SettingsLoading;
