import "server-only";

import { headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  type Locale,
  type TFunction,
  isLocale,
  translate,
} from "./config";

/** Resolve the active locale on the server from the middleware `x-locale`
 * header (path-based i18n: English at root, Spanish under /es). */
export const getLocale = async (): Promise<Locale> => {
  const value = (await headers()).get("x-locale");
  return isLocale(value) ? value : DEFAULT_LOCALE;
};

/** Server-side translate function bound to the request's locale. */
export const getT = async (): Promise<TFunction> => {
  const locale = await getLocale();
  return (key, vars) => translate(locale, key, vars);
};
