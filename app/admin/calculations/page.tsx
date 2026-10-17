import { loadInitialList, type SearchParamsLike } from "listkit/server";
import { Suspense } from "react";

import { listAdminCalculations } from "@/app/admin/calculations/actions";
import { CalculationsList } from "@/components/admin/CalculationsList";
import { PageHeader } from "@/components/admin/ui";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { calculationsListConfig } from "@/lib/lists/calculations";

type SearchParams = Promise<SearchParamsLike>;

const CalculationsData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const { initialData, initialQuery } = await loadInitialList(
    calculationsListConfig,
    await searchParams,
    listAdminCalculations,
  );
  return (
    <CalculationsList initialData={initialData} initialQuery={initialQuery} />
  );
};

const CalculationsPage = ({ searchParams }: { searchParams: SearchParams }) => (
  <>
    <PageHeader
      title="Saved calculations"
      description="Every calculator result saved to the database: filter by calculator, owner or date, sort any column, export the page or the whole result set."
    />
    <Suspense fallback={<LoadingScreen label="Loading calculations…" />}>
      <CalculationsData searchParams={searchParams} />
    </Suspense>
  </>
);

export default CalculationsPage;
