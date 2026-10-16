import {
  DeleteUserButton,
  REASON_MESSAGE,
} from "@/components/admin/DeleteUserButton";
import { PremiumToggle } from "@/components/admin/PremiumToggle";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminUsers } from "@/lib/admin/queries";
import { getSession } from "@/lib/auth/session";

const fmtDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/** Users table (100 newest, optionally filtered) with the per-row actions:
 * plan toggle and hard delete. Self and other admins can't be deleted. */
export const UsersTable = async ({ query }: { query?: string }) => {
  const [data, session] = await Promise.all([
    getAdminUsers(query),
    getSession(),
  ]);
  const currentUserId = session?.user.id;

  if (!data) {
    return <p className="text-sm text-ink-400">Database not configured.</p>;
  }

  return (
    <div>
      <p className="text-sm text-ink-400">
        Showing {data.rows.length} of {data.total.toLocaleString("en-US")}{" "}
        {query ? "matching users" : "users"} · newest first
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-ink-400">
                {query ? `No users match “${query}”.` : "No users yet."}
              </TableCell>
            </TableRow>
          )}
          {data.rows.map((u) => {
            const disabledReason =
              u.id === currentUserId
                ? REASON_MESSAGE.self
                : u.role === "admin"
                  ? REASON_MESSAGE.admin_protected
                  : undefined;
            return (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-ink-100">
                  {u.name || "—"}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "outline"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {u.emailVerified ? (
                    <span className="text-accent">Yes</span>
                  ) : (
                    <span className="text-ink-400">No</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-ink-300">
                  {fmtDate(u.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <PremiumToggle userId={u.id} plan={u.plan} />
                    <DeleteUserButton
                      userId={u.id}
                      email={u.email}
                      disabledReason={disabledReason}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
