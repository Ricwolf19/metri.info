import { cn } from "@/lib/utils";

/**
 * Composable data table — ink-tokenized, horizontally scrollable on small
 * screens. Shared by MDX docs and any data-heavy view. Compose as
 * Table → TableHeader/TableBody → TableRow → TableHead/TableCell.
 */
export const Table = ({
  className,
  ...props
}: React.ComponentProps<"table">) => (
  <div className="my-6 overflow-x-auto rounded-card border border-ink-600">
    <table
      className={cn("w-full border-collapse text-sm", className)}
      {...props}
    />
  </div>
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
