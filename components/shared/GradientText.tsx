import { cn } from "@/lib/utils";

/** Lime gradient text — the web equivalent of the mobile app's gradient labels. */
export const GradientText = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    className={cn(
      "bg-gradient-to-br from-ink-50 via-ink-100 to-ink-400 bg-clip-text text-transparent",
      className,
    )}
  >
    {children}
  </span>
);
