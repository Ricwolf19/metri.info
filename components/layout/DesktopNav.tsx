"use client";

import * as Nav from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { useRef, useState } from "react";

import { ArrowRightIcon, ChevronRightIcon } from "@/components/icons";
import {
  isCurrentLink,
  isCurrentSection,
  type MenuLink,
  type MenuSection,
} from "@/components/layout/site-nav";
import { cn } from "@/lib/utils";

const triggerClass = (active: boolean) =>
  cn(
    "group relative flex items-center gap-1.5 px-3 py-2 font-mono text-xs font-medium tracking-wider uppercase transition-colors outline-none",
    "focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-brand/55",
    active
      ? "text-ink-50"
      : "text-ink-400 hover:text-ink-100 data-[state=open]:text-ink-100",
  );

const Underline = ({ active }: { active: boolean }) => (
  <span
    aria-hidden
    className={cn(
      "absolute inset-x-3 -bottom-[5px] h-0.5 origin-left rounded-full bg-brand transition-transform duration-300",
      active ? "scale-x-100" : "scale-x-0",
    )}
  />
);

/** One row in an open panel: icon, name, and a line on what it is. */
const PanelLink = ({
  link,
  current,
  compact,
}: {
  link: MenuLink;
  current: boolean;
  compact: boolean;
}) => {
  const Icon = link.icon;
  const body = (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg transition-colors",
          compact ? "size-7" : "size-9",
          current
            ? "bg-brand/15 text-brand"
            : "bg-ink-800 text-ink-400 group-hover:text-brand",
        )}
      >
        <Icon size={compact ? 15 : 18} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-sm font-medium [overflow-wrap:anywhere]",
            current ? "text-ink-50" : "text-ink-200 group-hover:text-ink-50",
          )}
        >
          {link.label}
        </span>
        {link.description ? (
          <span className="mt-0.5 block text-xs leading-snug text-ink-400">
            {link.description}
          </span>
        ) : null}
      </span>
    </>
  );
  const className = cn(
    "group flex items-center gap-3 rounded-xl px-2.5 transition-colors outline-none hover:bg-ink-800 focus-visible:bg-ink-800 focus-visible:ring-2 focus-visible:ring-brand/55",
    compact ? "py-1.5" : "py-2.5",
  );
  return (
    <Nav.Link asChild active={current}>
      {link.external ? (
        <a
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className={className}
        >
          {body}
        </a>
      ) : (
        <Link
          href={link.href}
          aria-current={current ? "page" : undefined}
          className={className}
        >
          {body}
        </Link>
      )}
    </Nav.Link>
  );
};

/**
 * The site menu from `md` up: Tools, Learn and App open a panel on hover,
 * focus or click (Radix Navigation Menu: arrow keys, Escape, and a short
 * grace period so a diagonal move toward the panel doesn't close it); the
 * roadmap is a plain link. Panels open in one frame under the bar, so the
 * bar's layout never changes.
 */
export const DesktopNav = ({
  sections,
  pathname,
  label,
}: {
  sections: MenuSection[];
  pathname: string;
  label: string;
}) => {
  const [open, setOpen] = useState("");
  // When a panel opened. Hovering opens it, and the click that usually
  // follows would toggle it shut again; a mouse click within a second of
  // opening is taken as "yes, this one", not "close".
  const openedAt = useRef(0);
  const keepOnClick = (id: string) => (e: React.MouseEvent) => {
    if (
      e.detail > 0 &&
      open === id &&
      performance.now() - openedAt.current < 1000
    )
      e.preventDefault();
  };
  return (
    <Nav.Root
      aria-label={label}
      delayDuration={80}
      value={open}
      onValueChange={(next) => {
        if (next) openedAt.current = performance.now();
        setOpen(next);
      }}
      className="relative hidden justify-self-center md:block"
    >
      <Nav.List className="flex items-center gap-1">
        {sections.map((section) => {
          const active = isCurrentSection(pathname, section);
          if (section.href)
            return (
              <Nav.Item key={section.id}>
                <Nav.Link asChild active={active}>
                  <Link
                    href={section.href}
                    aria-current={active ? "page" : undefined}
                    className={triggerClass(active)}
                  >
                    {section.label}
                    <Underline active={active} />
                  </Link>
                </Nav.Link>
              </Nav.Item>
            );
          const wide = section.columns.length > 1;
          return (
            <Nav.Item key={section.id} value={section.id}>
              <Nav.Trigger
                className={triggerClass(active)}
                onClick={keepOnClick(section.id)}
              >
                {section.label}
                <ChevronRightIcon
                  size={12}
                  aria-hidden
                  className="rotate-90 transition-transform duration-200 group-data-[state=open]:-rotate-90"
                />
                <Underline active={active} />
              </Nav.Trigger>
              <Nav.Content className="absolute top-0 left-0">
                <div
                  className={cn(
                    "p-3",
                    wide ? "w-[min(46rem,calc(100vw-3rem))]" : "w-80",
                  )}
                >
                  <div
                    className={cn(
                      "grid gap-x-4 gap-y-3",
                      wide && "grid-cols-3",
                    )}
                  >
                    {section.columns.map((column, i) => (
                      <div
                        key={column.title ?? i}
                        className={cn(
                          "min-w-0",
                          // The recommended start: a tinted card whose rows
                          // keep their descriptions. Side and top margins
                          // cancel the padding, so titles stay aligned.
                          column.featured &&
                            "-mx-1.5 -mt-1.5 rounded-xl border border-brand/20 bg-brand/5 p-1.5",
                        )}
                      >
                        {column.title ? (
                          <p
                            className={cn(
                              "px-2.5 pt-1 pb-2 font-mono text-[11px] tracking-widest uppercase",
                              column.featured ? "text-brand" : "text-ink-500",
                            )}
                          >
                            {column.title}
                          </p>
                        ) : null}
                        <ul className="grid gap-0.5">
                          {column.links.map((link) => (
                            <li key={link.href}>
                              <PanelLink
                                link={link}
                                compact={wide && !column.featured}
                                current={
                                  !link.external &&
                                  isCurrentLink(pathname, link.href)
                                }
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {section.more ? (
                    <Nav.Link asChild>
                      <Link
                        href={section.more.href}
                        className="mt-3 flex items-center justify-between rounded-xl border-t border-ink-700 px-2.5 pt-3 pb-1 text-sm font-semibold text-brand outline-none hover:text-brand/80 focus-visible:ring-2 focus-visible:ring-brand/55"
                      >
                        {section.more.label}
                        <ArrowRightIcon size={15} />
                      </Link>
                    </Nav.Link>
                  ) : null}
                </div>
              </Nav.Content>
            </Nav.Item>
          );
        })}
      </Nav.List>
      {/* One panel frame for every section, centred under the whole bar (the
        bar is centred in the header), so even the wide Tools panel stays on
        screen at tablet widths. It takes the open content's size. */}
      <div className="absolute top-full left-1/2 z-50 -translate-x-1/2">
        <Nav.Viewport className="relative mt-2 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) origin-top overflow-hidden rounded-card border border-ink-600 bg-ink-850 shadow-2xl transition-[width,height] duration-200 data-[state=open]:animate-[metri-pop-in_0.14s_ease-out]" />
      </div>
    </Nav.Root>
  );
};
