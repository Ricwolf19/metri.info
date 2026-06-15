import { cn } from "@/lib/utils";

/** Themed form label. */
export const Label = ({
  className,
  ...props
}: React.ComponentProps<"label">) => (
  <label
    data-slot="label"
    className={cn("text-sm font-medium text-ink-200 select-none", className)}
    {...props}
  />
);
