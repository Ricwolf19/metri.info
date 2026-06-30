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
  | "download"
  | "about"
  | "changelog"
  | "privacy"
  | "terms"
  | "contact"
  | "signIn"
  | "signUp"
  | "forgotPassword"
  | "resetPassword"
  | "account"
  | "activity"
  | "ffmi"
  | "onerm"
  | "tdee"
  | "macros"
  | "bodyfat"
  | "bmi"
  | "water"
  | "plates"
  | "idealweight"
  | "deficit"
  | "protein"
  | "leanmass"
  | "heartrate"
  | "whtr"
  | "wilks"
  | "calsburned";

type RouteEntry = { en: string; es: string };

export const ROUTES: Record<RouteId, RouteEntry> = {
  home: { en: "/", es: "/es" },
  tools: { en: "/tools", es: "/es/herramientas" },
  docs: { en: "/docs", es: "/es/docs" },
  download: { en: "/download", es: "/es/descargar" },
  about: { en: "/about", es: "/es/acerca" },
  changelog: { en: "/changelog", es: "/es/changelog" },
  privacy: { en: "/privacy", es: "/es/privacidad" },
  terms: { en: "/terms", es: "/es/terminos" },
  contact: { en: "/contact", es: "/es/contacto" },
  signIn: { en: "/sign-in", es: "/es/iniciar-sesion" },
  signUp: { en: "/sign-up", es: "/es/registrarse" },
  forgotPassword: {
    en: "/forgot-password",
    es: "/es/recuperar-contrasena",
  },
  resetPassword: {
    en: "/reset-password",
    es: "/es/restablecer-contrasena",
  },
  account: { en: "/account", es: "/es/cuenta" },
  activity: { en: "/account/activity", es: "/es/cuenta/actividad" },
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
  idealweight: {
    en: "/tools/ideal-weight-calculator",
    es: "/es/herramientas/calculadora-peso-ideal",
  },
  deficit: {
    en: "/tools/calorie-deficit-calculator",
    es: "/es/herramientas/calculadora-deficit-calorico",
  },
  protein: {
    en: "/tools/protein-calculator",
    es: "/es/herramientas/calculadora-proteina",
  },
  leanmass: {
    en: "/tools/lean-body-mass-calculator",
    es: "/es/herramientas/calculadora-masa-magra",
  },
  heartrate: {
    en: "/tools/heart-rate-zone-calculator",
    es: "/es/herramientas/calculadora-zonas-frecuencia-cardiaca",
  },
  whtr: {
    en: "/tools/waist-to-height-ratio-calculator",
    es: "/es/herramientas/calculadora-cintura-altura",
  },
  wilks: {
    en: "/tools/wilks-dots-calculator",
    es: "/es/herramientas/calculadora-wilks-dots",
  },
  calsburned: {
    en: "/tools/calories-burned-calculator",
    es: "/es/herramientas/calculadora-calorias-quemadas",
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
  "idealweight",
  "deficit",
  "protein",
  "leanmass",
  "heartrate",
  "whtr",
  "wilks",
  "calsburned",
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
const isAuthPath = (pathname: string): boolean =>
  [
    ROUTES.signIn.en,
    ROUTES.signIn.es,
    ROUTES.signUp.en,
    ROUTES.signUp.es,
    ROUTES.forgotPassword.en,
    ROUTES.forgotPassword.es,
    ROUTES.resetPassword.en,
    ROUTES.resetPassword.es,
  ].includes(pathname);

/** Pages that render their own shell — no marketing header/footer (auth, admin). */
export const isChromelessPath = (pathname: string): boolean =>
  isAuthPath(pathname) ||
  pathname === "/admin" ||
  pathname.startsWith("/admin/");

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
const routeIdForPath = (pathname: string): RouteId | null => {
  for (const id of Object.keys(ROUTES) as RouteId[]) {
    if (ROUTES[id].en === pathname || ROUTES[id].es === pathname) return id;
  }
  return null;
};

/** The sibling-language URL for the current pathname (for the language toggle). */
export const alternatePathname = (pathname: string, target: Locale): string => {
  const id = routeIdForPath(pathname);
  if (id) return ROUTES[id][target];
  if (target === "es")
    return pathname.startsWith("/es") ? pathname : `/es${pathname}`;
  return pathname.replace(/^\/es/, "") || "/";
};
