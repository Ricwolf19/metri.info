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

const fmtDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/** Read-only table of the 100 newest users with a total count. */
export const UsersTable = async () => {
  const data = await getAdminUsers();

  if (!data) {
    return <p className="text-sm text-ink-400">Database not configured.</p>;
  }

  return (
    <div>
      <p className="text-sm text-ink-400">
        Showing {data.rows.length} of {data.total.toLocaleString("en-US")} users
        · newest first
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((u) => (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
