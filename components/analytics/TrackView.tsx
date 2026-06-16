"use client";

import { useEffect, useRef } from "react";

import { track } from "@/lib/analytics/track";

/**
 * Fires a custom PostHog event once when mounted — a render-only way to log a
 * view from an otherwise server-rendered page (e.g. `docs_viewed`). Renders
 * nothing. `properties` is read once on mount; changing it won't re-fire.
 */
export const TrackView = ({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, unknown>;
}) => {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
};
