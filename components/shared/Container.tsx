import { cn } from "@/lib/utils";

/** Centered max-width content wrapper — the web equivalent of mobile's Screen. */
export const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>
    {children}
  </div>
);
