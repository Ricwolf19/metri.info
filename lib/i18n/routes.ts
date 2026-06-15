import type { Metadata } from "next";

import type { Locale } from "./config";

/**
 * Central route map — the single source of truth pairing each page's English
 * (root) and Spanish (/es, localized slugs) URLs. Drives nav links, the
 * language switcher, hreflang alternates and the sitemap. Never hardcode a
 * sibling-language URL anywhere else.
 */
export type RouteId =
  | "home"
  | "tools"
  | "docs"
  | "exercises"
  | "programs"
  | "download"
  | "about"
  | "privacy"
  | "terms"
  | "signIn"
  | "signUp"
  // Calculators (filled in during Phase 4)
  | "ffmi"
  | "onerm"
  | "tdee"
  | "macros"
  | "bodyfat"
  | "bmi"
  | "water"
  | "plates";

type RouteEntry = { en: string; es: string };

export const ROUTES: Record<RouteId, RouteEntry> = {
  home: { en: "/", es: "/es" },
  tools: { en: "/tools", es: "/es/herramientas" },
  docs: { en: "/docs", es: "/es/docs" },
  exercises: { en: "/exercises", es: "/es/ejercicios" },
  programs: { en: "/programs", es: "/es/programas" },
  download: { en: "/download", es: "/es/descargar" },
  about: { en: "/about", es: "/es/acerca" },
  privacy: { en: "/privacy", es: "/es/privacidad" },
  terms: { en: "/terms", es: "/es/terminos" },
  signIn: { en: "/sign-in", es: "/es/iniciar-sesion" },
  signUp: { en: "/sign-up", es: "/es/registrarse" },
  ffmi: {
    en: "/tools/ffmi-calculator",
    es: "/es/herramientas/calculadora-ffmi",
  },
  onerm: {
    en: "/tools/1rm-calculator",
    es: "/es/herramientas/calculadora-1rm",
  },
  tdee: {
    en: "/tools/tdee-calculator",
    es: "/es/herramientas/calculadora-tdee",
  },
  macros: {
    en: "/tools/macro-calculator",
    es: "/es/herramientas/calculadora-macros",
  },
  bodyfat: {
    en: "/tools/body-fat-calculator",
    es: "/es/herramientas/calculadora-grasa-corporal",
  },
  bmi: {
    en: "/tools/bmi-calculator",
    es: "/es/herramientas/calculadora-imc",
  },
  water: {
    en: "/tools/water-intake-calculator",
    es: "/es/herramientas/calculadora-agua",
  },
  plates: {
    en: "/tools/plate-calculator",
    es: "/es/herramientas/calculadora-discos",
  },
};

/** Calculator route ids (subset of RouteId), in display order. */
export const CALC_IDS = [
  "onerm",
  "tdee",
  "macros",
  "bodyfat",
  "bmi",
  "ffmi",
  "water",
  "plates",
] as const satisfies readonly RouteId[];

export type CalcRouteId = (typeof CALC_IDS)[number];

/** Map a calculator slug (last path segment) to its route id, per locale. */
export const calcIdForSlug = (
  locale: Locale,
  slug: string,
): CalcRouteId | null => {
  const full = locale === "es" ? `/es/herramientas/${slug}` : `/tools/${slug}`;
  return CALC_IDS.find((id) => ROUTES[id][locale] === full) ?? null;
};

/** Resolve a route id to its path in the given locale. */
export const routePath = (id: RouteId, locale: Locale): string =>
  ROUTES[id][locale];

/** Whether a pathname is a full-screen auth page (no site header/footer). */
export const isAuthPath = (pathname: string): boolean =>
  [
    ROUTES.signIn.en,
    ROUTES.signIn.es,
    ROUTES.signUp.en,
    ROUTES.signUp.es,
  ].includes(pathname);

/** Metadata `alternates` (canonical + hreflang languages + x-default). */
export const metaAlternates = (
  id: RouteId,
  locale: Locale,
): Metadata["alternates"] => ({
  canonical: ROUTES[id][locale],
  languages: {
    en: ROUTES[id].en,
    es: ROUTES[id].es,
    "x-default": ROUTES[id].en,
  },
});

/** Reverse-lookup a pathname to its route id (exact match). */
export const routeIdForPath = (pathname: string): RouteId | null => {
  for (const id of Object.keys(ROUTES) as RouteId[]) {
    if (ROUTES[id].en === pathname || ROUTES[id].es === pathname) return id;
  }
  return null;
};

/** The sibling-language URL for the current pathname (for the language toggle). */
export const alternatePathname = (pathname: string, target: Locale): string => {
  const id = routeIdForPath(pathname);
  if (id) return ROUTES[id][target];
  // Fallback for pages not (yet) in the map: swap the /es prefix.
  if (target === "es")
    return pathname.startsWith("/es") ? pathname : `/es${pathname}`;
  return pathname.replace(/^\/es/, "") || "/";
};
