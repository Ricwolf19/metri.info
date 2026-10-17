"use client";

import type { ListQuery, ListResult } from "listkit";
import { serverActionAdapter } from "listkit";
import { NextListView } from "listkit/next";
import { useMemo } from "react";

import { listAdminUsers } from "@/app/admin/users/actions";
import { type AdminUserRow, usersListConfig } from "@/lib/lists/users";

/** The users list, hydrated from the page's first query and re-fetched through
 * the same server action as the user searches, filters, sorts and pages. */
export const UsersList = ({
  initialData,
  initialQuery,
}: {
  /** The server-fetched first page; absent when that fetch failed and the
   * list falls back to fetching on the client. */
  initialData?: ListResult<AdminUserRow>;
  initialQuery: ListQuery;
}) => {
  const adapter = useMemo(
    () => serverActionAdapter<AdminUserRow>(listAdminUsers),
    [],
  );
  return (
    <NextListView
      config={usersListConfig}
      adapter={adapter}
      initialData={initialData}
      initialQuery={initialQuery}
      paginationVariant="inline"
    />
  );
};
