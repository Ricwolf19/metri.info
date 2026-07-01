import type { SVGProps } from "react";

/**
 * Gmail brand mark — official 2020+ SVG, fetched from Wikimedia Commons
 * (the same asset Google ships in Material Design and Workspace builds).
 *
 * Why not Iconoir or `currentColor`? Iconoir has no brand icons (same
 * reasoning as `GithubMark`), and a monochrome version becomes a generic
 * envelope at 16px — the four Google colours are what make the brand
 * recognisable. We keep them hardcoded rather than `currentColor` because
 * a single-colour fallback isn't a meaningful difference.
 *
 * ViewBox is the upstream value (`52 42 88 66`) — the SVG isn't centred on
 * `(0,0)`. Width/height collapse to a square via the consumer's `size`
 * prop; we mirror the natural aspect ratio of the box by exposing the same
 * dimensions back to the caller (no padding math needed).
 */
export const GmailIcon = ({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    width={size}
    height={(size * 66) / 88}
    viewBox="52 42 88 66"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <path fill="#4285F4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
    <path fill="#34A853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
    <path fill="#FBBC04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
    <path fill="#EA4335" d="M72 74V48l24 18 24-18v26L96 92" />
    <path
      fill="#C5221F"
      d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"
    />
  </svg>
);
