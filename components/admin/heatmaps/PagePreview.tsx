"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Spinner } from "@/components/ui/Spinner";
import {
  type HeatPoint,
  intensityCap,
  type ReachBand,
} from "@/lib/analytics/heat";
import { cn } from "@/lib/utils";

import {
  drawBands,
  drawGuide,
  drawSlice,
  type HeatLayer,
  paintLayer,
  releaseLayer,
  tokenColor,
} from "./heat-layer";

export type Guide = { y: number; label: string };

type FrameState =
  | { status: "loading" }
  | { status: "ready"; docHeight: number }
  /** Redirected, gated or unreachable: the heat goes on a blank sheet. */
  | { status: "elsewhere" };

type Props = {
  /** Same-origin path the preview loads, in the operator's own session. */
  src: string;
  /** Spoken summary of what the map shows. */
  summary: string;
  /** The device's viewport, CSS px. */
  width: number;
  height: number;
  points: readonly HeatPoint[];
  bands: readonly ReachBand[];
  /** Reach markers (scroll depth) — dark pills. */
  markers: readonly Guide[];
  /** The first screen's edge — a light pill. */
  fold: Guide;
};

/** The overview strip beside the preview. */
const STRIP = 44;
const GAP = 12;
const MAX_HEIGHT = 720;
/** Light enough that the page reads through a band that everyone reached. */
const BAND_ALPHA = 0.28;

const normalize = (path: string) => path.replace(/\/$/, "") || "/";

/** What the loaded frame holds: our page (and how tall it is), or not. */
const readFrame = (
  el: HTMLIFrameElement | null,
  src: string,
): { state: FrameState; scrollY: number } => {
  try {
    const win = el?.contentWindow;
    if (!win?.document) throw new Error("no document");
    const want = normalize(new URL(src, window.location.origin).pathname);
    if (normalize(win.location.pathname) !== want)
      return { state: { status: "elsewhere" }, scrollY: 0 };
    return {
      state: {
        status: "ready",
        docHeight: win.document.documentElement.scrollHeight,
      },
      scrollY: win.scrollY,
    };
  } catch {
    return { state: { status: "elsewhere" }, scrollY: 0 };
  }
};

const fit = (container: number, width: number, height: number) =>
  Math.min(
    1,
    Math.max(
      0.1,
      Math.min((container - STRIP - GAP) / width, MAX_HEIGHT / height),
    ),
  );

/**
 * The live page at a device's viewport, scaled to fit, with the heat drawn
 * over it. The iframe takes no input (so a click can't navigate it); the
 * overlay drives its scroll instead — wheel, arrow keys, Page Up/Down,
 * Home/End, or the overview strip — and only the slice under the scroll is
 * copied from the prebuilt heat layers each frame.
 *
 * The frame is not sized to the whole document: sections sized to the
 * viewport (`min-h-dvh`) would grow with it forever. If the page redirects or
 * won't load, the heat is drawn on a blank sheet as tall as the data reaches.
 */
export const PagePreview = ({
  src,
  summary,
  width,
  height,
  points,
  bands,
  markers,
  fold,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stripRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(0.5);
  const [scrollY, setScrollY] = useState(0);
  const [frame, setFrame] = useState<FrameState>({ status: "loading" });
  const [showFixed, setShowFixed] = useState(true);

  const fixedCount = points.filter((p) => p.fixed).length;
  const dataHeight = useMemo(
    () =>
      Math.max(
        height,
        ...points.filter((p) => !p.fixed).map((p) => p.y + height / 2),
        ...bands.map((b) => b.bottom),
      ),
    [points, bands, height],
  );
  const docHeight =
    frame.status === "ready" ? Math.max(height, frame.docHeight) : dataHeight;
  const maxScroll = Math.max(0, docHeight - height);
  const top = Math.min(scrollY, maxScroll);

  const cap = useMemo(() => intensityCap(points), [points]);
  const docLayer = useMemo<HeatLayer | null>(
    () =>
      typeof document === "undefined"
        ? null
        : paintLayer(
            points.filter((p) => !p.fixed),
            cap,
            width,
            docHeight,
          ),
    [points, cap, width, docHeight],
  );
  const fixedLayer = useMemo<HeatLayer | null>(
    () =>
      typeof document === "undefined" || fixedCount === 0
        ? null
        : paintLayer(
            points.filter((p) => p.fixed),
            cap,
            width,
            height,
          ),
    [points, cap, width, height, fixedCount],
  );
  useEffect(() => () => releaseLayer(docLayer), [docLayer]);
  useEffect(() => () => releaseLayer(fixedLayer), [fixedLayer]);

  // Fit the device into the card, whatever the card's width.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setScale(fit(entry.contentRect.width, width, height)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  // Follow the page once it's ours: its scroll and its height as it settles.
  useEffect(() => {
    if (frame.status !== "ready") return;
    const win = frameRef.current?.contentWindow as
      | (Window & typeof globalThis)
      | null
      | undefined;
    const doc = win?.document;
    if (!win || !doc) return;
    const onScroll = () => setScrollY(win.scrollY);
    win.addEventListener("scroll", onScroll, { passive: true });
    const observer = new win.ResizeObserver(() =>
      setFrame({
        status: "ready",
        docHeight: doc.documentElement.scrollHeight,
      }),
    );
    observer.observe(doc.body);
    return () => {
      win.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [frame.status]);

  const scrollTo = (y: number) => {
    const next = Math.round(Math.min(maxScroll, Math.max(0, y)));
    if (frame.status === "ready")
      frameRef.current?.contentWindow?.scrollTo({
        top: next,
        behavior: "instant",
      });
    setScrollY(next);
  };

  // A wheel over the preview scrolls the page inside it; at either end it
  // falls through to the dashboard. Native and non-passive, so it can stop
  // the dashboard from scrolling too.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      const delta = (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) / scale;
      if ((delta < 0 && top <= 0) || (delta > 0 && top >= maxScroll)) return;
      e.preventDefault();
      const next = Math.round(Math.min(maxScroll, Math.max(0, top + delta)));
      if (frame.status === "ready")
        frameRef.current?.contentWindow?.scrollTo({
          top: next,
          behavior: "instant",
        });
      setScrollY(next);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [top, maxScroll, scale, frame.status]);

  // Paint the frame: bands, the document slice under the scroll, the fixed
  // layer, then the guides.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const id = requestAnimationFrame(() => {
      const k = scale * (window.devicePixelRatio || 1);
      canvas.width = Math.round(width * k);
      canvas.height = Math.round(height * k);
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawBands(ctx, bands, top, width, height, BAND_ALPHA);
      if (docLayer) drawSlice(ctx, docLayer, top, width, height);
      if (fixedLayer && showFixed)
        ctx.drawImage(fixedLayer.canvas, 0, 0, width, height);
      const unit = 1 / scale;
      for (const m of markers)
        if (m.y > top && m.y < top + height)
          drawGuide(ctx, m.y - top, width, m.label, "dark", unit);
      if (fold.y > top && fold.y < top + height)
        drawGuide(ctx, fold.y - top, width, fold.label, "light", unit);
    });
    return () => cancelAnimationFrame(id);
  }, [
    scale,
    width,
    height,
    top,
    bands,
    docLayer,
    fixedLayer,
    showFixed,
    markers,
    fold,
  ]);

  // The overview strip: the whole page, its heat, and where the view is.
  const stripHeight = Math.round(height * scale);
  useEffect(() => {
    const strip = stripRef.current;
    const ctx = strip?.getContext("2d");
    if (!strip || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    strip.width = STRIP * dpr;
    strip.height = stripHeight * dpr;
    const k = (stripHeight / docHeight) * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = tokenColor("--ink-850");
    ctx.fillRect(0, 0, strip.width, strip.height);
    ctx.setTransform((STRIP * dpr) / width, 0, 0, k, 0, 0);
    drawBands(ctx, bands, 0, width, docHeight, 0.85);
    if (docLayer) drawSlice(ctx, docLayer, 0, width, docHeight);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.strokeStyle = tokenColor("--ink-50", 0.9);
    ctx.lineWidth = 1.5 * dpr;
    ctx.strokeRect(
      dpr,
      top * k,
      STRIP * dpr - 2 * dpr,
      Math.max(4 * dpr, height * k),
    );
  }, [stripHeight, docHeight, width, height, bands, docLayer, top]);

  const onStripPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.type === "pointermove" && e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    scrollTo(((e.clientY - rect.top) / rect.height) * docHeight - height / 2);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step: Record<string, number> = {
      ArrowDown: 80,
      ArrowUp: -80,
      PageDown: height * 0.9,
      PageUp: -height * 0.9,
      " ": e.shiftKey ? -height * 0.9 : height * 0.9,
    };
    if (e.key === "Home") scrollTo(0);
    else if (e.key === "End") scrollTo(maxScroll);
    else if (e.key in step) scrollTo(top + step[e.key]);
    else return;
    e.preventDefault();
  };

  const onLoad = () => {
    const read = readFrame(frameRef.current, src);
    setFrame(read.state);
    setScrollY(read.scrollY);
  };

  // A same-origin page can finish loading before hydration, and then
  // `onLoad` never fires for us: look once after mounting.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const doc = frameRef.current?.contentDocument;
      if (doc?.readyState !== "complete" || doc.URL === "about:blank") return;
      const read = readFrame(frameRef.current, src);
      setFrame(read.state);
      setScrollY(read.scrollY);
    });
    return () => cancelAnimationFrame(id);
  }, [src]);

  const shownWidth = Math.round(width * scale);
  const shownHeight = Math.round(height * scale);

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex justify-center gap-3">
        <div
          className="relative shrink-0 overflow-hidden rounded-lg border border-ink-600 bg-ink-950"
          style={{ width: shownWidth, height: shownHeight }}
        >
          {/* Sandboxed so the page can't navigate the dashboard, open
              windows or submit forms; same-origin and scripts stay on
              because the preview reads its scroll and height. */}
          <iframe
            ref={frameRef}
            src={src}
            title="Page preview"
            onLoad={onLoad}
            loading="lazy"
            referrerPolicy="same-origin"
            sandbox="allow-same-origin allow-scripts"
            tabIndex={-1}
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-0 left-0 origin-top-left border-0 bg-ink-950",
              frame.status === "elsewhere" && "invisible",
            )}
            style={{ width, height, transform: `scale(${scale})` }}
          />
          {frame.status === "elsewhere" ? (
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(rgb(var(--ink-700))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--ink-700))_1px,transparent_1px)] bg-size-[40px_40px] opacity-40"
            />
          ) : null}
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={summary}
            className="absolute inset-0"
            style={{ width: shownWidth, height: shownHeight }}
          />
          <div
            ref={stageRef}
            tabIndex={0}
            role="region"
            aria-label="Heatmap preview. Scroll it with the mouse wheel, the arrow keys, Page Up, Page Down, Home and End."
            onKeyDown={onKeyDown}
            className="absolute inset-0 cursor-ns-resize focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:outline-none focus-visible:ring-inset"
          />
          {frame.status === "loading" ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink-950/60">
              <Spinner />
            </div>
          ) : null}
        </div>
        <canvas
          ref={stripRef}
          aria-hidden
          onPointerDown={onStripPointer}
          onPointerMove={onStripPointer}
          className="shrink-0 cursor-pointer touch-none rounded-md border border-ink-600"
          style={{ width: STRIP, height: stripHeight }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-400">
        <span className="font-mono">
          {frame.status === "elsewhere"
            ? "The live page didn't load here, so the heat sits on a blank sheet."
            : `${width}×${height} · scrolled ${Math.round(top).toLocaleString("en-US")} of ${Math.round(maxScroll).toLocaleString("en-US")} px`}
        </span>
        {fixedCount > 0 ? (
          <button
            type="button"
            onClick={() => setShowFixed((v) => !v)}
            aria-pressed={!showFixed}
            className="rounded-full border border-ink-600 px-3 py-1 text-ink-300 transition-colors hover:border-ink-500 hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:outline-none"
          >
            {showFixed ? "Hide" : "Show"} fixed elements ({fixedCount})
          </button>
        ) : null}
      </div>
    </div>
  );
};
