import { AreaLine } from "@/components/admin/charts/AreaLine";
import { BarList } from "@/components/admin/charts/BarList";
import { Card, Placeholder, Stat } from "@/components/admin/ui";
import { getDbMetrics } from "@/lib/analytics/db-metrics";

const COLORS = ["#84cc16", "#38bdf8", "#f59e0b", "#8b5cf6", "#22c55e"];

/** First-party overview: headline totals, daily timeseries, and top saved
 * calculators — all sourced from Postgres aggregates. Degrades to placeholders
 * when the DB is unconfigured. */
export const Overview = async () => {
  const dbMetrics = await getDbMetrics();

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Registered users"
          value={dbMetrics?.totals.users ?? null}
        />
        <Stat
          label="Active sessions"
          value={dbMetrics?.totals.activeSessions ?? null}
        />
        <Stat
          label="Saved calculations"
          value={dbMetrics?.totals.calculations ?? null}
        />
        <Stat label="Favorites" value={dbMetrics?.totals.favorites ?? null} />
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

      <Card title="Top calculators" subtitle="By saved calculations">
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
    </div>
  );
};
