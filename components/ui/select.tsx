"use client";

import * as SelectPrimitive from "@radix-ui/react-select";

import { CheckIcon, ChevronRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Radix Select, themed with ink tokens — a drop-in for native `<select>`. */
export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger
    className={cn(
      "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-ink-600 bg-ink-900 px-4 text-sm text-ink-50 transition-colors",
      "data-[placeholder]:text-ink-400",
      "focus-visible:border-ink-400 focus-visible:ring-2 focus-visible:ring-ink-500/40 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronRightIcon size={16} className="rotate-90 text-ink-400" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);

export const SelectContent = ({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      position={position}
      className={cn(
        "relative z-50 max-h-72 min-w-[8rem] [animation:metri-pop-in_0.14s_ease-out] overflow-hidden rounded-xl border border-ink-600 bg-ink-800 text-ink-100 shadow-xl",
        position === "popper" &&
          "w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

export const SelectItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    className={cn(
      "relative flex w-full cursor-pointer items-center rounded-lg py-2 pr-2.5 pl-8 text-sm outline-none select-none",
      "focus:bg-ink-700 focus:text-ink-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon size={15} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);
