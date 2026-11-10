import { MARK_PATHS, MARK_TRANSFORM, MARK_VIEWBOX } from "@/lib/brand/mark";
import { cn } from "@/lib/utils";

/** Metri dumbbell mark as inline SVG using `currentColor` — brand lime by
 * default, recolourable through `className` (e.g. `text-ink-950` on a lime fill). */
export const MetriMark = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    style={style}
    viewBox={MARK_VIEWBOX}
    fill="currentColor"
    aria-hidden="true"
    className={cn("text-brand", className)}
  >
    <g transform={MARK_TRANSFORM}>
      {MARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  </svg>
);
