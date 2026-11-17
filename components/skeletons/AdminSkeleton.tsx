import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { Skeleton, SkeletonScreen } from "@/components/ui/Skeleton";

type Body = "dashboard" | "list" | "heatmap" | "card";

const Stats = () => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }, (_, i) => (
      <Skeleton key={i} className="h-24 rounded-card" />
    ))}
  </div>
);

/**
 * An admin page or panel while it loads. With `header` it stands in for a
 * whole page (title and description first); without, for a panel under a
 * header and range bar already on screen. The body follows what's coming:
 * headline numbers and two charts, a list's table, a heatmap (numbers and
 * the tall preview) or one chart card. `caption` shows the label too, for a
 * read slow enough to explain (inspecting every sitemap URL). Grids declare
 * one column below their breakpoint, as every admin grid must.
 */
export const AdminSkeleton = ({
  label,
  header = true,
  body = "dashboard",
  caption = false,
}: {
  label: string;
  header?: boolean;
  body?: Body;
  caption?: boolean;
}) => (
  <SkeletonScreen label={label} className="space-y-6">
    {header ? (
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2.5 h-3 w-96 max-w-full" />
      </div>
    ) : null}
    {caption ? (
      <p aria-hidden className="font-mono text-xs text-ink-400">
        {label}
      </p>
    ) : null}
    {body === "list" ? <ListSkeleton /> : null}
    {body === "card" ? <Skeleton className="h-72 rounded-card" /> : null}
    {body === "dashboard" ? (
      <>
        <Stats />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-card" />
          <Skeleton className="h-72 rounded-card" />
        </div>
      </>
    ) : null}
    {body === "heatmap" ? (
      <>
        <Stats />
        <Skeleton className="mx-auto h-[36rem] w-full max-w-md rounded-lg" />
      </>
    ) : null}
  </SkeletonScreen>
);
