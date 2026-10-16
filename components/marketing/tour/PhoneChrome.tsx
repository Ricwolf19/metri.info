"use client";

import { BookIcon, GearIcon } from "@/components/icons";
import { MetriMark } from "@/components/layout/MetriMark";
import { TOUR_STEPS, type TourStepId } from "@/lib/app-tour";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SIGNAL_BARS = [3, 5, 7, 9];

/**
 * The parts of the mobile UI every mocked screen shares, laid out like the
 * Android app itself: status bar; the text-free `TopBar` (sync-ring avatar on
 * the left, round chips on the right); the screen title in the content, as
 * `ScreenTitle` does; and the floating pill tab bar — detached from the edges,
 * active icon in a lime pill, 9 px title-case label — from `(tabs)/_layout`.
 * The app forces dark, so the mockups don't follow anything else.
 */
export const PhoneChrome = ({
  tab,
  title,
  children,
}: {
  tab: TourStepId;
  title: string;
  children: React.ReactNode;
}) => {
  const t = useT();
  return (
    <div className="relative flex h-full flex-col bg-ink-900 text-[11px] leading-tight text-ink-50 select-none">
      <div className="flex items-center justify-between px-5 pt-3 font-mono text-[10px] text-ink-200">
        <span>9:41</span>
        <span className="flex items-center gap-1.5" aria-hidden>
          <span className="flex items-end gap-px">
            {SIGNAL_BARS.map((h) => (
              <span
                key={h}
                className="w-[3px] rounded-[1px] bg-ink-200"
                style={{ height: h }}
              />
            ))}
          </span>
          <span className="flex h-[9px] w-4 items-center rounded-[2px] border border-ink-300 p-px">
            <span className="h-full w-full rounded-[1px] bg-brand" />
          </span>
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between px-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-700 text-[10px] font-semibold text-ink-50 ring-2 ring-brand ring-offset-2 ring-offset-ink-900">
          R
        </span>
        <span className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-800 text-brand">
            <BookIcon size={13} />
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-800 text-ink-300">
            <GearIcon size={13} />
          </span>
        </span>
      </div>

      <div className="relative mt-3 min-h-0 flex-1 overflow-hidden px-3 pb-16">
        <h3 className="mb-2.5 text-base font-bold tracking-tight text-ink-50">
          {title}
        </h3>
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900 via-ink-900/85 to-transparent"
        />
      </div>

      <div className="absolute inset-x-3 bottom-2.5 flex items-center rounded-full border border-ink-700/60 bg-ink-850/95 px-1.5 py-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.45)]">
        {TOUR_STEPS.map(({ id, icon: Icon, tabKey }) => {
          const active = id === tab;
          return (
            <span
              key={id}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-px",
                active ? "text-brand" : "text-ink-400",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-10 items-center justify-center rounded-full",
                  active && "bg-brand/15",
                )}
              >
                {id === "metrics" ? (
                  <MetriMark className="h-4 w-4 text-current" />
                ) : (
                  <Icon size={13} />
                )}
              </span>
              <span className="w-full truncate text-center text-[7.5px] font-medium">
                {t(tabKey)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** A card inside a mocked screen. */
export const MockCard = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "rounded-xl border border-ink-600/70 bg-ink-800 p-3",
      className,
    )}
  >
    {children}
  </div>
);

export const MockLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-[9px] tracking-widest text-ink-400 uppercase">
    {children}
  </p>
);
