"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useState } from "react";

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

/** WebGL-guarded, fade-in wrapper around <Beams/>: see useWebGLSupport + CanvasBoundary. */
export const BeamsBackground = (props: BeamsProps) => {
  const supported = useWebGLSupport();
  const [ready, setReady] = useState(false);

  if (supported === false) return null;

  return (
    <div
      className={cn(
        "h-full w-full transition-opacity duration-700 ease-out",
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      {supported && (
        <CanvasBoundary>
          <Beams {...props} onReady={() => setReady(true)} />
        </CanvasBoundary>
      )}
    </div>
  );
};
