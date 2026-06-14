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
      "bg-gradient-to-r from-lime-300 via-lime-400 to-lime-600 bg-clip-text text-transparent",
      className,
    )}
  >
    {children}
  </span>
);
