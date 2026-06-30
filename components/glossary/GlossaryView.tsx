"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { SearchIcon } from "@/components/icons";
import { GLOSSARY, localize } from "@/lib/glossary/data";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { textMatches } from "@/lib/search";

/**
 * Data-driven glossary. Each term is an anchor (`#id`) so a highlighted <Term>
 * elsewhere can link straight to it; arriving via the hash flashes the entry
 * (pure CSS `:target`, see globals.css). Terms cross-link to the guides that
 * cover them. Searchable by term or definition.
 */
export const GlossaryView = ({
  docTitles,
}: {
  docTitles: Record<string, string>;
}) => {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const docsBase = routePath("docs", locale);

  // Scroll to + neon-flash the targeted term. Done in JS (not CSS `:target`)
  // because App Router client navigations don't reliably update `:target` or
  // scroll to the hash; this also re-fires when you click the same term again.
  useEffect(() => {
    const flashTarget = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      requestAnimationFrame(() => {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.classList.remove("glossary-flash");
        void el.offsetWidth; // force reflow so the animation can restart
        el.classList.add("glossary-flash");
      });
    };
    flashTarget();
    window.addEventListener("hashchange", flashTarget);
    return () => window.removeEventListener("hashchange", flashTarget);
  }, []);

  const filtered = useMemo(
    () =>
      GLOSSARY.filter((entry) =>
        textMatches(
          query,
          localize(entry.term, locale),
          localize(entry.def, locale),
        ),
      ),
    [query, locale],
  );

  return (
    <div>
      <div className="relative mx-auto max-w-md">
        <SearchIcon
          size={18}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-400"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("glossary.search")}
          aria-label={t("glossary.search")}
          className="h-11 w-full rounded-field border border-ink-600 bg-ink-900 pr-4 pl-11 text-sm text-ink-50 placeholder:text-ink-400 focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-ink-400">{t("glossary.empty")}</p>
      ) : (
        <dl className="mt-8 space-y-3">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              id={entry.id}
              data-glossary-term
              className="scroll-mt-24 rounded-card border border-ink-600 bg-ink-850 p-5"
            >
              <dt className="text-base font-semibold text-ink-50">
                {localize(entry.term, locale)}
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-300">
                {localize(entry.def, locale)}
              </dd>
              {entry.related && entry.related.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] tracking-widest text-ink-500 uppercase">
                    {t("glossary.relatedLabel")}
                  </span>
                  {entry.related
                    .filter((slug) => docTitles[slug])
                    .map((slug) => (
                      <Link
                        key={slug}
                        href={`${docsBase}/${slug}`}
                        className="rounded-full border border-ink-600 bg-ink-800 px-2.5 py-1 text-xs text-ink-300 transition-colors hover:border-brand/40 hover:text-brand"
                      >
                        {docTitles[slug]}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
