import { loadInitialList, type SearchParamsLike } from "listkit/server";
import { Suspense } from "react";

import { listAdminUsers } from "@/app/admin/users/actions";
import { PageHeader } from "@/components/admin/ui";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { UsersList } from "@/components/admin/UsersList";
import { usersListConfig } from "@/lib/lists/users";

type SearchParams = Promise<SearchParamsLike>;

// The list is the only async part. Its first page is computed from the URL on
// the server (same query the client derives), so the table is in the HTML and
// the client skips its first fetch.
const UsersData = async ({ searchParams }: { searchParams: SearchParams }) => {
  const { initialData, initialQuery } = await loadInitialList(
    usersListConfig,
    await searchParams,
    listAdminUsers,
  );
  return <UsersList initialData={initialData} initialQuery={initialQuery} />;
};

const UsersPage = ({ searchParams }: { searchParams: SearchParams }) => (
  <>
    <PageHeader
      title="Users"
      description="Registered accounts. Search, filter by plan, role, verification or join date, grant or revoke Premium per user, or delete an account permanently (cascades to everything it owns)."
    />
    <Suspense fallback={<LoadingScreen label="Loading users…" />}>
      <UsersData searchParams={searchParams} />
    </Suspense>
  </>
);

export default UsersPage;
