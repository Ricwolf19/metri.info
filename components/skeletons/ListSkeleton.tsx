import { Skeleton } from "@/components/ui/Skeleton";

/** A list page's table while its first page loads (admin users and
 * calculations, the account's saved calculations): the search and filter
 * bar, then rows. */
export const ListSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div aria-hidden>
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-10 w-full rounded-field sm:w-72" />
      <Skeleton className="h-10 w-28 rounded-field" />
      <Skeleton className="h-10 w-28 rounded-field" />
    </div>
    <div className="mt-4 divide-y divide-ink-700 rounded-card border border-ink-600 bg-ink-800">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/5" />
          <Skeleton className="ml-auto h-3 w-16" />
        </div>
      ))}
    </div>
  </div>
);
