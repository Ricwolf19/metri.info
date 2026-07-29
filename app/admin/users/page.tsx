import { Suspense } from "react";

import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { PageHeader } from "@/components/admin/ui";
import { UsersTable } from "@/components/admin/UsersTable";

// The table is the only async part — keeping it in its own boundary lets the
// header paint immediately instead of the route-level loading.tsx swapping the
// whole page out while the DB query runs.
const UsersPage = () => (
  <>
    <PageHeader
      title="Users"
      description="Registered accounts, newest first. Read-only — name, email, role, email verification and join date."
    />
    <Suspense fallback={<AdminTableSkeleton />}>
      <UsersTable />
    </Suspense>
  </>
);

export default UsersPage;
