import type { Locale } from "./config";

/** The locale a pathname is written in: Spanish lives under `/es`. */
export const localeForPathname = (pathname: string): Locale =>
  pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";

/**
 * Corrects `<html lang>` before anything reads it. The root layout is shared
 * by both locales and must stay static, so it renders `lang="en"`; this inline
 * script runs while `<head>` parses, before the first paint and before a
 * screen reader picks a voice, and switches Spanish paths to `es`. Client
 * navigations are kept right by `I18nProvider`. Same rule as
 * `localeForPathname` (the test holds them together).
 */
export const HTML_LANG_SCRIPT =
  '(function(){var p=location.pathname;if(p==="/es"||p.indexOf("/es/")===0)document.documentElement.lang="es"})()';
