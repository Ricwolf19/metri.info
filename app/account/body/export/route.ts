import { getUserProfile } from "@/lib/account/settings";
import { getSession } from "@/lib/auth/session";
import { buildCsv } from "@/lib/exports/csv";
import { buildXlsx, type Cell, XLSX_TYPE } from "@/lib/exports/xlsx";
import { can } from "@/lib/entitlements";
import { getBodySnapshot } from "@/lib/sync/body";
import { exerciseLabel } from "@/lib/training/exercise-names";
import { MUSCLE_HEADS } from "@/lib/training/muscles";

const HISTORY_DAYS = 365;

/**
 * GET /account/body/export?format=csv|xlsx — the body data behind the page
 * for the signed-in account: a year of weigh-ins and body fat, every tape
 * reading, and the per-muscle load for the three windows. Session-scoped,
 * never cached, Premium only (the data is the sync mirror). CSV is one long
 * table (`date, type, site, value`); Excel gets a sheet per kind.
 */
export const GET = async (req: Request) => {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const plan = (session.user as { plan?: string | null }).plan;
  if (!can(plan, "sync")) return new Response("Forbidden", { status: 403 });

  const format = new URL(req.url).searchParams.get("format");
  if (format !== "csv" && format !== "xlsx")
    return new Response("format must be csv or xlsx", { status: 400 });

  const profile = await getUserProfile(session.user.id);
  const snap = await getBodySnapshot(
    session.user.id,
    profile?.sex,
    HISTORY_DAYS,
  );

  const fatByDate = new Map(snap.bodyFat.map((f) => [f.date, f.pct]));
  const weighedOn = new Set(snap.weighIns.map((w) => w.date));
  const weight: Cell[][] = snap.weighIns.map((w) => [
    w.date,
    w.weightKg,
    fatByDate.get(w.date) ?? null,
  ]);
  for (const f of snap.bodyFat)
    if (!weighedOn.has(f.date)) weight.push([f.date, null, f.pct]);
  weight.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  const tape: Cell[][] = snap.sites
    .flatMap((s) => s.series.map((r) => [r.date, s.site, r.cm] as Cell[]))
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  const muscles: Cell[][] = MUSCLE_HEADS.map((head) => {
    const per = (days: 7 | 30 | 90) =>
      snap.muscles[days].loads.balance.find((b) => b.head === head)?.sets ?? 0;
    const s = snap.muscles[90].loads.strength.find((x) => x.head === head);
    const top = (snap.muscles[90].topByHead[head] ?? [])
      .map((e) => exerciseLabel(e.id, "en", snap.customNames))
      .join(", ");
    return [
      head,
      per(7),
      per(30),
      per(90),
      s?.daysSince ?? null,
      s?.bestE1rmKg ?? null,
      top,
    ];
  });

  const stamp = snap.today || new Date().toISOString().slice(0, 10);
  const headers = (name: string, type: string) => ({
    "content-type": type,
    "content-disposition": `attachment; filename="${name}"`,
    "cache-control": "private, no-store",
  });

  if (format === "csv") {
    const rows: Cell[][] = [
      ...weight.flatMap(([date, kg, pct]) => [
        ...(kg === null ? [] : [[date, "weight_kg", "", kg] as Cell[]]),
        ...(pct === null ? [] : [[date, "body_fat_pct", "", pct] as Cell[]]),
      ]),
      ...tape.map(([date, site, cm]) => [date, "tape_cm", site, cm] as Cell[]),
    ];
    return new Response(buildCsv(["date", "type", "site", "value"], rows), {
      headers: headers(`metri-body-${stamp}.csv`, "text/csv; charset=utf-8"),
    });
  }

  const xlsx = buildXlsx([
    {
      name: "Weight",
      header: ["date", "weight_kg", "body_fat_pct"],
      rows: weight,
    },
    { name: "Tape", header: ["date", "site", "value_cm"], rows: tape },
    {
      name: "Muscles",
      header: [
        "muscle",
        "sets_per_week_7d",
        "sets_per_week_30d",
        "sets_per_week_90d",
        "days_since_trained",
        "best_e1rm_kg",
        "top_exercises_90d",
      ],
      rows: muscles,
    },
  ]);
  return new Response(new Uint8Array(xlsx), {
    headers: headers(`metri-body-${stamp}.xlsx`, XLSX_TYPE),
  });
};
