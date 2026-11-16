"use client";

import Link from "next/link";

import { BookIcon, CalculatorIcon, MedalIcon } from "@/components/icons";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { type RouteId, routePath } from "@/lib/i18n/routes";
import type { StepLink } from "@/lib/roadmap/steps";

/** Names of the routes a step can link, besides guides. */
const ROUTE_LABEL: Partial<Record<RouteId, TranslationKey>> = {
  tdee: "tools.bmr.title",
  deficit: "tools.deficit.title",
  macros: "tools.macros.title",
  protein: "tools.protein.title",
  bodyfat: "tools.bodyfat.title",
  quiz: "quiz.title",
};

/** A step's guides and calculators as chips. A guide missing from this
 * locale is left out rather than linked to a 404. */
export const StepLinks = ({
  links,
  docTitles,
}: {
  links: StepLink[];
  docTitles: Record<string, string>;
}) => {
  const { t, locale } = useI18n();
  const items = links.flatMap((l) => {
    if ("doc" in l) {
      const title = docTitles[l.doc];
      return title
        ? [
            {
              key: `doc:${l.doc}`,
              href: `${routePath("docs", locale)}/${l.doc}`,
              label: title,
              Icon: BookIcon,
            },
          ]
        : [];
    }
    const label = ROUTE_LABEL[l.route];
    return label
      ? [
          {
            key: `route:${l.route}`,
            href: routePath(l.route, locale),
            label: t(label),
            Icon: l.route === "quiz" ? MedalIcon : CalculatorIcon,
          },
        ]
      : [];
  });
  if (items.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map(({ key, href, label, Icon }) => (
        <li key={key} className="max-w-full">
          <Link
            href={href}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-ink-600 bg-ink-850 px-3 py-1 text-xs font-medium text-ink-200 transition-colors hover:border-brand/40 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
          >
            <Icon size={13} className="shrink-0 text-ink-400" />
            <span className="truncate">{label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
