import Link from "next/link";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { CALCULATORS } from "@/lib/calculators/registry";
import { CALC_CONTENT } from "@/lib/calculators/content";
import { buildSearch } from "@/lib/calculators/share";
import type { CalcId, CalcValues } from "@/lib/calculators/types";
import { count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { calculationLog } from "@/lib/db/schema";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

const isCalcId = (id: string): id is CalcId => id in CALCULATORS;

type LoggedResult = {
  primaryLabelKey?: string;
  primaryValue?: string | number;
  primaryUnit?: string;
};

/** Build a link back to a calculator with its logged inputs prefilled. */
const calcLink = (calcId: CalcId, inputs: CalcValues, locale: Locale) => {
  const config = CALCULATORS[calcId];
  const values: CalcValues = {};
  for (const f of config.fields) {
    const v = inputs[f.name];
    values[f.name] = v ?? f.default;
  }
  const qs = buildSearch(config, values, values, false);
  return `${routePath(calcId, locale)}?${qs}`;
};

/**
 * Server-rendered calculation history for the signed-in user — compact rows,
 * newest first, paginated server-side via the `?historyPage=` search param.
 * Each row links back to its calculator with inputs prefilled and shows the
 * primary result plus a short timestamp. Scales to thousands of entries since
 * only one page is fetched at a time.
 */
export const AccountHistory = async ({
  userId,
  locale,
  page = 1,
}: {
  userId: string;
  locale: Locale;
  page?: number;
}) => {
  const t = createT(locale);

  let total = 0;
  try {
    const [c] = await db
      .select({ value: count() })
      .from(calculationLog)
      .where(eq(calculationLog.userId, userId));
    total = c?.value ?? 0;
  } catch {
    total = 0;
  }

  if (total === 0) {
    return <p className="text-sm text-ink-400">{t("account.historyEmpty")}</p>;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
  const offset = (current - 1) * PAGE_SIZE;

  let rows: {
    id: string;
    calculatorType: string;
    inputs: unknown;
    results: unknown;
    createdAt: Date;
  }[] = [];
  try {
    rows = await db
      .select({
        id: calculationLog.id,
        calculatorType: calculationLog.calculatorType,
        inputs: calculationLog.inputs,
        results: calculationLog.results,
        createdAt: calculationLog.createdAt,
      })
      .from(calculationLog)
      .where(eq(calculationLog.userId, userId))
      .orderBy(desc(calculationLog.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset);
  } catch {
    rows = [];
  }

  const dateFmt = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const pageHref = (p: number) => `?historyPage=${p}#history`;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-ink-400">
          {t("account.historyCount", { count: total })}
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-ink-400">
            {t("account.historyPageInfo", { page: current, total: totalPages })}
          </p>
        )}
      </div>

      <ul className="divide-y divide-ink-600/60 overflow-hidden rounded-card border border-ink-600 bg-ink-800">
        {rows.map((row) => {
          const valid = isCalcId(row.calculatorType);
          const name = valid
            ? CALC_CONTENT[row.calculatorType as CalcId][locale].h1
            : row.calculatorType;
          const result = (row.results ?? {}) as LoggedResult;
          const summary =
            result.primaryValue != null
              ? `${result.primaryValue}${
                  result.primaryUnit ? ` ${result.primaryUnit}` : ""
                }`
              : null;
          const href = valid
            ? calcLink(
                row.calculatorType as CalcId,
                (row.inputs ?? {}) as CalcValues,
                locale,
              )
            : null;

          const body = (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-ink-700/40">
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="truncate text-sm font-medium text-ink-50">
                  {name}
                </span>
                <span className="shrink-0 text-xs text-ink-400">
                  {dateFmt.format(row.createdAt)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                {summary && (
                  <span className="font-mono text-sm font-bold text-accent">
                    {summary}
                  </span>
                )}
                {href && <ArrowRightIcon size={14} className="text-ink-400" />}
              </div>
            </div>
          );

          return (
            <li key={row.id}>
              {href ? (
                <Link href={href} className="block">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-between gap-3">
          <PagerLink
            href={pageHref(current - 1)}
            disabled={current <= 1}
            direction="prev"
            label={t("account.historyPrev")}
          />
          <PagerLink
            href={pageHref(current + 1)}
            disabled={current >= totalPages}
            direction="next"
            label={t("account.historyNext")}
          />
        </nav>
      )}
    </div>
  );
};

const PagerLink = ({
  href,
  disabled,
  direction,
  label,
}: {
  href: string;
  disabled: boolean;
  direction: "prev" | "next";
  label: string;
}) => {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-700 hover:text-ink-50",
    disabled && "pointer-events-none opacity-40",
  );
  const icon =
    direction === "prev" ? (
      <ArrowLeftIcon size={14} />
    ) : (
      <ArrowRightIcon size={14} />
    );

  if (disabled) {
    return (
      <span className={cls} aria-disabled="true">
        {direction === "prev" && icon}
        {label}
        {direction === "next" && icon}
      </span>
    );
  }

  return (
    <Link href={href} className={cls}>
      {direction === "prev" && icon}
      {label}
      {direction === "next" && icon}
    </Link>
  );
};
