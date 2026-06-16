import { cn } from "@/lib/utils";

/**
 * Tokenized animated placeholder block used to compose route-level loading
 * skeletons. `role="presentation"` keeps it out of the a11y tree.
 */
export const Skeleton = ({ className }: { className?: string }) => (
  <span
    role="presentation"
    className={cn("block animate-pulse rounded-lg bg-ink-700/60", className)}
  />
);
