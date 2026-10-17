import { defineListConfig } from "listkit/server";

import { listAdminCalculations } from "@/app/admin/calculations/actions";

import { CalculatorIcon } from "@/components/icons";
import { CALC_CONTENT } from "@/lib/calculators/content";
import type { CalcId } from "@/lib/calculators/types";
import { CALC_IDS } from "@/lib/i18n/routes";
import {
  formatListDate,
  metriListTheme,
  metriListTones,
} from "@/lib/lists/theme";

const EXPORT_PAGE = 5000;

/** One row of the admin calculations list. */
export type AdminCalculationRow = {
  id: string;
  calculatorType: string;
  email: string | null;
  results: unknown;
  /** ISO-8601 UTC. */
  createdAt: string;
};

const calcName = (id: string, locale: "en" | "es" = "en") =>
  CALC_CONTENT[id as CalcId]?.[locale].h1 ?? id;

/** Best-effort primary value from a logged result blob: the first scalar
 * field, stringified compactly. Logged shapes vary per calculator. */
export const primaryResult = (results: unknown): string => {
  if (results === null || results === undefined) return "—";
  if (typeof results === "number" || typeof results === "string")
    return String(results);
  if (typeof results === "object") {
    const r = results as Record<string, unknown>;
    if (r.primaryValue !== undefined && r.primaryValue !== null) {
      return `${String(r.primaryValue)}${r.primaryUnit ? ` ${String(r.primaryUnit)}` : ""}`;
    }
    const scalar = Object.entries(r).find(
      ([, v]) => typeof v === "number" || typeof v === "string",
    );
    if (scalar) return `${scalar[0]}: ${String(scalar[1])}`;
  }
  return "—";
};

/** Calculator options for a filter, sorted by the localized name. */
export const calcOptions = (locale: "en" | "es" = "en") =>
  CALC_IDS.map((id) => ({ value: id, label: calcName(id, locale) })).sort(
    (a, b) => a.label.localeCompare(b.label),
  );

const CALC_OPTIONS = calcOptions("en");

/** Read-only list of every saved calculation, newest first. */
export const calculationsListConfig = defineListConfig<AdminCalculationRow>({
  id: "admin-calculations",
  pageSize: 25,
  colorTheme: metriListTheme,
  tones: metriListTones,
  search: true,
  searchPlaceholder: "Search by user email…",
  getItemKey: (c) => c.id,
  defaultSort: { field: "createdAt", dir: "desc" },
  filtersTitle: "Filter calculations",
  filters: [
    {
      id: "what",
      title: "Calculation",
      filters: [
        {
          id: "calculator",
          field: "calculatorType",
          label: "Calculator",
          type: "multi-select",
          options: CALC_OPTIONS,
          quick: true,
        },
        {
          id: "saved",
          field: "createdAt",
          label: "Saved",
          type: "date-range",
          quick: true,
        },
      ],
    },
  ],
  table: {
    columns: [
      {
        key: "calculatorType",
        header: "Calculator",
        sortable: true,
        grow: true,
        render: (c) => (
          <span className="font-medium text-ink-100">
            {calcName(c.calculatorType)}
          </span>
        ),
        exportValue: (c) => calcName(c.calculatorType),
      },
      {
        key: "email",
        header: "User",
        sortable: true,
        truncate: true,
        width: "16rem",
        render: (c) =>
          c.email ?? <span className="text-ink-500">Anonymous</span>,
        exportValue: (c) => c.email ?? "anonymous",
      },
      {
        key: "results",
        header: "Primary result",
        width: "12rem",
        render: (c) => (
          <span className="font-mono text-xs text-ink-200">
            {primaryResult(c.results)}
          </span>
        ),
        exportValue: (c) => primaryResult(c.results),
      },
      {
        key: "createdAt",
        header: "Saved",
        sortable: true,
        width: "12rem",
        render: (c) => (
          <span className="whitespace-nowrap text-ink-300">
            {formatListDate(c.createdAt)}
          </span>
        ),
        exportValue: (c) => c.createdAt,
      },
    ],
  },
  export: {
    fileName: "metri-calculations",
    fetchAll: async (q) =>
      (await listAdminCalculations({ ...q, page: 1, pageSize: EXPORT_PAGE }))
        .data,
  },
  empty: {
    title: "No calculations match",
    message: "Loosen the search or clear a filter.",
    icon: <CalculatorIcon size={36} />,
  },
});
