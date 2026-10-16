"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

/**
 * Radix Slider, ink-tokenized. A 10px track and a 24px thumb with a 48px tall
 * hit area — the native range input it replaces was ~16px and hard to grab on
 * touch. Keyboard arrows step by `step`, Page Up/Down by 10× it.
 */
export const Slider = ({
  className,
  thumbLabel,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Accessible name for the thumb. */
  thumbLabel: string;
}) => (
  <SliderPrimitive.Root
    className={cn(
      "relative flex w-full touch-none items-center py-3 select-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-ink-700">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-brand" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      aria-label={thumbLabel}
      className={cn(
        "block size-6 cursor-grab rounded-full border-[3px] border-brand bg-ink-50 shadow-[0_2px_10px_rgba(0,0,0,0.4)]",
        "transition-[transform,box-shadow] duration-150 hover:scale-110 active:scale-110 active:cursor-grabbing",
        "focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:outline-none",
      )}
    />
  </SliderPrimitive.Root>
);
