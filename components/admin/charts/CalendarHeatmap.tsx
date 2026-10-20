import { ScrollHint } from "@/components/ui/ScrollHint";
import type { DayCount } from "@/lib/analytics/posthog";

const CELL = 13;
const GAP = 3;
const LEFT = 28;
const TOP = 18;
const ACCENT = "#84cc16";

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** ISO weekday 0 = Monday … 6 = Sunday, from a `YYYY-MM-DD` UTC date. */
const weekday = (date: string) =>
  (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;

/**
 * A contribution-style calendar: one square per day, columns are weeks,
 * the intensity is the day's count against the period's peak (four steps,
 * so a quiet site still shows texture). Server-rendered SVG; on a phone the
 * grid scrolls sideways under `ScrollHint`.
 */
export const CalendarHeatmap = ({
  days,
  title,
  color = ACCENT,
}: {
  days: DayCount[];
  title: string;
  color?: string;
}) => {
  if (days.length === 0)
    return <p className="text-sm text-ink-400">No data yet</p>;
  const max = Math.max(1, ...days.map((d) => d.count));
  const firstOffset = weekday(days[0].date);
  const columns = Math.ceil((firstOffset + days.length) / 7);
  const width = LEFT + columns * (CELL + GAP);
  const height = TOP + 7 * (CELL + GAP);
  const total = days.reduce((s, d) => s + d.count, 0);

  const monthMarks: { x: number; label: string }[] = [];
  let lastMonth = -1;
  days.forEach((d, i) => {
    const month = Number(d.date.slice(5, 7)) - 1;
    const col = Math.floor((firstOffset + i) / 7);
    if (month !== lastMonth) {
      if (lastMonth !== -1 || i === 0)
        monthMarks.push({ x: LEFT + col * (CELL + GAP), label: MONTHS[month] });
      lastMonth = month;
    }
  });

  return (
    <ScrollHint fade="from-ink-800">
      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
          role="img"
          aria-label={`${title}: ${total.toLocaleString("en-US")} over ${days.length} days`}
        >
          <title>{title}</title>
          {monthMarks.map((m) => (
            <text
              key={`${m.label}-${m.x}`}
              x={m.x}
              y={11}
              fontSize={10}
              fill="rgb(var(--ink-500))"
              fontFamily="var(--font-mono)"
            >
              {m.label}
            </text>
          ))}
          {DAY_LABELS.map((label, row) =>
            label ? (
              <text
                key={label}
                x={0}
                y={TOP + row * (CELL + GAP) + CELL - 3}
                fontSize={10}
                fill="rgb(var(--ink-500))"
                fontFamily="var(--font-mono)"
              >
                {label}
              </text>
            ) : null,
          )}
          {days.map((d, i) => {
            const col = Math.floor((firstOffset + i) / 7);
            const row = (firstOffset + i) % 7;
            const level =
              d.count === 0 ? 0 : Math.max(1, Math.ceil((d.count / max) * 4));
            return (
              <rect
                key={d.date}
                x={LEFT + col * (CELL + GAP)}
                y={TOP + row * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2.5}
                fill={level === 0 ? "rgb(var(--ink-700))" : color}
                fillOpacity={level === 0 ? 1 : 0.25 + level * 0.1875}
              >
                <title>{`${d.date}: ${d.count.toLocaleString("en-US")}`}</title>
              </rect>
            );
          })}
        </svg>
      </div>
    </ScrollHint>
  );
};
