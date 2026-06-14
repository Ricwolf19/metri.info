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
    <nav aria-label={t("docs.onThisPage")} className="text-sm">
      <p className="font-semibold text-ink-50">{t("docs.onThisPage")}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className={cn(item.depth === 3 && "pl-3")}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block transition-colors",
                activeId === item.id
                  ? "text-accent"
                  : "text-ink-400 hover:text-ink-100",
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
