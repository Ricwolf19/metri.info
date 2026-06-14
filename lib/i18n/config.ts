/**
 * Framework-agnostic i18n core — safe to import in Server or Client Components.
 */
import { en, type TranslationKey } from "./en";
import { es } from "./es";

export type Locale = "en" | "es";

export const LOCALES: { value: Locale; key: TranslationKey }[] = [
  { value: "en", key: "lang.en" },
  { value: "es", key: "lang.es" },
];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie name shared by the server (SSR) and client (toggle persistence). */
export const LOCALE_COOKIE = "metri_locale";

const DICTS: Record<Locale, Record<TranslationKey, string>> = { en, es };

const interpolate = (
  template: string,
  vars?: Record<string, string | number>,
): string => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match,
  );
};

export type TFunction = (
  key: TranslationKey,
  vars?: Record<string, string | number>,
) => string;

/** Pure translate — falls back to English, then to the key itself. */
export const translate = (
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string => interpolate(DICTS[locale][key] ?? en[key] ?? key, vars);

export const isLocale = (value: unknown): value is Locale =>
  value === "en" || value === "es";
