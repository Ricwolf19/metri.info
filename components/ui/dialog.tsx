"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";

import { XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Radix Dialog as a centered modal — focus trap, scroll lock, Escape and
 * outside-click close for free. Themed with ink tokens; entrance is the shared
 * `metri-pop-in` keyframe (see globals.css). The edge-anchored variant lives in
 * sheet.tsx.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    className={cn("text-lg font-semibold text-ink-50", className)}
    {...props}
  />
);

export const DialogDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn("text-sm text-ink-300", className)}
    {...props}
  />
);

export const DialogContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 [animation:metri-overlay-in_0.2s_ease-out] bg-ink-950/70 backdrop-blur-sm" />
    <DialogPrimitive.Content
      className={cn(
        "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 [animation:metri-pop-in_0.2s_cubic-bezier(0.22,1,0.36,1)] rounded-card border border-ink-600 bg-ink-900 p-6 shadow-2xl focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none"
      >
        <XIcon size={18} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);
