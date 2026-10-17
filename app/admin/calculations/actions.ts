"use server";

import type { ListQuery, ListResult } from "listkit";
import { executeSqlList } from "listkit/sql";

import { requireAdminActor } from "@/lib/admin/actor";
import type { AdminCalculationRow } from "@/lib/lists/calculations";
import { listPool } from "@/lib/lists/pool";
import { isoColumn } from "@/lib/lists/sql";
import { event } from "@/lib/log/logger";

const EMPTY: ListResult<AdminCalculationRow> = { data: [], total: 0 };

/** One page of saved calculations joined to the owner's email (a single left
 * join, no N+1), with the filters, sort and pagination resolved in SQL. */
export const listAdminCalculations = async (
  query: ListQuery,
): Promise<ListResult<AdminCalculationRow>> => {
  const actor = await requireAdminActor();
  if (!actor.ok) return EMPTY;
  try {
    return await executeSqlList<AdminCalculationRow>({
      pool: listPool,
      table: 'calculation_log c LEFT JOIN "user" u ON u.id = c.user_id',
      query,
      columns: `c.id, c.calculator_type AS "calculatorType", u.email, c.results, ${isoColumn("c.created_at", "createdAt")}`,
      fields: {
        calculator: "c.calculator_type",
        saved: "c.created_at",
      },
      searchColumns: ["u.email"],
      sort: {
        calculatorType: "c.calculator_type",
        email: "u.email",
        createdAt: "c.created_at",
      },
      fallbackSort: "c.created_at DESC",
      tiebreak: ", c.id DESC",
      maxPageSize: 100,
      maxExport: 5000,
    });
  } catch (error) {
    event.warn("admin.calculations-list-failed", { error: String(error) });
    return EMPTY;
  }
};
