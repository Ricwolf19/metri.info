import { Suspense } from "react";

import { IndexCoverage } from "@/components/admin/analytics/IndexCoverage";
import { SearchPanel } from "@/components/admin/analytics/SearchPanel";
import { RangeBar } from "@/components/admin/RangeBar";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { type SearchParams, windowLabel } from "@/lib/analytics/range";
import { readAnalyticsRequest, windowKey } from "@/lib/analytics/request";
import { SEARCH_CONSOLE_LAG_DAYS, searchWindow } from "@/lib/analytics/search";

type Props = { searchParams: Promise<SearchParams> };

const Dashboard = async ({ searchParams }: Props) => {
  const { params, today, window } = await readAnalyticsRequest(searchParams);
  const search = searchWindow(window, today);
  return (
    <>
      <RangeBar
        pathname="/admin/analytics/search"
        params={params}
        window={window}
        today={today}
        note={
          search.shifted
            ? `Search Console finalizes a day about ${SEARCH_CONSOLE_LAG_DAYS} days after it ends, so this shows ${windowLabel({ ...search.window, preset: "custom" })}`
            : "Final Search Console data"
        }
      />
      <div className="space-y-6">
        <Suspense
          key={windowKey(search.window)}
          fallback={<LoadingScreen label="Loading Search Console…" />}
        >
          <SearchPanel window={search.window} />
        </Suspense>
        <Suspense
          fallback={<LoadingScreen label="Inspecting every sitemap URL…" />}
        >
          <IndexCoverage />
        </Suspense>
      </div>
    </>
  );
};

const AnalyticsSearchPage = ({ searchParams }: Props) => (
  <Suspense fallback={<LoadingScreen label="Loading analytics…" />}>
    <Dashboard searchParams={searchParams} />
  </Suspense>
);

export default AnalyticsSearchPage;
