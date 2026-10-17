import { defineListConfig } from "listkit/server";

import { listAdminUsers } from "@/app/admin/users/actions";

import { UserRowActions } from "@/components/admin/UserRowActions";
import { UsersIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import {
  formatListDate,
  metriListTheme,
  metriListTones,
} from "@/lib/lists/theme";

/** Rows an "export all" asks the action for in one go (its `maxExport`). */
const EXPORT_PAGE = 5000;

/** One row of the admin users list, as `listAdminUsers` returns it. */
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  emailVerified: boolean;
  /** ISO-8601 UTC. */
  createdAt: string;
};

/**
 * The admin users list. Filter ids are the keys `listAdminUsers` whitelists
 * into SQL, so the sidebar and the query share one declaration. Built with the
 * `/server` twin of `defineListConfig` so the page can derive the first query
 * from the URL and the client list can hydrate from it.
 */
export const usersListConfig = defineListConfig<AdminUserRow>({
  id: "admin-users",
  pageSize: 25,
  colorTheme: metriListTheme,
  tones: metriListTones,
  search: true,
  searchPlaceholder: "Search by email or name…",
  getItemKey: (u) => u.id,
  defaultSort: { field: "createdAt", dir: "desc" },
  filtersTitle: "Filter users",
  filters: [
    {
      id: "account",
      title: "Account",
      filters: [
        {
          id: "plan",
          field: "plan",
          label: "Plan",
          type: "select",
          options: [
            { value: "free", label: "Free" },
            { value: "premium", label: "Premium" },
          ],
          quick: true,
          pinned: true,
          pinnedValue: "premium",
        },
        {
          id: "role",
          field: "role",
          label: "Role",
          type: "select",
          options: [
            { value: "user", label: "User" },
            { value: "admin", label: "Admin" },
          ],
          quick: true,
        },
        {
          id: "verified",
          field: "emailVerified",
          label: "Email verified",
          type: "boolean",
        },
        {
          id: "joined",
          field: "createdAt",
          label: "Joined",
          type: "date-range",
          quick: true,
        },
      ],
    },
  ],
  table: {
    columns: [
      {
        key: "name",
        header: "Name",
        sortable: true,
        grow: true,
        render: (u) => (
          <span className="font-medium text-ink-100">{u.name || "—"}</span>
        ),
        exportValue: (u) => u.name,
      },
      {
        key: "email",
        header: "Email",
        sortable: true,
        truncate: true,
        width: "16rem",
      },
      {
        key: "role",
        header: "Role",
        width: "7rem",
        render: (u) => (
          <Badge variant={u.role === "admin" ? "default" : "outline"}>
            {u.role}
          </Badge>
        ),
        exportValue: (u) => u.role,
      },
      {
        key: "plan",
        header: "Plan",
        width: "7rem",
        render: (u) =>
          u.plan === "premium" ? (
            <span className="font-medium text-brand">Premium</span>
          ) : (
            <span className="text-ink-300">Free</span>
          ),
        exportValue: (u) => u.plan,
      },
      {
        key: "emailVerified",
        header: "Verified",
        width: "6rem",
        render: (u) =>
          u.emailVerified ? (
            <span className="text-accent">Yes</span>
          ) : (
            <span className="text-ink-400">No</span>
          ),
        exportValue: (u) => (u.emailVerified ? "yes" : "no"),
      },
      {
        key: "createdAt",
        header: "Joined",
        sortable: true,
        width: "11rem",
        render: (u) => (
          <span className="whitespace-nowrap text-ink-300">
            {formatListDate(u.createdAt)}
          </span>
        ),
        exportValue: (u) => u.createdAt,
      },
      {
        key: "actions",
        header: "",
        overlay: true,
        width: "10rem",
        render: (u) => <UserRowActions user={u} />,
      },
    ],
  },
  export: {
    fileName: "metri-users",
    // "Export all" needs a bulk fetch; an oversized pageSize is the
    // action's export path (capped by its `maxExport`).
    fetchAll: async (q) =>
      (await listAdminUsers({ ...q, page: 1, pageSize: EXPORT_PAGE })).data,
  },
  empty: {
    title: "No users match",
    message: "Loosen the search or clear a filter.",
    icon: <UsersIcon size={36} />,
  },
});
