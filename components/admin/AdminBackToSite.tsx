import Link from "next/link";

import { HomeIcon } from "@/components/icons";

/** Navigates back to the public homepage without touching the session — a plain
 * link, visually distinct from the destructive sign-out control. Shared by the
 * desktop sidebar and the mobile sheet. */
export const AdminBackToSite = () => (
  <Link
    href="/"
    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-ink-600/60 bg-transparent px-3 py-1.5 text-sm font-medium text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-50"
  >
    <HomeIcon size={15} />
    Back to site
  </Link>
);
