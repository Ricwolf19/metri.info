import { daysBetween, type WeekAverage, type WeighIn } from "@/lib/body/weekly";
import { intlLocale, type Locale, type TFunction } from "@/lib/i18n/config";

const W = 600;
const H = 180;
const PAD_X = 8;
const PAD_Y = 14;

/**
 * Daily weigh-ins as faint points and the weekly average as the line, the
 * way the app's Metrics tab draws it: the week is the signal, the day is
 * noise. Pure SVG, server-rendered, scaled by its viewBox.
 */
export const WeightChart = ({
  weighIns,
  weeks,
  today,
  locale,
  t,
}: {
  weighIns: WeighIn[];
  weeks: WeekAverage[];
  today: string;
  locale: Locale;
  t: TFunction;
}) => {
  if (weighIns.length === 0)
    return <p className="text-sm text-ink-400">{t("body.noWeight")}</p>;

  const start = weeks[0]?.weekStart ?? weighIns[0].date;
  const span = Math.max(1, daysBetween(start, today));
  const values = [
    ...weighIns.map((w) => w.weightKg),
    ...weeks.flatMap((w) => (w.avgKg === null ? [] : [w.avgKg])),
  ];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const range = Math.max(1, hi - lo);
  const x = (date: string) =>
    PAD_X + (Math.max(0, daysBetween(start, date)) / span) * (W - PAD_X * 2);
  const xDay = (day: number) =>
    PAD_X + (Math.max(0, day) / span) * (W - PAD_X * 2);
  const y = (v: number) => H - PAD_Y - ((v - lo) / range) * (H - PAD_Y * 2);

  const line = weeks
    .filter((w) => w.avgKg !== null)
    .map((w, i) => {
      const day = Math.min(span, w.index * 7 + 3);
      return `${i === 0 ? "M" : "L"}${xDay(day).toFixed(1)},${y(w.avgKg as number).toFixed(1)}`;
    })
    .join(" ");

  const fmt = new Intl.DateTimeFormat(intlLocale(locale), {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const latest = weighIns[weighIns.length - 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-44 w-full"
        role="img"
        aria-label={`${t("body.sectionWeight")}: ${latest.weightKg} kg`}
      >
        {[lo, (lo + hi) / 2, hi].map((v) => (
          <g key={v}>
            <line
              x1={PAD_X}
              x2={W - PAD_X}
              y1={y(v)}
              y2={y(v)}
              stroke="rgb(var(--ink-700))"
              strokeDasharray="2 4"
            />
            <text
              x={W - PAD_X}
              y={y(v) - 3}
              textAnchor="end"
              fontSize={10}
              fill="rgb(var(--ink-500))"
              fontFamily="var(--font-mono)"
            >
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        {weighIns.map((w) => (
          <circle
            key={w.date}
            cx={x(w.date)}
            cy={y(w.weightKg)}
            r={2.5}
            fill="rgb(var(--ink-400))"
          />
        ))}
        {line && (
          <path
            d={line}
            fill="none"
            stroke="rgb(var(--brand))"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <p className="mt-1 flex justify-between font-mono text-[11px] text-ink-500">
        <span>{fmt.format(new Date(`${start}T00:00:00Z`))}</span>
        <span>{t("body.readings", { n: weighIns.length })}</span>
        <span>{fmt.format(new Date(`${today}T00:00:00Z`))}</span>
      </p>
    </div>
  );
};
