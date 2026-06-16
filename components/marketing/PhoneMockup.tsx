import type { ComponentType } from "react";

import {
  ActivityIcon,
  AppleIcon,
  DropletsIcon,
  DumbbellIcon,
  FlameIcon,
  type IconProps,
} from "@/components/icons";
import { MetriMark } from "@/components/layout/MetriMark";

const TILES: { label: string; Icon: ComponentType<IconProps> }[] = [
  { label: "1RM", Icon: DumbbellIcon },
  { label: "Macros", Icon: AppleIcon },
  { label: "FFMI", Icon: ActivityIcon },
  { label: "Water", Icon: DropletsIcon },
];

/**
 * CSS device frame showing a stylized app home screen — no screenshot asset
 * required. The accent (energy figure + progress) follows MetriMark: lime on
 * dark, near-black on light, so it stays legible in both themes.
 */
export const PhoneMockup = () => (
  <div className="relative mx-auto h-[540px] w-[270px] rounded-[2.75rem] border-[10px] border-ink-700 bg-ink-950 shadow-2xl shadow-ink-950/20 dark:shadow-lime-400/5">
    <div className="absolute top-3 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-ink-700" />
    <div className="flex h-full flex-col gap-4 overflow-hidden rounded-[1.9rem] bg-ink-900 p-5 pt-10">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-600 bg-ink-800">
          <MetriMark className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-medium tracking-wide text-ink-400">
            Metri
          </p>
          <p className="text-sm font-semibold text-ink-50">Hi, lifter</p>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-600 bg-gradient-to-br from-ink-800 to-ink-850 p-4">
        <p className="text-xs text-ink-400">Daily energy</p>
        <p className="mt-1 font-mono text-[1.7rem] leading-none font-bold text-ink-950 dark:text-lime-400">
          2,540 <span className="text-sm text-ink-400">kcal</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-700">
          <div className="h-full w-2/3 rounded-full bg-ink-950 dark:bg-lime-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TILES.map(({ label, Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-800 px-3 py-3.5"
          >
            <Icon size={15} className="text-ink-400" />
            <span className="text-xs font-medium text-ink-100">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-3 rounded-2xl border border-ink-600 bg-ink-800 p-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-flame/15 text-flame">
          <FlameIcon size={18} />
        </span>
        <div>
          <p className="text-xs font-semibold text-ink-50">PowerBuilding</p>
          <p className="text-[10px] text-ink-400">Week 3 · Push day</p>
        </div>
      </div>
    </div>
  </div>
);
