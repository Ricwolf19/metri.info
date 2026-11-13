import "server-only";

/**
 * Factory for tagged, cached, never-throwing JSON clients over a server-side
 * upstream (PostHog, Sentry, …).
 *
 * Every admin panel wants the same five things — auth headers, a revalidate
 * window, a cache tag, "return null instead of throwing", and JSON parsing —
 * so registering a new upstream is a declaration instead of another copy of
 * the same try/catch.
 *
 * `headers()` returning null means "not configured": the caller gets `null` and
 * the panel degrades, rather than the page crashing on a missing env key.
 */
export type ApiClient = {
  request: <T>(path: string, init?: RequestInit) => Promise<T | null>;
};

/** A slow upstream must not hold a dashboard render hostage. */
export const UPSTREAM_TIMEOUT_MS = 20_000;
const RETRY_AFTER_MS = 1_000;

/** `send`, and once more a second later if the answer was a 429: a
 * dashboard fires several reads at once, and one rate-limited answer
 * shouldn't blank a card. */
export const retryOnRateLimit = async (
  send: () => Promise<Response>,
): Promise<Response> => {
  const res = await send();
  if (res.status !== 429) return res;
  await res.body?.cancel();
  await new Promise((r) => setTimeout(r, RETRY_AFTER_MS));
  return send();
};

export const createApiClient = ({
  baseUrl,
  tag,
  revalidate = 300,
  headers,
}: {
  /** Upstream origin + base path, no trailing slash. */
  baseUrl: string;
  /** Cache tag from `lib/cache/tags` — what `updateTag` targets. */
  tag: string;
  /** Seconds. Defaults to 5 min: fresh enough for a dashboard, well under
   * every upstream's rate limit. */
  revalidate?: number;
  /** Auth headers, or null when the upstream isn't configured. */
  headers: () => Record<string, string> | null;
}): ApiClient => ({
  request: async <T>(path: string, init?: RequestInit): Promise<T | null> => {
    const auth = headers();
    if (!auth) return null;
    const send = () =>
      fetch(`${baseUrl}${path}`, {
        ...init,
        headers: { ...auth, ...init?.headers },
        next: { revalidate, tags: [tag] },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
    try {
      const res = await retryOnRateLimit(send);
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  },
});
