import { BarList } from "@/components/admin/charts/BarList";
import { Card, fmt, Placeholder } from "@/components/admin/ui";
import {
  getSentryErrorTotals,
  getTopSentryIssues,
  sentryConfigured,
} from "@/lib/analytics/sentry";

const COLORS = ["#ef4444", "#f59e0b", "#f97316", "#8b5cf6", "#ec4899"];

const ConnectHint = () => (
  <Placeholder>
    Connect Sentry — set SENTRY_API_TOKEN (a User Auth Token with{" "}
    <code className="text-ink-300">event:read project:read org:read</code>).
  </Placeholder>
);

const Split = ({ last24h, last14d }: { last24h: number; last14d: number }) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-xs text-ink-400">Last 24 hours</p>
      <p className="mt-1 font-mono text-2xl font-bold text-ink-50">
        {fmt(last24h)}
      </p>
    </div>
    <div>
      <p className="text-xs text-ink-400">Last 14 days</p>
      <p className="mt-1 font-mono text-2xl font-bold text-ink-50">
        {fmt(last14d)}
      </p>
    </div>
  </div>
);

/**
 * Sentry error observability. Same contract as the PostHog / GA panels —
 * degrades to "Connect Sentry" when unconfigured, "No data" when empty.
 */
export const SentryPanel = async () => {
  const [totals, issues] = await Promise.all([
    getSentryErrorTotals(),
    getTopSentryIssues(),
  ]);

  const configured = sentryConfigured();
  const empty = <Placeholder>No Sentry data available.</Placeholder>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Error events" subtitle="Captured errors · 24h vs 14d">
        {!configured ? (
          <ConnectHint />
        ) : totals ? (
          <Split last24h={totals.last24h} last14d={totals.last14d} />
        ) : (
          empty
        )}
      </Card>

      <Card title="Top issues" subtitle="Unresolved · by frequency · last 14d">
        {!configured ? (
          <ConnectHint />
        ) : issues && issues.length > 0 ? (
          <BarList
            items={issues.map((i, idx) => ({
              label: i.title,
              value: i.count,
              color: COLORS[idx % COLORS.length],
            }))}
          />
        ) : (
          empty
        )}
      </Card>

      <Card
        title="Unresolved issues"
        subtitle="Most frequent · last 14 days · click to open in Sentry"
        className="lg:col-span-2"
      >
        {!configured ? (
          <ConnectHint />
        ) : issues && issues.length > 0 ? (
          <ul className="divide-y divide-ink-700">
            {issues.map((i) => (
              <li key={i.id}>
                <a
                  href={i.permalink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between gap-4 py-2.5 transition-colors hover:text-ink-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink-100">
                      {i.title}
                    </span>
                    {i.culprit ? (
                      <span className="block truncate text-xs text-ink-400">
                        {i.culprit}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-mono text-sm text-ink-300">
                    {fmt(i.count)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          empty
        )}
      </Card>
    </div>
  );
};
