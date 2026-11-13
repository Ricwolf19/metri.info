import Link from "next/link";
import { connection } from "next/server";

import { AreaLine } from "@/components/admin/charts/AreaLine";
import { BarList } from "@/components/admin/charts/BarList";
import { CalendarHeatmap } from "@/components/admin/charts/CalendarHeatmap";
import { HourHeatmap } from "@/components/admin/charts/HourHeatmap";
import { SimulatedBadge } from "@/components/admin/SourceCard";
import { Card, fmt, Placeholder } from "@/components/admin/ui";
import {
  getActivityGrid,
  getBehaviorSummary,
  getBreakdown,
  getDailyActivity,
} from "@/lib/analytics/behavior";
import { getDbMetrics } from "@/lib/analytics/db-metrics";
import { getGaRealtime } from "@/lib/analytics/ga";
import {
  ANALYTICS_TIME_ZONE,
  ANALYTICS_ZONE_LABEL,
  lastDays,
  todayIn,
} from "@/lib/analytics/range";
import {
  getSentryErrorTotals,
  getTopSentryIssues,
} from "@/lib/analytics/sentry";
import { SOURCES, type SourceMode, sourceMode } from "@/lib/analytics/sources";
import { cn } from "@/lib/utils";

const COLORS = ["#84cc16", "#38bdf8", "#f59e0b", "#8b5cf6", "#22c55e"];
const CALENDAR_DAYS = 84;

/** The upstreams the pulse strip reads (Postgres is never simulated). */
const PULSE_SOURCES = ["posthog", "sentry", "ga"] as const;
const listFormat = new Intl.ListFormat("en", { type: "conjunction" });
const HOURLY_DAYS = 30;

type Source = "db" | "posthog" | "ga" | "sentry";

const SOURCE_LABEL: Record<Source, string> = {
  db: "Postgres",
  posthog: "PostHog",
  ga: "GA4",
  sentry: "Sentry",
};

/** One headline number with where it comes from. A source that's `off`
 * says "connect it" instead of a dash, so a blank is never mistaken for zero;
 * a simulated one says so on its badge. */
const Pulse = ({
  label,
  value,
  source,
  mode,
  href,
  tone,
}: {
  label: string;
  value: number | null;
  source: Source;
  mode: SourceMode;
  href?: string;
  tone?: "flame";
}) => (
  <div className="min-w-0 rounded-card border border-ink-600 bg-ink-800 p-5">
    <div className="flex items-start justify-between gap-2">
      <p className="min-w-0 text-sm text-ink-400">{label}</p>
      {/* One short pill, never wrapped: the source, and a flame dot when the
          number is simulated (the note above the strip says which). */}
      <span
        title={mode === "simulated" ? "Simulated data" : undefined}
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[10px] tracking-wide whitespace-nowrap uppercase",
          mode === "live"
            ? "border-ink-600 text-ink-400"
            : "border-flame/40 text-flame",
        )}
      >
        {mode === "simulated" ? (
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-flame" />
        ) : null}
        {SOURCE_LABEL[source]}
        {mode === "simulated" ? (
          <span className="sr-only"> (simulated)</span>
        ) : null}
      </span>
    </div>
    <p
      className={cn(
        "mt-1 font-mono text-3xl font-bold",
        tone === "flame" && value ? "text-flame" : "text-ink-50",
      )}
    >
      {mode === "off" ? (
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
  // Every window below runs to today, which is request-time data.
  await connection();
  const today = todayIn(ANALYTICS_TIME_ZONE, new Date());
  const [
    dbMetrics,
    week,
    daily,
    hourly,
    topPages,
    sentryTotals,
    issues,
    realtime,
  ] = await Promise.all([
    getDbMetrics(),
    getBehaviorSummary(lastDays(7, today)),
    getDailyActivity(lastDays(CALENDAR_DAYS, today)),
    getActivityGrid(lastDays(HOURLY_DAYS, today)),
    getBreakdown("pages", lastDays(30, today)),
    getSentryErrorTotals(),
    getTopSentryIssues(lastDays(14, today), today, 5),
    getGaRealtime(),
  ]);
  const phMode = sourceMode("posthog");
  const sentryMode = sourceMode("sentry");
  const ph = phMode !== "off";
  const sentry = sentryMode !== "off";
  const phBadge = phMode === "simulated" ? <SimulatedBadge /> : null;

  const simulated = PULSE_SOURCES.filter((s) => sourceMode(s) === "simulated");

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        {simulated.length > 0 ? (
          <p
            role="note"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-400"
          >
            <SimulatedBadge />
            Made-up {listFormat.format(
              simulated.map((s) => SOURCES[s].label),
            )}{" "}
            numbers: this dev server has no keys for{" "}
            {simulated.length > 1 ? "them" : "it"}.
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Pulse
            label="Registered users"
            value={dbMetrics?.totals.users ?? null}
            source="db"
            mode={dbMetrics === null ? "off" : "live"}
          />
          <Pulse
            label="Pageviews · 7 days"
            value={week?.pageviews ?? null}
            source="posthog"
            mode={phMode}
            href="/admin/analytics"
          />
          <Pulse
            label="Errors · 24 hours"
            value={sentryTotals?.last24h ?? null}
            source="sentry"
            mode={sentryMode}
            href="/admin/analytics/sentry"
            tone="flame"
          />
          <Pulse
            label="On the site right now"
            value={realtime?.activeUsers ?? null}
            source="ga"
            mode={sourceMode("ga")}
            href="/admin/analytics/google"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Traffic calendar"
          aside={phBadge}
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
          aside={phBadge}
          subtitle={`Pageviews by weekday and hour (${ANALYTICS_ZONE_LABEL}) · last ${HOURLY_DAYS} days · PostHog`}
        >
          {!ph ? (
            <Placeholder>
              Connect PostHog: set POSTHOG_PERSONAL_API_KEY and
              POSTHOG_PROJECT_ID.
            </Placeholder>
          ) : hourly ? (
            <HourHeatmap
              cells={hourly}
              title="Pageviews by weekday and hour"
              zone={ANALYTICS_ZONE_LABEL}
            />
          ) : (
            <Placeholder>No PostHog data available.</Placeholder>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
          aside={phBadge}
          subtitle="By pageviews · last 30 days · PostHog"
        >
          {!ph ? (
            <Placeholder>Connect PostHog to see pages.</Placeholder>
          ) : topPages && topPages.length > 0 ? (
            <BarList
              items={topPages
                .slice(0, 6)
                .map((p) => ({ label: p.label, value: p.value }))}
            />
          ) : (
            <Placeholder>No PostHog data available.</Placeholder>
          )}
        </Card>
        <Card
          title="Top issues"
          subtitle="Unresolved · last 14 days · Sentry"
          aside={sentryMode === "simulated" ? <SimulatedBadge /> : null}
        >
          {!sentry ? (
            <Placeholder>Connect Sentry to see issues.</Placeholder>
          ) : issues && issues.length > 0 ? (
            <ul className="space-y-2.5">
              {issues.map((i) => (
                <li key={i.id} className="flex items-start gap-3">
                  <span className="min-w-0 flex-1">
                    <a
                      href={i.permalink ?? "/admin/analytics/sentry"}
                      target={i.permalink ? "_blank" : undefined}
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
