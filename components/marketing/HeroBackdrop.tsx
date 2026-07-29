/**
 * The hero's decorative backdrop — a dashboard, because the product is metrics.
 *
 * Every piece is static SVG: it ships in the server HTML, costs no JS, and has
 * no lifecycle to break (see globals.css for the canvas this replaced). Colour
 * comes from `--rig` on the section via CSS classes, because `var()` is only
 * valid in declarations, never in SVG presentation attributes.
 *
 * Three widgets, each given real room: the trend owns the right half, the bar
 * series anchors the bottom-left, and the ring loader fills the top-left. Sizes
 * are percentage-based with `max-w` caps, so ultra-wide screens fill their
 * gutters instead of stranding everything at the edges, and every slot fades
 * toward the centre so nothing can collide with the copy at any width.
 *
 * Each viewBox carries its own padding so round caps and haloes never touch the
 * edge — an SVG clips at the viewBox, and `overflow: visible` won't save a
 * shape once the browser has scaled it to the slot.
 */

/**
 * The trend series. Deliberately not a clean diagonal — it dips twice. A
 * monotonic line reads as a stock graphic; real training data plateaus and
 * backs off, and that's the product's whole premise.
 *
 * The plot box is 480 × 420 rather than a flatter 480 × 300: at the sizes this
 * renders, a wide-and-shallow chart reads as a wedge sliding off the corner.
 * The taller ratio puts the peak up around the headline instead.
 */
const PLOT_W = 480;
const PLOT_H = 420;
const PLOT_PAD = 20;

const TREND = [
  [0, 350],
  [80, 300],
  [160, 320],
  [240, 222],
  [320, 240],
  [400, 136],
  [480, 82],
] as const;

const trendLine = TREND.map(([x, y]) => `${x},${y}`).join(" ");
const trendArea = `M${trendLine.split(" ").join(" L")} L${PLOT_W},${PLOT_H} L0,${PLOT_H} Z`;
const [lastX, lastY] = TREND[TREND.length - 1];

const Trend = () => (
  <svg
    viewBox={`${-PLOT_PAD} ${-PLOT_PAD} ${PLOT_W + PLOT_PAD * 2} ${PLOT_H + PLOT_PAD}`}
    fill="none"
    preserveAspectRatio="xMidYMax meet"
    className="h-full w-full"
  >
    <defs>
      <linearGradient id="metri-trend-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" className="hero-chart-stop-top" />
        <stop offset="100%" className="hero-chart-stop-bottom" />
      </linearGradient>
      {/* Wipes the whole series in left-to-right, so the fill, the line and the
          vertices plot together instead of fading in as a finished picture. */}
      <mask
        id="metri-trend-wipe"
        maskUnits="userSpaceOnUse"
        x={-PLOT_PAD}
        y={-PLOT_PAD}
        width={PLOT_W + PLOT_PAD * 2}
        height={PLOT_H + PLOT_PAD}
      >
        <rect
          className="hero-chart-wipe"
          x={-PLOT_PAD}
          y={-PLOT_PAD}
          width={PLOT_W + PLOT_PAD * 2}
          height={PLOT_H + PLOT_PAD}
          fill="#fff"
        />
      </mask>
    </defs>

    <g mask="url(#metri-trend-wipe)">
      <path d={trendArea} fill="url(#metri-trend-fill)" />
      <line
        x1={lastX}
        y1={lastY}
        x2={lastX}
        y2={PLOT_H}
        className="hero-chart-drop"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={trendLine}
        className="hero-chart-line"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {TREND.map(([x, y], i) => (
        <g key={x}>
          {/* Only the last point gets a halo — it's the current value, and the
              one the eye should land on. */}
          {i === TREND.length - 1 && (
            <circle cx={x} cy={y} r={14} className="hero-chart-halo" />
          )}
          <circle cx={x} cy={y} r={4.5} className="hero-chart-dot" />
        </g>
      ))}
    </g>
  </svg>
);

/**
 * A bar series — the logo read as what it already is, a bar chart, so the mark
 * and the data are the same idea rather than two things stuck together. Same
 * reasoning as the trend on the ratio: tall enough to have presence, not a
 * flat strip along the bottom edge.
 */
const BARS = [52, 82, 66, 104, 92, 130, 118, 158] as const;
const BAR_W = 26;
const BAR_GAP = 14;
const BASELINE = 170;

const Bars = () => (
  <svg
    viewBox="0 0 320 176"
    fill="none"
    preserveAspectRatio="xMinYMax meet"
    className="h-full w-full"
  >
    {BARS.map((h, i) => (
      <rect
        key={h}
        x={7 + i * (BAR_W + BAR_GAP)}
        y={BASELINE - h}
        width={BAR_W}
        height={h}
        rx={5}
        className={
          i === BARS.length - 1 ? "hero-bar hero-bar-current" : "hero-bar"
        }
        style={{ animationDelay: `${420 + i * 70}ms` }}
      />
    ))}
    <line
      x1={4}
      y1={BASELINE + 1}
      x2={316}
      y2={BASELINE + 1}
      className="hero-axis"
      strokeWidth={1.5}
    />
  </svg>
);

/**
 * Concentric ring loader — the app's sync ring, scaled up into a backdrop
 * widget. Arc lengths, speeds and directions are all different so the rings
 * never line back up; the whole thing reads as work in progress instead of a
 * decoration on a timer. Durations are slow on purpose — it's ambient, not a
 * spinner asking to be watched.
 */
const RINGS = [
  { r: 45, arc: 58, width: 3, duration: "11s", reverse: false, opacity: 1 },
  { r: 34, arc: 34, width: 3, duration: "8s", reverse: true, opacity: 0.75 },
  { r: 23, arc: 46, width: 2.5, duration: "6s", reverse: false, opacity: 0.55 },
  { r: 12, arc: 28, width: 2, duration: "4s", reverse: true, opacity: 0.4 },
] as const;

const RingLoader = () => (
  <svg viewBox="-2 -2 104 104" fill="none" className="h-full w-full">
    {RINGS.map(({ r, arc, width, duration, reverse, opacity }) => (
      <g key={r}>
        <circle
          cx={50}
          cy={50}
          r={r}
          className="hero-ring-track"
          strokeWidth={width}
        />
        <circle
          cx={50}
          cy={50}
          r={r}
          pathLength={100}
          strokeDasharray={`${arc} 100`}
          strokeLinecap="round"
          className="hero-ring"
          strokeWidth={width}
          opacity={opacity}
          style={{
            animationDuration: duration,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        />
      </g>
    ))}
  </svg>
);

export const HeroBackdrop = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0">
    {/* The plot area everything else sits on. */}
    <div className="hero-grid absolute inset-0" />

    {/* Ambient lime aura, top — fills the band above the copy. */}
    <div className="glow-brand absolute inset-x-0 top-[-6rem] h-[34rem] opacity-40" />

    {/* Right half: the headline series, and the biggest thing on the page after
        the headline itself. On mobile it becomes a full-width band under the
        copy, which is the only place there's room for it. */}
    <div className="hero-trend-slot absolute inset-x-0 bottom-0 h-[42%] opacity-55 sm:h-[46%] lg:inset-x-auto lg:right-0 lg:h-[70%] lg:w-[52%] lg:max-w-[64rem] lg:opacity-100">
      <Trend />
    </div>

    {/* Bottom-left: the bar series, the trend's counterweight. Lifted off the
        bottom edge so it reads as a chart standing on the grid, not as
        something the fold happened to cut. */}
    <div className="hero-bars-slot absolute bottom-[9%] left-0 hidden h-[28%] w-[32%] max-w-[32rem] lg:block">
      <Bars />
    </div>

    {/* Top-left: the emptiest corner, and the only widget that keeps moving.
        Kept high and small on mobile, where the badge sits right below it. */}
    <div
      className="hero-widget-in absolute top-[8%] left-[6%] size-20 sm:size-24 lg:top-[13%] lg:left-[7%] lg:size-44 xl:size-52 2xl:size-60"
      style={{ animationDelay: "420ms" }}
    >
      <RingLoader />
    </div>
  </div>
);
