"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import type { DocCategory, DocMeta } from "@/lib/docs";
import { cn } from "@/lib/utils";

type CategoryInfo = { category: DocCategory; labelKey: TranslationKey };

export const DocsSidebar = ({
  docs,
  categories,
  basePath,
}: {
  docs: DocMeta[];
  categories: CategoryInfo[];
  basePath: string;
}) => {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav className="space-y-7">
      {categories.map(({ category, labelKey }) => {
        const items = docs.filter((d) => d.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category}>
            <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
              {t(labelKey)}
            </p>
            <ul className="mt-3 space-y-1 border-l border-ink-600">
              {items.map((doc) => {
                const href = `${basePath}/${doc.slug}`;
                const active = pathname === href;
                return (
                  <li key={doc.slug}>
                    <Link
                      href={href}
                      className={cn(
                        "-ml-px block border-l py-1.5 pl-4 text-sm transition-colors",
                        active
                          ? "border-accent font-medium text-accent"
                          : "border-transparent text-ink-300 hover:border-ink-400 hover:text-ink-50",
                      )}
                    >
                      {doc.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
};
