"use client";

import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

const dntEnabled = () =>
  typeof navigator !== "undefined" &&
  (navigator.doNotTrack === "1" ||
    (typeof window !== "undefined" &&
      (window as { doNotTrack?: string }).doNotTrack === "1"));

let started = false;

const start = () => {
  if (started || !key || typeof window === "undefined" || dntEnabled()) return;
  started = true;
  posthog.init(key, {
    api_host: host || "https://us.i.posthog.com",
    autocapture: true,
    enable_heatmaps: true,
    disable_session_recording: false,
    session_recording: { maskAllInputs: true },
    capture_pageview: false,
    capture_pageleave: true,
  });
};

/** Manual `$pageview` capture on App Router navigations. useSearchParams must be
 * wrapped in <Suspense> (it opts the subtree out of static rendering). */
const PageViews = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!started) return;
    const search = searchParams.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    posthog.capture("$pageview", {
      $current_url: `${window.location.origin}${url}`,
    });
  }, [pathname, searchParams]);

  return null;
};

/** Initializes PostHog only when a key is configured; otherwise a true no-op so
 * local dev and unconfigured deployments stay clean. */
export const PostHogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(start, []);

  if (!key) return <>{children}</>;

  return (
    <>
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
      {children}
    </>
  );
};
