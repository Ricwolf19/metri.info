"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils";

/**
 * Radix Dropdown Menu — keyboard nav, focus management and outside-click close
 * for free. Themed with ink tokens; entrance is the shared `metri-pop-in`
 * keyframe. Used for the header account menu.
 */
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = ({
  className,
  sideOffset = 8,
  align = "end",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      align={align}
      className={cn(
        "z-50 min-w-52 [animation:metri-pop-in_0.15s_ease-out] rounded-card border border-ink-600 bg-ink-850 p-1.5 shadow-2xl focus:outline-none",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

export const DropdownMenuItem = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-200 transition-colors outline-none select-none data-[highlighted]:bg-ink-800 data-[highlighted]:text-ink-50",
      className,
    )}
    {...props}
  />
);

export const DropdownMenuLabel = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={cn("px-3 py-2", className)} {...props} />
);

export const DropdownMenuSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator
    className={cn("my-1 h-px bg-ink-600", className)}
    {...props}
  />
);
