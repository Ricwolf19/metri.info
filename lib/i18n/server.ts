import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
  type TFunction,
  isLocale,
  translate,
} from "./config";

/** Resolve the active locale on the server from the persisted cookie. */
export const getLocale = async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
};

/** Server-side translate function bound to the request's locale. */
export const getT = async (): Promise<TFunction> => {
  const locale = await getLocale();
  return (key, vars) => translate(locale, key, vars);
};
