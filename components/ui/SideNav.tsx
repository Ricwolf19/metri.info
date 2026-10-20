"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { IconProps } from "@/components/icons";
import { ScrollHint } from "@/components/ui/ScrollHint";
import { cn } from "@/lib/utils";

export type SideNavItem = {
  /** Stable id. In `anchor` mode it is also the target section's DOM id. */
  id: string;
  href: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<IconProps>;
  /** Route mode: match the pathname exactly instead of by prefix. */
  exact?: boolean;
};

export type SideNavGroup = { label?: string; items: SideNavItem[] };

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The id of the section currently nearest the top of the viewport. */
const useAnchorActive = (ids: string[], enabled: boolean) => {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }
        const next = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
        if (next) setActive(next[0]);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    for (const el of sections) io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ids.join("|")]);

  return active;
};

/**
 * The one side navigation. Desktop: a vertical rail with an active pill that
 * glides between items. Below `lg` (layout "auto"): a horizontally scrollable
 * row with the same pill. Shared by the admin shell, account settings and the
 * docs sidebar so every sidebar animates and reads the same way.
 *
 * `route` mode derives the active item from the pathname; `anchor` mode from
 * which target section is in view. The pill is positioned by measuring the
 * active link and writing the transform straight to the DOM, so it moves on
 * navigation and resize without a React state round-trip.
 */
export const SideNav = ({
  groups,
  mode = "route",
  layout = "auto",
  onNavigate,
  className,
  ariaLabel,
}: {
  groups: SideNavGroup[];
  mode?: "route" | "anchor";
  layout?: "auto" | "vertical";
  onNavigate?: () => void;
  className?: string;
  ariaLabel?: string;
}) => {
  const pathname = usePathname() ?? "/";
  const items = groups.flatMap((g) => g.items);
  const anchorActive = useAnchorActive(
    items.map((i) => i.id),
    mode === "anchor",
  );

  const activeId =
    mode === "anchor"
      ? (anchorActive ?? items[0]?.id ?? null)
      : (items.find((i) =>
          i.exact ? pathname === i.href : pathname.startsWith(i.href),
        )?.id ?? null);

  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;

    const place = () => {
      const link = activeId
        ? nav.querySelector<HTMLElement>(`[data-nav-id="${activeId}"]`)
        : null;
      if (!link) {
        pill.style.opacity = "0";
        return;
      }
      const n = nav.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      pill.style.opacity = "1";
      pill.style.width = `${r.width}px`;
      pill.style.height = `${r.height}px`;
      pill.style.transform = `translate(${r.left - n.left + nav.scrollLeft}px, ${r.top - n.top + nav.scrollTop}px)`;
    };

    place();
    const ro = new ResizeObserver(place);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [activeId]);

  const vertical = layout === "vertical";

  const nav = (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className={cn(
        "relative isolate flex gap-1",
        vertical
          ? "flex-col"
          : "overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0",
        className,
      )}
    >
      <span
        ref={pillRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 -z-10 rounded-lg bg-ink-700/80 opacity-0 transition-[transform,width,height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        <span
          className={cn(
            "absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-brand",
            vertical ? "block" : "hidden lg:block",
          )}
        />
      </span>

      {groups.map((group, gi) => (
        <div
          key={group.label ?? gi}
          className={cn(
            "flex gap-1",
            vertical ? "flex-col" : "shrink-0 lg:flex-col",
            gi > 0 && (vertical ? "mt-5" : "lg:mt-5"),
          )}
        >
          {group.label && (
            <p
              className={cn(
                "px-3 pb-1.5 font-mono text-[11px] font-medium tracking-widest text-ink-500 uppercase",
                vertical ? "block" : "hidden lg:block",
              )}
            >
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const active = item.id === activeId;
            const Icon = item.icon;
            const content = (
              <>
                {Icon && (
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0 transition-colors",
                      active ? "text-brand" : "text-ink-400",
                    )}
                  />
                )}
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {item.label}
                  </span>
                  {item.description && (
                    <span
                      className={cn(
                        "truncate text-xs text-ink-500",
                        vertical ? "block" : "hidden lg:block",
                      )}
                    >
                      {item.description}
                    </span>
                  )}
                </span>
              </>
            );
            const cls = cn(
              "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 whitespace-nowrap transition-colors",
              "focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none",
              active ? "text-ink-50" : "text-ink-300 hover:text-ink-50",
            );
            return mode === "anchor" ? (
              <a
                key={item.id}
                href={item.href}
                data-nav-id={item.id}
                aria-current={active ? "location" : undefined}
                onClick={onNavigate}
                className={cls}
              >
                {content}
              </a>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                data-nav-id={item.id}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cls}
              >
                {content}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  // Below `lg` the row scrolls sideways; the hints say so on a phone, where a
  // cut-off tab is the only clue otherwise.
  return vertical ? (
    nav
  ) : (
    <ScrollHint hintClassName="lg:hidden">{nav}</ScrollHint>
  );
};
