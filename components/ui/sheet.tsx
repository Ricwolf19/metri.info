"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";

import { XIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Radix Dialog presented as an edge sheet — focus trap, scroll lock, Escape and
 * outside-click close for free. Themed with ink tokens. Enter/exit are CSS
 * keyframes keyed off `data-state` (see globals.css); Radix keeps the node
 * mounted until the exit animation ends.
 *
 * `side="top"` is the phone navigation drawer: full width, slides down from
 * under the header and caps at most of the viewport. Pair it with
 * `modal={false}` on `Sheet` and `backdrop` here when the page underneath must
 * not be touched (no scroll-lock padding, no `pointer-events: none` on body),
 * which is what stops the content from "jumping" when the menu opens.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;

const SIDE: Record<"left" | "right" | "top", string> = {
  right:
    "inset-y-0 right-0 h-full w-3/4 max-w-xs border-l data-[state=closed]:[animation:metri-sheet-out-right_0.22s_ease-in_forwards] data-[state=open]:[animation:metri-sheet-in-right_0.32s_cubic-bezier(0.22,1,0.36,1)]",
  left: "inset-y-0 left-0 h-full w-3/4 max-w-xs border-r data-[state=closed]:[animation:metri-sheet-out-left_0.22s_ease-in_forwards] data-[state=open]:[animation:metri-sheet-in-left_0.32s_cubic-bezier(0.22,1,0.36,1)]",
  top: "inset-x-0 top-0 max-h-[88dvh] w-full overflow-y-auto overscroll-contain rounded-b-[1.75rem] border-b data-[state=closed]:[animation:metri-sheet-out-top_0.22s_ease-in_forwards] data-[state=open]:[animation:metri-sheet-in-top_0.34s_cubic-bezier(0.22,1,0.36,1)]",
};

export const SheetContent = ({
  className,
  children,
  side = "right",
  backdrop = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: keyof typeof SIDE;
  /** Click-to-close scrim for a non-modal sheet (Radix only renders its own
   * overlay in modal mode). */
  backdrop?: boolean;
}) => {
  const t = useT();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm data-[state=closed]:[animation:metri-overlay-out_0.2s_ease-in_forwards] data-[state=open]:[animation:metri-overlay-in_0.2s_ease-out]" />
      {backdrop && (
        <DialogPrimitive.Close asChild>
          <div
            aria-hidden
            className="fixed inset-0 z-50 [animation:metri-overlay-in_0.2s_ease-out] touch-none bg-ink-950/70 backdrop-blur-sm"
          />
        </DialogPrimitive.Close>
      )}
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col gap-2 border-ink-600 bg-ink-900 p-6 shadow-2xl focus:outline-none",
          SIDE[side],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={t("nav.close")}
          className="absolute top-5 right-5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-50 focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none"
        >
          <XIcon size={18} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};
