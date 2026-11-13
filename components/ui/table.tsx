import { ScrollHint } from "@/components/ui/ScrollHint";
import { cn } from "@/lib/utils";

/**
 * Composable data table — ink-tokenized, horizontally scrollable on small
 * screens. Shared by MDX docs and any data-heavy view. Compose as
 * Table → TableHeader/TableBody → TableRow → TableHead/TableCell.
 *
 * The scroller is focusable: a table holds no links of its own, and without a
 * tab stop a keyboard could never reach the columns past a phone's edge.
 */
export const Table = ({
  className,
  frameClassName,
  ...props
}: React.ComponentProps<"table"> & {
  /** The scroller around the table (margin, border), e.g. flush in a card. */
  frameClassName?: string;
}) => (
  <ScrollHint
    className={cn("my-6 rounded-card border border-ink-600", frameClassName)}
  >
    <div
      tabIndex={0}
      className="overflow-x-auto rounded-card focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:outline-none"
    >
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  </ScrollHint>
);

export const TableHeader = ({
  className,
  ...props
}: React.ComponentProps<"thead">) => (
  <thead className={cn("bg-ink-850", className)} {...props} />
);

export const TableBody = (props: React.ComponentProps<"tbody">) => (
  <tbody {...props} />
);

export const TableRow = ({
  className,
  ...props
}: React.ComponentProps<"tr">) => (
  <tr
    className={cn(
      "border-b border-ink-700 transition-colors last:border-0 hover:bg-ink-800/60",
      className,
    )}
    {...props}
  />
);

export const TableHead = ({
  className,
  ...props
}: React.ComponentProps<"th">) => (
  <th
    className={cn(
      "px-4 py-2.5 text-left text-xs font-semibold tracking-wide text-ink-300 uppercase",
      className,
    )}
    {...props}
  />
);

export const TableCell = ({
  className,
  ...props
}: React.ComponentProps<"td">) => (
  <td
    className={cn("px-4 py-2.5 align-top text-ink-200", className)}
    {...props}
  />
);
