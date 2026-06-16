import { Skeleton } from "@/components/ui/Skeleton";

/** Page-header placeholder matching admin `PageHeader` (title + description). */
export const AdminHeaderSkeleton = () => (
  <div className="mb-8 space-y-2">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-full max-w-2xl" />
  </div>
);

/** Card placeholder matching admin `Stat` / `Card` surfaces. */
export const AdminCardSkeleton = ({ height = "h-24" }: { height?: string }) => (
  <div className="rounded-card border border-ink-600 bg-ink-800 p-5">
    <Skeleton className={`w-full ${height}`} />
  </div>
);

/** Grid of stat cards. */
export const AdminStatGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <AdminCardSkeleton key={i} height="h-12" />
    ))}
  </div>
);

/** Table placeholder matching admin tables. */
export const AdminTableSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <div className="overflow-hidden rounded-card border border-ink-600 bg-ink-800">
    <div className="border-b border-ink-700 px-5 py-3">
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="divide-y divide-ink-700">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-40 sm:block" />
          <Skeleton className="hidden h-4 w-24 md:block" />
        </div>
      ))}
    </div>
  </div>
);
