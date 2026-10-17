import { QUIZ_AREAS, QUIZ_MAX_LEVEL, type QuizArea } from "@/lib/quiz/areas";
import type { QuizScores } from "@/lib/quiz/scores";
import { cn } from "@/lib/utils";

const SIZE = 240;
const PAD = 28;
const R = SIZE / 2 - PAD;
const C = SIZE / 2;

const point = (i: number, radius: number) => {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / QUIZ_AREAS.length;
  return [C + radius * Math.cos(angle), C + radius * Math.sin(angle)] as const;
};

const ring = (level: number) =>
  QUIZ_AREAS.map((_, i) =>
    point(i, (R * level) / QUIZ_MAX_LEVEL).join(","),
  ).join(" ");

/**
 * The app's result radar, as plain SVG: four axes starting at twelve o'clock
 * and running clockwise in `QUIZ_AREAS` order, one ring per level, the value
 * polygon in brand lime. A zero still shows as a dot (4% radius) so the shape
 * never collapses. Renders the same on the server and the client.
 */
export const QuizRadar = ({
  scores,
  labels,
  className,
}: {
  scores: QuizScores;
  labels: Record<QuizArea, string>;
  className?: string;
}) => {
  const values = QUIZ_AREAS.map((area, i) =>
    point(i, R * Math.max(scores[area] / QUIZ_MAX_LEVEL, 0.04)).join(","),
  ).join(" ");
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={cn("h-auto w-full max-w-[17rem]", className)}
      role="img"
      aria-label={QUIZ_AREAS.map(
        (a) => `${labels[a]} ${scores[a]}/${QUIZ_MAX_LEVEL}`,
      ).join(", ")}
    >
      {[1, 2, 3, 4].map((level) => (
        <polygon
          key={level}
          points={ring(level)}
          fill="none"
          className="stroke-ink-600"
          strokeWidth={1}
        />
      ))}
      {QUIZ_AREAS.map((_, i) => {
        const [x, y] = point(i, R);
        return (
          <line
            key={i}
            x1={C}
            y1={C}
            x2={x}
            y2={y}
            className="stroke-ink-600"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={values}
        className="chart-anim fill-brand/25 stroke-brand"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {QUIZ_AREAS.map((area, i) => {
        const [x, y] = point(
          i,
          R * Math.max(scores[area] / QUIZ_MAX_LEVEL, 0.04),
        );
        return (
          <circle key={area} cx={x} cy={y} r={3.5} className="fill-brand" />
        );
      })}
      {QUIZ_AREAS.map((area, i) => {
        const [x, y] = point(i, R + 16);
        const anchor = i === 1 ? "start" : i === 3 ? "end" : "middle";
        return (
          <text
            key={area}
            x={x}
            y={y + (i === 0 ? -2 : i === 2 ? 10 : 4)}
            textAnchor={anchor}
            className="fill-ink-300 font-mono text-[10px] tracking-wide uppercase"
          >
            {labels[area]}
          </text>
        );
      })}
    </svg>
  );
};
