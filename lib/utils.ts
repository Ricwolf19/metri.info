import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution (shadcn convention). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Absolute site URL. Used by metadata, sitemap, OG images, canonical links.
 * Tolerates a protocol-less env value (e.g. `www.metri.info`) by prefixing
 * `https://` so `new URL(siteUrl)` in layout/auth never throws at build time. */
export const siteUrl = (() => {
  const raw = (process.env.NEXT_PUBLIC_APP_URL || "https://metri.info")
    .trim()
    .replace(/\/$/, "");
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
})();

/** Build an absolute URL from a path (for canonical / OG / hreflang). */
export const absoluteUrl = (path = "") =>
  `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

/** Ref callback that focuses its node once, as it mounts: for a message that
 * replaces the control just pressed (a form's "sent" state), so focus lands on
 * the news instead of dropping to <body>. Give the node `tabIndex={-1}`. A
 * module-level function, so React sees one stable ref and never re-runs it. */
export const focusOnMount = (node: HTMLElement | null): void => {
  node?.focus();
};
