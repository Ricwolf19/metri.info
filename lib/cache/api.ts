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
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: { ...auth, ...init?.headers },
        next: { revalidate, tags: [tag] },
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  },
});
