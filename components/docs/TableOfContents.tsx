"use client";

import { useEffect, useState } from "react";

import { useT } from "@/lib/i18n";
import type { TocItem } from "@/lib/docs";
import { cn } from "@/lib/utils";

export const TableOfContents = ({ items }: { items: TocItem[] }) => {
  const t = useT();
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 1 },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={t("docs.onThisPage")}>
      <p className="text-xs font-semibold tracking-wider text-ink-400 uppercase">
        {t("docs.onThisPage")}
      </p>
      <ul className="mt-3 space-y-2 border-l border-ink-600">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l py-1 pl-4 text-sm transition-colors",
                item.depth === 3 && "pl-7",
                activeId === item.id
                  ? "border-accent text-ink-100"
                  : "border-transparent text-ink-400 hover:border-ink-400 hover:text-ink-100",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
