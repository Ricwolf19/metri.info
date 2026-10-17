"use client";

import type { ListQuery, ListResult } from "listkit";
import { serverActionAdapter } from "listkit";
import { NextListView } from "listkit/next";
import { useMemo } from "react";

import { listAdminCalculations } from "@/app/admin/calculations/actions";
import {
  type AdminCalculationRow,
  calculationsListConfig,
} from "@/lib/lists/calculations";

/** The saved-calculations list, server-seeded and server-paged. */
export const CalculationsList = ({
  initialData,
  initialQuery,
}: {
  /** The server-fetched first page; absent when that fetch failed and the
   * list falls back to fetching on the client. */
  initialData?: ListResult<AdminCalculationRow>;
  initialQuery: ListQuery;
}) => {
  const adapter = useMemo(
    () => serverActionAdapter<AdminCalculationRow>(listAdminCalculations),
    [],
  );
  return (
    <NextListView
      config={calculationsListConfig}
      adapter={adapter}
      initialData={initialData}
      initialQuery={initialQuery}
      paginationVariant="inline"
    />
  );
};
