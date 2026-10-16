import { Suspense } from "react";

import { AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { PageHeader } from "@/components/admin/ui";
import { UsersSearch } from "@/components/admin/UsersSearch";
import { UsersTable } from "@/components/admin/UsersTable";

// The table is the only async part — keeping it in its own boundary lets the
// header and search paint immediately; keying it by the query swaps the
// skeleton in while a new search streams.
const UsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const { q = "" } = await searchParams;
  return (
    <>
      <PageHeader
        title="Users"
        description="Registered accounts, newest first. Grant or revoke Premium per user, or delete an account permanently (cascades to everything it owns)."
      />
      <UsersSearch initialQuery={q} />
      <Suspense key={q} fallback={<AdminTableSkeleton />}>
        <UsersTable query={q} />
      </Suspense>
    </>
  );
};

export default UsersPage;
