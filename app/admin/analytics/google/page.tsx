import { Suspense } from "react";

import { TrafficPanel } from "@/components/admin/analytics/TrafficPanel";
import { RangeBar } from "@/components/admin/RangeBar";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import type { SearchParams } from "@/lib/analytics/range";
import { readAnalyticsRequest, windowKey } from "@/lib/analytics/request";

type Props = { searchParams: Promise<SearchParams> };

const Dashboard = async ({ searchParams }: Props) => {
  const { params, today, window } = await readAnalyticsRequest(searchParams);
  return (
    <>
      <RangeBar
        pathname="/admin/analytics/google"
        params={params}
        window={window}
        today={today}
        note="GA4 counts days in its property's time zone"
      />
      <Suspense
        key={windowKey(window)}
        fallback={<LoadingScreen label="Loading Google Analytics…" />}
      >
        <TrafficPanel window={window} />
      </Suspense>
    </>
  );
};

const AnalyticsTrafficPage = ({ searchParams }: Props) => (
  <Suspense fallback={<LoadingScreen label="Loading analytics…" />}>
    <Dashboard searchParams={searchParams} />
  </Suspense>
);

export default AnalyticsTrafficPage;
