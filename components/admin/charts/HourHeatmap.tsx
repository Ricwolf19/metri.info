import { ScrollHint } from "@/components/ui/ScrollHint";

const CELL = 16;
const GAP = 2;
const LEFT = 30;
const TOP = 16;
const ACCENT = "#84cc16";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Weekday × hour grid: when the site is actually used. Rows are days, columns
 * hours on `zone`'s clock, intensity against the busiest cell. Server-rendered
 * SVG that scrolls sideways on a phone under `ScrollHint`.
 */
export const HourHeatmap = ({
  cells,
  title,
  zone,
  color = ACCENT,
}: {
  /** `cells[weekday][hour]`, weekday 0 = Monday. */
  cells: number[][];
  title: string;
  /** Short name of the clock the hours are on, e.g. "Mexico City". */
  zone: string;
  color?: string;
}) => {
  const max = Math.max(1, ...cells.flat());
  const total = cells.flat().reduce((s, n) => s + n, 0);
  if (total === 0) return <p className="text-sm text-ink-400">No data yet</p>;
  const width = LEFT + 24 * (CELL + GAP);
  const height = TOP + 7 * (CELL + GAP);
  return (
    <ScrollHint fade="from-ink-800">
      {/* Focusable so a keyboard can scroll the hours past a phone's edge. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={title}
        className="overflow-x-auto rounded-md focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:outline-none"
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
          role="img"
          aria-label={`${title}: ${total.toLocaleString("en-US")} events by weekday and hour (${zone}), peak ${max.toLocaleString("en-US")} in an hour`}
        >
          <title>{title}</title>
          {Array.from({ length: 24 }, (_, h) =>
            h % 3 === 0 ? (
              <text
                key={h}
                x={LEFT + h * (CELL + GAP)}
                y={10}
                fontSize={10}
                fill="rgb(var(--ink-500))"
                fontFamily="var(--font-mono)"
              >
                {String(h).padStart(2, "0")}
              </text>
            ) : null,
          )}
          {DAYS.map((d, row) => (
            <text
              key={d}
              x={0}
              y={TOP + row * (CELL + GAP) + CELL - 4}
              fontSize={10}
              fill="rgb(var(--ink-500))"
              fontFamily="var(--font-mono)"
            >
              {d}
            </text>
          ))}
          {cells.map((row, r) =>
            row.map((n, h) => (
              <rect
                key={`${r}-${h}`}
                x={LEFT + h * (CELL + GAP)}
                y={TOP + r * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={3}
                fill={n === 0 ? "rgb(var(--ink-700))" : color}
                // Floor at 0.55: the quietest hour still reads 3:1 on the card.
                fillOpacity={n === 0 ? 1 : 0.55 + (n / max) * 0.45}
              >
                <title>{`${DAYS[r]} ${String(h).padStart(2, "0")}:00 ${zone}: ${n.toLocaleString("en-US")}`}</title>
              </rect>
            )),
          )}
        </svg>
      </div>
    </ScrollHint>
  );
};
