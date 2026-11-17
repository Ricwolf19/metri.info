"use client";

import Link from "next/link";

import { ArrowRightIcon, ChevronRightIcon } from "@/components/icons";
import {
  isCurrentLink,
  isCurrentSection,
  type MenuLink,
  type MenuSection,
} from "@/components/layout/site-nav";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const rowClass = (active: boolean) =>
  cn(
    "group flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors",
    active
      ? "bg-ink-800 text-ink-50"
      : "text-ink-200 hover:bg-ink-800/60 hover:text-ink-50",
  );

const SectionIcon = ({
  section,
  active,
}: {
  section: MenuSection;
  active: boolean;
}) => {
  const Icon = section.icon;
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-brand/15 text-brand"
          : "bg-ink-800 text-ink-400 group-hover:text-ink-200",
      )}
    >
      <Icon size={18} />
    </span>
  );
};

const SubLink = ({ link, current }: { link: MenuLink; current: boolean }) => {
  const Icon = link.icon;
  const className = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
    current
      ? "bg-ink-800 font-medium text-ink-50"
      : "text-ink-300 hover:bg-ink-800/60 hover:text-ink-50",
  );
  const body = (
    <>
      <Icon
        size={16}
        className={cn("shrink-0", current ? "text-brand" : "text-ink-500")}
      />
      <span className="min-w-0 [overflow-wrap:anywhere]">{link.label}</span>
    </>
  );
  return (
    <SheetClose asChild>
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
    </SheetClose>
  );
};

/**
 * The site menu in the phone drawer: the same sections as the desktop bar,
 * each group a native disclosure (`<details>`: keyboard and screen reader
 * support for free), open from the start on the section you're in. The
 * roadmap is a direct row.
 */
export const MobileNav = ({
  sections,
  pathname,
  label,
}: {
  sections: MenuSection[];
  pathname: string;
  label: string;
}) => (
  <nav className="mt-2 grid gap-1" aria-label={label}>
    {sections.map((section) => {
      const active = isCurrentSection(pathname, section);
      if (section.href)
        return (
          <SheetClose asChild key={section.id}>
            <Link
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={rowClass(active)}
            >
              <SectionIcon section={section} active={active} />
              <span className="text-base font-semibold">{section.label}</span>
              <ChevronRightIcon
                size={16}
                className="ml-auto shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </SheetClose>
        );
      return (
        <details key={section.id} open={active} className="group/section">
          <summary
            className={cn(
              rowClass(active),
              "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
            )}
          >
            <SectionIcon section={section} active={active} />
            <span className="text-base font-semibold">{section.label}</span>
            <ChevronRightIcon
              size={16}
              className="ml-auto shrink-0 text-ink-500 transition-transform group-open/section:rotate-90"
            />
          </summary>
          <div className="mt-1 mb-2 ml-6 border-l border-ink-700 pl-3">
            {section.columns.map((column, i) => (
              <div key={column.title ?? i} className="mt-1 first:mt-0">
                {column.title ? (
                  <p
                    className={cn(
                      "px-3 pt-2 pb-1 font-mono text-[10px] tracking-widest uppercase",
                      column.featured ? "text-brand" : "text-ink-500",
                    )}
                  >
                    {column.title}
                  </p>
                ) : null}
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <SubLink
                        link={link}
                        current={
                          !link.external && isCurrentLink(pathname, link.href)
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {section.more ? (
              <SheetClose asChild>
                <Link
                  href={section.more.href}
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand hover:bg-ink-800/60"
                >
                  {section.more.label}
                  <ArrowRightIcon size={15} />
                </Link>
              </SheetClose>
            ) : null}
          </div>
        </details>
      );
    })}
  </nav>
);
