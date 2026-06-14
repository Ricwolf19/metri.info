import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution (shadcn convention). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Absolute site URL. Used by metadata, sitemap, OG images, canonical links. */
export const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://metri.info";

/** Build an absolute URL from a path (for canonical / OG / hreflang). */
export const absoluteUrl = (path = "") =>
  `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
