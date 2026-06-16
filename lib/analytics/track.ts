import posthog from "posthog-js";

/**
 * Capture a custom product event in PostHog from a client component. A no-op
 * until PostHog has initialized (no key, DNT on, or SSR) so call sites never
 * need to guard. Event names are kebab/snake-free, snake_case to match the
 * built-in `$pageview` / `calculator_used` convention already in use.
 */
export const track = (
  event: string,
  properties?: Record<string, unknown>,
): void => {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
};
