import Link from "next/link";

import { AreaLine } from "@/components/admin/charts/AreaLine";
import { BarList } from "@/components/admin/charts/BarList";
import { CalendarHeatmap } from "@/components/admin/charts/CalendarHeatmap";
import { HourHeatmap } from "@/components/admin/charts/HourHeatmap";
import { Card, fmt, Placeholder } from "@/components/admin/ui";
import { getDbMetrics } from "@/lib/analytics/db-metrics";
import { gaConfigured, getGaRealtime } from "@/lib/analytics/ga";
import {
  getDailyPageviews,
  getHourlyPageviews,
  getPageviewTotals,
  getTopPages,
  posthogConfigured,
} from "@/lib/analytics/posthog";
import {
  getSentryErrorTotals,
  getTopSentryIssues,
  sentryConfigured,
} from "@/lib/analytics/sentry";
import { cn } from "@/lib/utils";

const COLORS = ["#84cc16", "#38bdf8", "#f59e0b", "#8b5cf6", "#22c55e"];
const CALENDAR_DAYS = 84;
const HOURLY_DAYS = 30;

type Source = "db" | "posthog" | "ga" | "sentry";

const SOURCE_LABEL: Record<Source, string> = {
  db: "Postgres",
  posthog: "PostHog",
  ga: "GA4",
  sentry: "Sentry",
};

/** One headline number with where it comes from. `configured: false` says
 * "connect it" instead of a dash, so a blank is never mistaken for zero. */
const Pulse = ({
  label,
  value,
  source,
  configured,
  href,
  tone,
}: {
  label: string;
  value: number | null;
  source: Source;
  configured: boolean;
  href?: string;
  tone?: "flame";
}) => (
  <div className="rounded-card border border-ink-600 bg-ink-800 p-5">
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm text-ink-400">{label}</p>
      <span
        className={cn(
          "rounded-full border px-1.5 py-0.5 font-mono text-[10px] tracking-wide uppercase",
          configured
            ? "border-ink-600 text-ink-400"
            : "border-flame/40 text-flame",
        )}
      >
        {SOURCE_LABEL[source]}
      </span>
    </div>
    <p
      className={cn(
        "mt-1 font-mono text-3xl font-bold",
        tone === "flame" && value ? "text-flame" : "text-ink-50",
      )}
    >
      {!configured ? (
        href ? (
          <Link
            href={href}
            className="text-base font-medium text-ink-300 underline-offset-4 hover:underline"
          >
            Connect
          </Link>
        ) : (
          "—"
        )
      ) : value === null ? (
        "—"
      ) : (
        fmt(value)
      )}
    </p>
  </div>
);

/**
 * The admin front page: a pulse strip with one number per source (so a
 * missing key shows up here, not three tabs deep), the first-party series,
 * when the site is used (calendar + weekday/hour heatmaps from PostHog), and
 * the top lists. Every upstream degrades on its own: a card never blanks the
 * page. Drilldowns live under /admin/analytics.
 */
export const Overview = async () => {
  const [
    dbMetrics,
    pageviews,
    daily,
    hourly,
    topPages,
    sentryTotals,
    issues,
    realtime,
  ] = await Promise.all([
    getDbMetrics(),
    getPageviewTotals(),
    getDailyPageviews(CALENDAR_DAYS),
    getHourlyPageviews(HOURLY_DAYS),
    getTopPages(),
    getSentryErrorTotals(),
    getTopSentryIssues(5),
    getGaRealtime(),
  ]);
  const ph = posthogConfigured();
  const sentry = sentryConfigured();
  const ga = gaConfigured();

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Pulse
          label="Registered users"
          value={dbMetrics?.totals.users ?? null}
          source="db"
          configured={dbMetrics !== null}
        />
        <Pulse
          label="Pageviews · 7 days"
          value={pageviews?.last7 ?? null}
          source="posthog"
          configured={ph}
          href="/admin/analytics"
        />
        <Pulse
          label="Errors · 24 hours"
          value={sentryTotals?.last24h ?? null}
          source="sentry"
          configured={sentry}
          href="/admin/analytics/sentry"
          tone="flame"
        />
        <Pulse
          label="On the site right now"
          value={realtime}
          source="ga"
          configured={ga}
          href="/admin/analytics/google"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          title="Active sessions"
          subtitle="Signed-in sessions not yet expired"
        >
          <p className="font-mono text-3xl font-bold text-ink-50">
            {dbMetrics ? fmt(dbMetrics.totals.activeSessions) : "—"}
          </p>
        </Card>
        <Card title="Saved calculations" subtitle="All time">
          <p className="font-mono text-3xl font-bold text-ink-50">
            {dbMetrics ? fmt(dbMetrics.totals.calculations) : "—"}
          </p>
        </Card>
        <Card title="Favorites" subtitle="Pinned calculators, all accounts">
          <p className="font-mono text-3xl font-bold text-ink-50">
            {dbMetrics ? fmt(dbMetrics.totals.favorites) : "—"}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Saved calculations" subtitle="Per day · last 30 days">
          {dbMetrics ? (
            <AreaLine
              points={dbMetrics.calcsPerDay}
              title="Saved calculations per day"
            />
          ) : (
            <Placeholder>Database not configured.</Placeholder>
          )}
        </Card>
        <Card title="Signups" subtitle="New users per day · last 30 days">
          {dbMetrics ? (
            <AreaLine
              points={dbMetrics.signupsPerDay}
              color="#38bdf8"
              title="Signups per day"
            />
          ) : (
            <Placeholder>Database not configured.</Placeholder>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Traffic calendar"
          subtitle={`Pageviews per day · last ${CALENDAR_DAYS} days · PostHog`}
        >
          {!ph ? (
            <Placeholder>
              Connect PostHog: set POSTHOG_PERSONAL_API_KEY and
              POSTHOG_PROJECT_ID.
            </Placeholder>
          ) : daily ? (
            <CalendarHeatmap days={daily} title="Pageviews per day" />
          ) : (
            <Placeholder>No PostHog data available.</Placeholder>
          )}
        </Card>
        <Card
          title="When people come"
          subtitle={`Pageviews by weekday and hour (UTC) · last ${HOURLY_DAYS} days · PostHog`}
        >
          {!ph ? (
            <Placeholder>
              Connect PostHog: set POSTHOG_PERSONAL_API_KEY and
              POSTHOG_PROJECT_ID.
            </Placeholder>
          ) : hourly ? (
            <HourHeatmap cells={hourly} title="Pageviews by weekday and hour" />
          ) : (
            <Placeholder>No PostHog data available.</Placeholder>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Top calculators"
          subtitle="By saved calculations · Postgres"
        >
          {dbMetrics ? (
            <BarList
              items={dbMetrics.topCalculators.map((c, i) => ({
                label: c.name,
                value: c.value,
                color: COLORS[i % COLORS.length],
              }))}
            />
          ) : (
            <Placeholder>Database not configured.</Placeholder>
          )}
        </Card>
        <Card
          title="Top pages"
          subtitle="By pageviews · last 30 days · PostHog"
        >
          {!ph ? (
            <Placeholder>Connect PostHog to see pages.</Placeholder>
          ) : topPages && topPages.length > 0 ? (
            <BarList
              items={topPages
                .slice(0, 6)
                .map((p) => ({ label: p.path, value: p.views }))}
            />
          ) : (
            <Placeholder>No PostHog data available.</Placeholder>
          )}
        </Card>
        <Card title="Top issues" subtitle="Unresolved · last 14 days · Sentry">
          {!sentry ? (
            <Placeholder>Connect Sentry to see issues.</Placeholder>
          ) : issues && issues.length > 0 ? (
            <ul className="space-y-2.5">
              {issues.map((i) => (
                <li key={i.id} className="flex items-start gap-3">
                  <span className="min-w-0 flex-1">
                    <a
                      href={i.permalink}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block truncate text-xs font-medium text-ink-100 hover:text-brand"
                    >
                      {i.title}
                    </a>
                    <span className="block truncate font-mono text-[11px] text-ink-500">
                      {i.culprit}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-flame">
                    {fmt(i.count)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Placeholder>No unresolved issues. Good.</Placeholder>
          )}
        </Card>
      </div>
    </div>
  );
};
