import Image from "next/image";

import { FlameIcon } from "@/components/icons";

/** Lightweight CSS device frame showing a stylized app home screen — no
 * screenshot asset required. Swap for real screenshots once the app ships. */
export const PhoneMockup = () => (
  <div className="relative mx-auto h-[520px] w-[260px] rounded-[2.5rem] border-[10px] border-ink-700 bg-ink-950 shadow-2xl shadow-lime-400/5">
    <div className="absolute top-2 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-ink-700" />
    <div className="flex h-full flex-col gap-4 overflow-hidden rounded-[1.8rem] bg-ink-900 p-5 pt-9">
      <div className="flex items-center gap-3">
        <Image
          src="/icon.svg"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7"
        />
        <div>
          <p className="text-xs text-ink-400">METRI</p>
          <p className="text-sm font-semibold text-ink-50">Hi, lifter</p>
        </div>
      </div>

      <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-4">
        <p className="text-xs text-ink-300">Daily energy</p>
        <p className="mt-1 font-mono text-2xl font-bold text-accent">
          2,540 <span className="text-sm text-ink-400">kcal</span>
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-700">
          <div className="h-full w-2/3 rounded-full bg-accent-fill" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {["1RM", "Macros", "FFMI", "Water"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-ink-600 bg-ink-800 px-3 py-4 text-center text-xs font-medium text-ink-200"
          >
            {label}
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
