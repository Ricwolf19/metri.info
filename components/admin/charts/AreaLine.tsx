export type AreaPoint = { date: string; value: number };

const ACCENT = "#84cc16";
const W = 600;
const H = 140;
const PAD = 4;

/** SVG area/line chart for a daily timeseries. Pure server-renderable SVG (no
 * client lib). Width is responsive via a viewBox; height is fixed. */
export const AreaLine = ({
  points,
  color = ACCENT,
  title,
}: {
  points: AreaPoint[];
  color?: string;
  title: string;
}) => {
  if (points.length === 0) {
    return <p className="text-sm text-ink-400">No data yet</p>;
  }

  const max = Math.max(...points.map((p) => p.value), 1);
  const n = points.length;
  const x = (i: number) => PAD + (i / Math.max(n - 1, 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);

  const line = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L ${x(n - 1).toFixed(1)} ${H - PAD} L ${x(0).toFixed(1)} ${H - PAD} Z`;
  const total = points.reduce((s, p) => s + p.value, 0);
  const gradId = `area-grad-${title.replace(/\W+/g, "")}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-36 w-full"
      role="img"
      aria-label={`${title}: ${total.toLocaleString("en-US")} total over the last ${n} days`}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
