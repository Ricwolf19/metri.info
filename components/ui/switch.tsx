"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

/** Radix Switch, ink-tokenized. 48×28 so it is a comfortable touch target. */
export const Switch = ({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) => (
  <SwitchPrimitive.Root
    className={cn(
      "inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-ink-600 bg-ink-700 p-0.5 transition-colors duration-200",
      "data-[state=checked]:border-brand/60 data-[state=checked]:bg-brand",
      "focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="block size-5 rounded-full bg-ink-50 shadow-sm transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-brand-contrast" />
  </SwitchPrimitive.Root>
);
