import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminCalculations } from "@/lib/admin/queries";
import { CALC_CONTENT } from "@/lib/calculators/content";
import type { CalcId } from "@/lib/calculators/types";

const calcName = (id: string) => CALC_CONTENT[id as CalcId]?.en.h1 ?? id;

const fmtDate = (d: Date) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Best-effort primary value from a logged result blob — the first scalar field,
 * stringified compactly. Logged shapes vary per calculator, so we stay generic
 * rather than special-casing each. */
const primaryResult = (results: unknown): string => {
  if (results === null || results === undefined) return "—";
  if (typeof results === "number" || typeof results === "string")
    return String(results);
  if (typeof results === "object") {
    const entries = Object.entries(results as Record<string, unknown>);
    const scalar = entries.find(
      ([, v]) => typeof v === "number" || typeof v === "string",
    );
    if (scalar) return `${scalar[0]}: ${String(scalar[1])}`;
    if (entries.length > 0) return entries[0][0];
  }
  return "—";
};

/** Read-only table of the 100 newest saved calculations with a total count. */
export const CalculationsTable = async () => {
  const data = await getAdminCalculations();

  if (!data) {
    return <p className="text-sm text-ink-400">Database not configured.</p>;
  }

  return (
    <div>
      <p className="text-sm text-ink-400">
        Showing {data.rows.length} of {data.total.toLocaleString("en-US")} saved
        calculations · newest first
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Calculator</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Primary result</TableHead>
            <TableHead>Saved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium text-ink-100">
                {calcName(c.calculatorType)}
              </TableCell>
              <TableCell>{c.email ?? "Anonymous"}</TableCell>
              <TableCell className="font-mono text-xs">
                {primaryResult(c.results)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-ink-300">
                {fmtDate(c.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
