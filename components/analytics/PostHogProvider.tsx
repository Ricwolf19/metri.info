"use client";

import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { authClient } from "@/lib/auth/client";
import { CONSENT_EVENT, readConsent } from "@/lib/legal/consent";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

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
    // First-party reverse proxy (see next.config rewrites) so ad blockers don't
    // drop events; `ui_host` keeps the toolbar/links pointing at PostHog itself.
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
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

/** Tie events to the signed-in user (and reset on sign-out) so funnels,
 * retention and per-person views work. `role` is included when present. */
const Identify = () => {
  const { data } = authClient.useSession();
  const user = data?.user as
    | { id: string; email?: string; name?: string; role?: string }
    | undefined;

  useEffect(() => {
    if (!started) return;
    if (user?.id) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } else {
      posthog.reset();
    }
  }, [user?.id, user?.email, user?.name, user?.role]);

  return null;
};

/** Initializes PostHog only when a key is configured AND the visitor has
 * granted cookie consent; otherwise a true no-op. Listens for the consent
 * event so accepting the banner starts tracking immediately, no reload. */
export const PostHogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (readConsent() === "granted") start();
    const onConsent = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "granted") start();
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  if (!key) return <>{children}</>;

  return (
    <>
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
      <Identify />
      {children}
    </>
  );
};
