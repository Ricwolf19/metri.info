import Link from "next/link";
import { defineListConfig } from "listkit/server";

import { ArrowRightIcon, CalculatorIcon } from "@/components/icons";
import { CALC_CONTENT } from "@/lib/calculators/content";
import { CALCULATORS } from "@/lib/calculators/registry";
import { buildSearch } from "@/lib/calculators/share";
import type { CalcId, CalcValues } from "@/lib/calculators/types";
import { createT, intlLocale, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { calcOptions, primaryResult } from "@/lib/lists/calculations";
import { listMyCalculations } from "@/app/account/activity/actions";
import {
  formatListDate,
  metriListTheme,
  metriListTones,
} from "@/lib/lists/theme";

/** One saved calculation of the signed-in user. */
export type HistoryRow = {
  id: string;
  calculatorType: string;
  inputs: unknown;
  results: unknown;
  /** ISO-8601 UTC. */
  createdAt: string;
};

const isCalcId = (id: string): id is CalcId => id in CALCULATORS;

/** Link back to the calculator with the logged inputs prefilled. */
const calcLink = (calcId: CalcId, inputs: CalcValues, locale: Locale) => {
  const config = CALCULATORS[calcId];
  const values: CalcValues = {};
  for (const f of config.fields) values[f.name] = inputs[f.name] ?? f.default;
  return `${routePath(calcId, locale)}?${buildSearch(config, values, values, false)}`;
};

/**
 * The account's calculation history, localized. A factory because the labels
 * and the calculator names depend on the page's locale; both the server page
 * (first query) and the client list (later pages) call it with the same value.
 */
export const historyListConfig = (locale: Locale) => {
  const t = createT(locale);
  const intl = intlLocale(locale);
  return defineListConfig<HistoryRow>({
    // The id names the dataset; the account is passed as `cacheScope`.
    id: "account-history",
    pageSize: 12,
    colorTheme: metriListTheme,
    tones: metriListTones,
    search: true,
    searchPlaceholder: t("history.search"),
    getItemKey: (r) => r.id,
    defaultSort: { field: "createdAt", dir: "desc" },
    filtersTitle: t("history.filtersTitle"),
    filters: [
      {
        id: "what",
        filters: [
          {
            id: "calculator",
            field: "calculatorType",
            label: t("history.filterCalculator"),
            type: "multi-select",
            options: calcOptions(locale),
            quick: true,
          },
          {
            id: "saved",
            field: "createdAt",
            label: t("history.filterDate"),
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
          header: t("history.colCalculator"),
          sortable: true,
          grow: true,
          render: (r) => {
            const name = isCalcId(r.calculatorType)
              ? CALC_CONTENT[r.calculatorType][locale].h1
              : r.calculatorType;
            if (!isCalcId(r.calculatorType))
              return <span className="font-medium text-ink-100">{name}</span>;
            return (
              <Link
                href={calcLink(
                  r.calculatorType,
                  (r.inputs ?? {}) as CalcValues,
                  locale,
                )}
                className="group inline-flex items-center gap-1.5 font-medium text-ink-100 hover:text-brand"
              >
                {name}
                <ArrowRightIcon
                  size={14}
                  className="text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </Link>
            );
          },
          exportValue: (r) =>
            isCalcId(r.calculatorType)
              ? CALC_CONTENT[r.calculatorType][locale].h1
              : r.calculatorType,
        },
        {
          key: "results",
          header: t("history.colResult"),
          width: "11rem",
          render: (r) => (
            <span className="font-mono text-sm font-bold text-accent">
              {primaryResult(r.results)}
            </span>
          ),
          exportValue: (r) => primaryResult(r.results),
        },
        {
          key: "createdAt",
          header: t("history.colSaved"),
          sortable: true,
          width: "12rem",
          render: (r) => (
            <span className="whitespace-nowrap text-ink-300">
              {formatListDate(r.createdAt, intl)}
            </span>
          ),
          exportValue: (r) => r.createdAt,
        },
      ],
    },
    export: {
      fileName: "metri-history",
      fetchAll: async (q) =>
        (await listMyCalculations({ ...q, page: 1, pageSize: 5000 })).data,
    },
    empty: {
      title: t("history.emptyTitle"),
      message: t("history.emptyHint"),
      icon: <CalculatorIcon size={36} />,
    },
  });
};
