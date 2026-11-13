import { Suspense } from "react";

import { BehaviorPanel } from "@/components/admin/analytics/BehaviorPanel";
import { RangeBar } from "@/components/admin/RangeBar";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ANALYTICS_ZONE_LABEL, type SearchParams } from "@/lib/analytics/range";
import { readAnalyticsRequest, windowKey } from "@/lib/analytics/request";

type Props = { searchParams: Promise<SearchParams> };

const Dashboard = async ({ searchParams }: Props) => {
  const { params, today, window } = await readAnalyticsRequest(searchParams);
  return (
    <>
      <RangeBar
        pathname="/admin/analytics"
        params={params}
        window={window}
        today={today}
        note={`Days in ${ANALYTICS_ZONE_LABEL} time · visitors who declined cookies aren't counted`}
      />
      <Suspense
        key={windowKey(window)}
        fallback={<LoadingScreen label="Loading PostHog…" />}
      >
        <BehaviorPanel window={window} />
      </Suspense>
    </>
  );
};

const AnalyticsBehaviorPage = ({ searchParams }: Props) => (
  <Suspense fallback={<LoadingScreen label="Loading analytics…" />}>
    <Dashboard searchParams={searchParams} />
  </Suspense>
);

export default AnalyticsBehaviorPage;
