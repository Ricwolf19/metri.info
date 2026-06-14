import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** METRI wordmark — icon + label. Uses the brand SVG copied from the app. */
export const Logo = ({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) => (
  <Link
    href="/"
    aria-label="METRI home"
    className={cn("flex items-center gap-2", className)}
  >
    <Image
      src="/brand/metri-icon.svg"
      alt=""
      width={28}
      height={28}
      priority
      className="h-7 w-7"
    />
    {withWordmark && (
      <span className="font-sans text-lg font-bold tracking-tight text-ink-50">
        METRI
      </span>
    )}
  </Link>
);
