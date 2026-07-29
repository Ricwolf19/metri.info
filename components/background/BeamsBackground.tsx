"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useRef, useState } from "react";

import type { BeamsProps } from "@/components/background/Beams";
import { cn } from "@/lib/utils";

// Lazy Three.js beams — keeps ~150KB gz out of the critical path; `ssr: false` because there's no GPU/canvas on the server.
const Beams = dynamic(
  () => import("@/components/background/Beams").then((m) => m.Beams),
  { ssr: false },
);

/** Probe WebGL once: GPU-less browsers (no hw accel, VMs, privacy modes) throw
 * on Canvas mount — which surfaces in Sentry and renders a black frame. */
const useWebGLSupport = () => {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    const detect = () => {
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl2") ??
          canvas.getContext("webgl") ??
          canvas.getContext("experimental-webgl");
        setSupported(Boolean(gl));
      } catch {
        setSupported(false);
      }
    };
    detect();
  }, []);
  return supported;
};

/** Swallows a runtime WebGL failure (e.g. context lost after creation) so the
 * decorative background can never take the page down. Renders nothing on error. */
class CanvasBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** WebGL-guarded, fade-in wrapper around <Beams/>: see useWebGLSupport + CanvasBoundary.
 *
 * Recovers from context loss. Two things cause it here: the browser's cap on
 * live WebGL contexts (~16), and Cache Components keeping recent routes mounted
 * in an `<Activity>` — hidden routes get their effects torn down, which disposes
 * the renderer, while the component itself stays mounted with its state intact.
 * Without a reset the canvas came back dead but still faded in, leaving a
 * transparent hero. Bumping `generation` forces a genuinely fresh Canvas. */
export const BeamsBackground = (props: BeamsProps) => {
  const supported = useWebGLSupport();
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onLost = (e: Event) => {
      // Default behaviour is to never fire `contextrestored`; preventing it
      // lets the GPU hand the context back instead of leaving a dead canvas.
      e.preventDefault();
      setReady(false);
      setGeneration((g) => g + 1);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    return () => canvas.removeEventListener("webglcontextlost", onLost);
  }, [generation]);

  if (supported === false) return null;

  return (
    <div
      className={cn(
        "h-full w-full transition-opacity duration-700 ease-out",
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      {supported && (
        <CanvasBoundary key={generation}>
          <Beams
            {...props}
            onReady={(canvas) => {
              canvasRef.current = canvas;
              setReady(true);
            }}
          />
        </CanvasBoundary>
      )}
    </div>
  );
};
