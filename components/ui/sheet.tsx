"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";

import { XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Radix Dialog presented as an edge sheet — focus trap, scroll lock, Escape and
 * outside-click close for free. Themed with ink tokens. Entrance is CSS-keyframe
 * driven (see globals.css); exit is instant (Radix unmounts on close).
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;

export const SheetContent = ({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "left" | "right";
}) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 [animation:metri-overlay-in_0.2s_ease-out] bg-ink-950/70 backdrop-blur-sm" />
    <DialogPrimitive.Content
      className={cn(
        "fixed inset-y-0 z-50 flex h-full w-3/4 max-w-xs flex-col gap-2 bg-ink-900 p-6 shadow-2xl focus:outline-none",
        side === "right"
          ? "right-0 [animation:metri-sheet-in-right_0.3s_cubic-bezier(0.22,1,0.36,1)] border-l border-ink-600"
          : "left-0 [animation:metri-sheet-in-right_0.3s_cubic-bezier(0.22,1,0.36,1)] border-r border-ink-600",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute top-5 right-5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none"
      >
        <XIcon size={18} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);
