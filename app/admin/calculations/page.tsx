import { Suspense } from "react";

import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { CalculationsTable } from "@/components/admin/CalculationsTable";
import { PageHeader } from "@/components/admin/ui";

const CalculationsPage = () => (
  <>
    <PageHeader
      title="Saved calculations"
      description="Recent calculator results saved to the database, newest first — calculator, the user who saved it, the primary result and timestamp."
    />
    <Suspense fallback={<AdminTableSkeleton />}>
      <CalculationsTable />
    </Suspense>
  </>
);

export default CalculationsPage;
