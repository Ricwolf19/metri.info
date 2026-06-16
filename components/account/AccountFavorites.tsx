import Link from "next/link";

import { CALC_ICONS } from "@/components/calculators/calcIcons";
import { ArrowRightIcon } from "@/components/icons";
import { UnpinButton } from "@/components/account/UnpinButton";
import { eq } from "drizzle-orm";

import { CALC_CONTENT } from "@/lib/calculators/content";
import type { CalcId } from "@/lib/calculators/types";
import { db } from "@/lib/db";
import { favorite } from "@/lib/db/schema";
import { getAllDocs } from "@/lib/docs";
import { createT, type Locale } from "@/lib/i18n/config";
import { CALC_IDS, routePath } from "@/lib/i18n/routes";

const isCalcId = (id: string): id is CalcId =>
  (CALC_IDS as readonly string[]).includes(id);

/**
 * Server-rendered favorites for the signed-in user — pinned calculators and
 * docs as compact cards, each with an unpin control.
 */
export const AccountFavorites = async ({
  userId,
  locale,
}: {
  userId: string;
  locale: Locale;
}) => {
  const t = createT(locale);

  let rows: { itemType: string; itemId: string }[] = [];
  try {
    rows = await db
      .select({ itemType: favorite.itemType, itemId: favorite.itemId })
      .from(favorite)
      .where(eq(favorite.userId, userId))
      .orderBy(favorite.createdAt);
  } catch {
    rows = [];
  }

  const calcIds = rows
    .filter((r) => r.itemType === "calculator" && isCalcId(r.itemId))
    .map((r) => r.itemId as CalcId);
  const docSlugs = rows
    .filter((r) => r.itemType === "doc")
    .map((r) => r.itemId);

  if (calcIds.length === 0 && docSlugs.length === 0) {
    return (
      <p className="text-sm text-ink-400">{t("account.favoritesEmpty")}</p>
    );
  }

  const docs = getAllDocs(locale);
  const docsBase = routePath("docs", locale);
  const pinnedDocs = docSlugs
    .map((slug) => docs.find((d) => d.slug === slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <div className="space-y-8">
      {calcIds.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold tracking-wide text-ink-400 uppercase">
            {t("account.favoriteCalculators")}
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {calcIds.map((id) => {
              const Icon = CALC_ICONS[id];
              const c = CALC_CONTENT[id][locale];
              return (
                <div key={id} className="flex items-stretch gap-2">
                  <Link
                    href={routePath(id, locale)}
                    className="flex flex-1 items-start gap-3 rounded-card border border-ink-600 bg-ink-800 p-4 transition-colors hover:border-ink-500"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-700 text-accent">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink-50">
                        {c.h1}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-400">
                        {t("account.openCalculator")}
                      </span>
                    </span>
                  </Link>
                  <UnpinButton itemType="calculator" itemId={id} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {pinnedDocs.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold tracking-wide text-ink-400 uppercase">
            {t("account.favoriteDocs")}
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pinnedDocs.map((doc) => (
              <div key={doc.slug} className="flex items-stretch gap-2">
                <Link
                  href={`${docsBase}/${doc.slug}`}
                  className="flex flex-1 flex-col rounded-card border border-ink-600 bg-ink-800 p-4 transition-colors hover:border-ink-500"
                >
                  <span className="text-sm font-semibold text-ink-50">
                    {doc.title}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent">
                    {t("common.readMore")}
                    <ArrowRightIcon size={13} />
                  </span>
                </Link>
                <UnpinButton itemType="doc" itemId={doc.slug} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
