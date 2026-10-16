import { cn } from "@/lib/utils";

/**
 * An Android phone bezel for app mockups and screenshots: thin frame, centred
 * punch-hole camera, side keys. Children fill the screen; the frame keeps a
 * 9:19.5 ratio so a real capture and a CSS mockup land in the same box.
 */
export const DeviceFrame = ({
  children,
  className,
  screenClassName,
}: {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
}) => (
  <div
    className={cn(
      "relative mx-auto aspect-[9/19.5] w-[17rem] rounded-[2.75rem] border border-ink-500/60 bg-ink-950 p-2 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] ring-1 ring-ink-50/5",
      className,
    )}
  >
    {/* Side keys: volume (left), power (right) */}
    <span
      aria-hidden
      className="absolute top-24 -left-[3px] h-14 w-[3px] rounded-l-sm bg-ink-500/70"
    />
    <span
      aria-hidden
      className="absolute top-28 -right-[3px] h-20 w-[3px] rounded-r-sm bg-ink-500/70"
    />
    {/* Punch-hole camera */}
    <span
      aria-hidden
      className="absolute top-[0.95rem] left-1/2 z-20 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-ink-950 ring-1 ring-ink-50/10"
    />
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[2.25rem] bg-ink-900 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]",
        screenClassName,
      )}
    >
      {children}
    </div>
  </div>
);
