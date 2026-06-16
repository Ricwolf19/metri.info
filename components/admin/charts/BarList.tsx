const fmt = (n: number) => n.toLocaleString("en-US");

export type BarItem = { label: string; value: number; color?: string };

const ACCENT = "#84cc16";

/** Horizontal labelled bar list (e.g. top calculators, top pages). Tokenized
 * track, accessible via a labelled list. */
export const BarList = ({
  items,
  emptyLabel = "No data yet",
}: {
  items: BarItem[];
  emptyLabel?: string;
}) => {
  if (items.length === 0) {
    return <p className="text-sm text-ink-400">{emptyLabel}</p>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-ink-300">
            {it.label}
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-700">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(it.value / max) * 100}%`,
                background: it.color ?? ACCENT,
              }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-mono text-xs text-ink-100">
            {fmt(it.value)}
          </span>
        </li>
      ))}
    </ul>
  );
};
