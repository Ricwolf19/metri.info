import { Suspense } from "react";

import { ErrorsPanel } from "@/components/admin/analytics/ErrorsPanel";
import { RangeBar } from "@/components/admin/RangeBar";
import { AdminSkeleton } from "@/components/skeletons/AdminSkeleton";
import { SENTRY_MAX_DAYS, sentryPeriod } from "@/lib/analytics/errors";
import type { SearchParams } from "@/lib/analytics/range";
import { readAnalyticsRequest, windowKey } from "@/lib/analytics/request";

type Props = { searchParams: Promise<SearchParams> };

const Dashboard = async ({ searchParams }: Props) => {
  const { params, today, window } = await readAnalyticsRequest(searchParams);
  const { clamped } = sentryPeriod(window, today);
  return (
    <>
      <RangeBar
        pathname="/admin/analytics/sentry"
        params={params}
        window={window}
        today={today}
        note={
          clamped
            ? `Sentry is read for the last ${SENTRY_MAX_DAYS} days of the range at most`
            : "Sentry's own clock (UTC)"
        }
      />
      <Suspense
        key={windowKey(window)}
        fallback={<AdminSkeleton label="Loading Sentry…" header={false} />}
      >
        <ErrorsPanel window={window} today={today} />
      </Suspense>
    </>
  );
};

const AnalyticsErrorsPage = ({ searchParams }: Props) => (
  <Suspense fallback={<AdminSkeleton label="Loading analytics…" />}>
    <Dashboard searchParams={searchParams} />
  </Suspense>
);

export default AnalyticsErrorsPage;
