import {
  heatColor,
  type HeatPoint,
  heatPalette,
  pointIntensity,
  type ReachBand,
} from "@/lib/analytics/heat";

/**
 * Canvas drawing for the heatmap preview, no library. A layer is built once
 * per data set in two passes: every point stamps a soft gaussian blob of
 * alpha (overlaps add up), then each pixel's alpha is looked up in the heat
 * palette. Frames only copy the slice under the current scroll, so scrolling
 * never repaints the heat.
 */

/** A palette token for the canvas, which can't take a class: the `:root`
 * channels (`--ink-50` → "245 245 247") as an rgb colour. */
export const tokenColor = (name: string, alpha = 1) =>
  `rgb(${getComputedStyle(document.documentElement).getPropertyValue(name).trim()} / ${alpha})`;

/** Blob radius in CSS px: about a fingertip. */
const HEAT_RADIUS = 28;

/** Long pages get a coarser layer instead of a canvas past browser limits
 * (Safari caps a canvas around 16 M pixels). */
const LAYER_PIXEL_BUDGET = 1_500_000;

export type HeatLayer = {
  canvas: HTMLCanvasElement;
  /** CSS px per layer pixel. */
  factor: number;
};

const stamps = new Map<number, HTMLCanvasElement>();

/** A radial alpha falloff, exp(-4.5 t²) ≈ a gaussian with σ = r / 3. */
const stamp = (radius: number): HTMLCanvasElement => {
  const cached = stamps.get(radius);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = radius * 2;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(
      radius,
      radius,
      0,
      radius,
      radius,
      radius,
    );
    // The last stop is fully clear: a radial gradient paints its last colour
    // into the square's corners, and even 1% alpha shows once colourized.
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      g.addColorStop(t, `rgba(0,0,0,${i === 8 ? 0 : Math.exp(-4.5 * t * t)})`);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, radius * 2, radius * 2);
  }
  stamps.set(radius, canvas);
  return canvas;
};

let palette: Uint8ClampedArray | null = null;

const colorize = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  if (w === 0 || h === 0) return;
  palette ??= heatPalette();
  const image = ctx.getImageData(0, 0, w, h);
  const d = image.data;
  for (let i = 3; i < d.length; i += 4) {
    const a = d[i];
    if (a === 0) continue;
    const o = a * 4;
    d[i - 3] = palette[o];
    d[i - 2] = palette[o + 1];
    d[i - 1] = palette[o + 2];
    d[i] = palette[o + 3];
  }
  ctx.putImageData(image, 0, 0);
};

/** Points (x as a 0..1 share of `width`, y in CSS px) on a `width × height`
 * surface. */
export const paintLayer = (
  points: readonly HeatPoint[],
  cap: number,
  width: number,
  height: number,
): HeatLayer => {
  const factor = Math.max(
    1,
    Math.ceil(Math.sqrt((width * height) / LAYER_PIXEL_BUDGET)),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(width / factor));
  canvas.height = Math.max(1, Math.ceil(height / factor));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { canvas, factor };
  const r = Math.max(4, Math.round(HEAT_RADIUS / factor));
  const blob = stamp(r);
  for (const p of points) {
    ctx.globalAlpha = pointIntensity(p.count, cap) * 0.7;
    ctx.drawImage(blob, (p.x * width) / factor - r, p.y / factor - r);
  }
  ctx.globalAlpha = 1;
  colorize(ctx, canvas.width, canvas.height);
  return { canvas, factor };
};

/** Free the pixels now instead of whenever the GC gets to them. */
export const releaseLayer = (layer: HeatLayer | null) => {
  if (!layer) return;
  layer.canvas.width = 0;
  layer.canvas.height = 0;
};

/** Copy the part of a document layer that covers `[top, top + height)`
 * (CSS px). The source rect is clipped to the layer: Safari draws nothing
 * for one that runs past the image. */
export const drawSlice = (
  ctx: CanvasRenderingContext2D,
  layer: HeatLayer,
  top: number,
  width: number,
  height: number,
) => {
  const sy = top / layer.factor;
  const sh = Math.min(height / layer.factor, layer.canvas.height - sy);
  if (sh <= 0) return;
  ctx.drawImage(
    layer.canvas,
    0,
    sy,
    layer.canvas.width,
    sh,
    0,
    0,
    width,
    sh * layer.factor,
  );
};

/** Scroll-depth bands as translucent heat, between `top` and `top + height`. */
export const drawBands = (
  ctx: CanvasRenderingContext2D,
  bands: readonly ReachBand[],
  top: number,
  width: number,
  height: number,
  alpha: number,
) => {
  for (const b of bands) {
    if (b.bottom <= top || b.top >= top + height) continue;
    const [r, g, bl] = heatColor(b.reach);
    ctx.fillStyle = `rgba(${r},${g},${bl},${alpha})`;
    ctx.fillRect(0, b.top - top, width, b.bottom - b.top);
  }
};

/** A dashed guide across the preview with a label pill at its left. */
export const drawGuide = (
  ctx: CanvasRenderingContext2D,
  y: number,
  width: number,
  label: string,
  tone: "dark" | "light",
  unit: number,
) => {
  ctx.save();
  ctx.setLineDash([6 * unit, 4 * unit]);
  ctx.lineWidth = 1.5 * unit;
  ctx.strokeStyle =
    tone === "dark"
      ? tokenColor("--ink-900", 0.85)
      : tokenColor("--ink-50", 0.9);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `600 ${11 * unit}px ui-monospace, monospace`;
  const pad = 6 * unit;
  const w = ctx.measureText(label).width + pad * 2;
  const h = 18 * unit;
  ctx.fillStyle =
    tone === "dark"
      ? tokenColor("--ink-900", 0.85)
      : tokenColor("--ink-50", 0.92);
  ctx.fillRect(8 * unit, y - h - 2 * unit, w, h);
  ctx.fillStyle = tokenColor(tone === "dark" ? "--ink-50" : "--ink-900");
  ctx.textBaseline = "middle";
  ctx.fillText(label, 8 * unit + pad, y - h / 2 - 2 * unit);
  ctx.restore();
};
