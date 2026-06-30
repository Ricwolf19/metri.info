"use client";

import { useState } from "react";

import { CheckIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/Section";
import {
  type ChangeType,
  MOBILE_ROADMAP,
  WEB_CHANGELOG,
  localize,
} from "@/lib/changelog/data";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

const TYPE_STYLE: Record<ChangeType, { key: TranslationKey; cls: string }> = {
  added: {
    key: "changelog.added",
    cls: "border-brand/30 bg-brand/10 text-brand",
  },
  improved: {
    key: "changelog.improved",
    cls: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  fixed: {
    key: "changelog.fixed",
    cls: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
};

const Tab = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-field px-4 py-2 font-mono text-xs tracking-wide uppercase transition-colors",
      active ? "bg-ink-800 text-ink-50" : "text-ink-400 hover:text-ink-100",
    )}
  >
    {children}
  </button>
);

export const ChangelogView = () => {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<"web" | "mobile">("web");

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow={t("nav.changelog")}
        title={t("changelog.title")}
        subtitle={t("changelog.subtitle")}
        align="left"
        className="mb-8"
      />

      <div className="inline-flex rounded-lg border border-ink-600 bg-ink-900 p-0.5">
        <Tab active={tab === "web"} onClick={() => setTab("web")}>
          {t("changelog.tabWeb")}
        </Tab>
        <Tab active={tab === "mobile"} onClick={() => setTab("mobile")}>
          {t("changelog.tabMobile")}
        </Tab>
      </div>

      {tab === "web" ? (
        <ol className="mt-10 space-y-10 border-l border-ink-600 pl-6">
          {WEB_CHANGELOG.map((entry) => (
            <li key={entry.version} className="relative">
              <span className="absolute top-1.5 -left-[1.84rem] h-3 w-3 rounded-full border-2 border-ink-900 bg-brand" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="rounded-full border border-ink-600 bg-ink-800 px-2.5 py-0.5 font-mono text-xs text-ink-100">
                  v{entry.version}
                </span>
                <time className="font-mono text-xs text-ink-400">
                  {new Date(entry.date).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span className="text-sm font-semibold text-ink-50">
                  {localize(entry.title, locale)}
                </span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {entry.changes.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase",
                        TYPE_STYLE[c.type].cls,
                      )}
                    >
                      {t(TYPE_STYLE[c.type].key)}
                    </span>
                    <span className="text-sm leading-relaxed text-ink-200">
                      {localize(c.text, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-10 max-w-2xl">
          <div className="relative overflow-hidden rounded-card border border-flame/30 bg-ink-850 p-6 sm:p-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-flame/30 bg-flame/10 px-3 py-1 font-mono text-xs font-medium text-flame">
              <span className="h-1.5 w-1.5 rounded-full bg-flame" />
              {t("changelog.inDevelopment")}
            </span>
            <p className="mt-4 text-ink-300">{t("changelog.mobileIntro")}</p>
            <p className="mt-6 font-mono text-xs tracking-widest text-ink-400 uppercase">
              {t("changelog.plannedTitle")}
            </p>
            <ul className="mt-3 space-y-3">
              {MOBILE_ROADMAP.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckIcon size={16} className="mt-0.5 shrink-0 text-brand" />
                  <span className="text-sm text-ink-200">
                    {localize(item, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Container>
  );
};
