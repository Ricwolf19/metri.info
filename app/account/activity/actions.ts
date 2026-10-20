"use server";

import { and, eq } from "drizzle-orm";
import type { ListQuery, ListResult } from "listkit";
import { executeSqlList } from "listkit/sql";
import { updateTag } from "next/cache";

import { getSession } from "@/lib/auth/session";
import { tags } from "@/lib/cache/tags";
import { db } from "@/lib/db";
import { calculationLog } from "@/lib/db/schema";
import type { HistoryRow } from "@/lib/lists/history";
import { listPool } from "@/lib/lists/pool";
import { isoColumn } from "@/lib/lists/sql";
import { event } from "@/lib/log/logger";

const EMPTY: ListResult<HistoryRow> = { data: [], total: 0 };

/** One page of the caller's own saved calculations. The user id comes from
 * the session and is merged into every query as `scope`, so no filter or sort
 * the client sends can reach another account's rows. */
export const listMyCalculations = async (
  query: ListQuery,
): Promise<ListResult<HistoryRow>> => {
  const session = await getSession();
  if (!session) return EMPTY;
  try {
    return await executeSqlList<HistoryRow>({
      pool: listPool,
      table: "calculation_log c",
      query,
      columns: `c.id, c.calculator_type AS "calculatorType", c.inputs, c.results, ${isoColumn("c.created_at", "createdAt")}`,
      fields: { calculator: "c.calculator_type", saved: "c.created_at" },
      searchColumns: ["c.calculator_type"],
      sort: { calculatorType: "c.calculator_type", createdAt: "c.created_at" },
      fallbackSort: "c.created_at DESC",
      tiebreak: ", c.id DESC",
      scope: { "c.user_id": session.user.id },
      maxPageSize: 50,
      maxExport: 5000,
    });
  } catch (error) {
    event.warn("account.history-list-failed", {
      userId: session.user.id,
      error: String(error),
    });
    return EMPTY;
  }
};

export type DeleteResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "not_found" | "error" };

/** Remove one of the caller's own saved calculations. The user id is part of
 * the predicate, so an id from another account deletes nothing. */
export const deleteMyCalculation = async (
  id: string,
): Promise<DeleteResult> => {
  if (typeof id !== "string" || id.length === 0 || id.length > 64)
    return { ok: false, reason: "not_found" };
  try {
    const session = await getSession();
    if (!session) return { ok: false, reason: "unauthenticated" };
    const deleted = await db
      .delete(calculationLog)
      .where(
        and(
          eq(calculationLog.id, id),
          eq(calculationLog.userId, session.user.id),
        ),
      )
      .returning({ id: calculationLog.id });
    if (deleted.length === 0) return { ok: false, reason: "not_found" };
    updateTag(tags.metrics.db);
    return { ok: true };
  } catch (error) {
    event.warn("history.delete-failed", { error: String(error) });
    return { ok: false, reason: "error" };
  }
};
