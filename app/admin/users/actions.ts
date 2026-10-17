"use server";

import type { ListQuery, ListResult } from "listkit";
import { executeSqlList } from "listkit/sql";

import { requireAdminActor } from "@/lib/admin/actor";
import { listPool as pool } from "@/lib/lists/pool";
import { isoColumn } from "@/lib/lists/sql";
import type { AdminUserRow } from "@/lib/lists/users";
import { event } from "@/lib/log/logger";

const EMPTY: ListResult<AdminUserRow> = { data: [], total: 0 };

/**
 * One page of users for the admin list: search, quick/advanced filters, sort
 * and pagination all run in SQL. Every column name comes from the whitelists
 * below (filter id → column), never from the client, and a non-admin caller
 * gets an empty page rather than an error.
 */
export const listAdminUsers = async (
  query: ListQuery,
): Promise<ListResult<AdminUserRow>> => {
  const actor = await requireAdminActor();
  if (!actor.ok) return EMPTY;
  try {
    return await executeSqlList<AdminUserRow>({
      pool,
      table: '"user" u',
      query,
      columns: `u.id, u.name, u.email, u.role, u.plan, u.email_verified AS "emailVerified", ${isoColumn("u.created_at", "createdAt")}`,
      fields: {
        plan: "u.plan",
        role: "u.role",
        verified: "u.email_verified",
        joined: "u.created_at",
      },
      searchColumns: ["u.email", "u.name"],
      sort: { name: "u.name", email: "u.email", createdAt: "u.created_at" },
      fallbackSort: "u.created_at DESC",
      tiebreak: ", u.id DESC",
      maxPageSize: 100,
      maxExport: 5000,
    });
  } catch (error) {
    event.warn("admin.users-list-failed", { error: String(error) });
    return EMPTY;
  }
};
