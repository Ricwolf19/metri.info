import type { ListConfig, ThemeClasses } from "listkit";

type Tones = Exclude<NonNullable<ListConfig<unknown>["tones"]>, string>;

/** listkit accents on the brand lime, read from the same tokens as the rest of
 * the site. Backgrounds stay opaque: pinned cells inherit the row colour. */
export const metriListTheme: ThemeClasses = {
  focusRing: "focus:ring-brand/40",
  focusBorder: "focus:border-brand/60",
  primaryBg: "bg-brand",
  primaryText: "text-brand-contrast",
  primaryHover: "hover:bg-brand/90",
  paginationSpinnerBorder: "border-brand",
  viewToggleActiveBg: "bg-ink-700",
  viewToggleActiveText: "text-ink-50",
  viewToggleActiveShadow: "shadow-sm",
  chipBg: "bg-brand/10",
  chipBorder: "border-brand/30",
  chipText: "text-brand",
  softHoverBg: "hover:bg-ink-800",
  accentText: "text-brand",
};

/** The neutral chrome (table panel, header, rows) in ink tokens. */
export const metriListTones: Tones = {
  container: "border-ink-600 bg-ink-800",
  headerBg: "bg-ink-850",
  headerText: "text-ink-300",
  headerDivider: "border-ink-600",
  rowBg: "bg-ink-800",
  rowHover: "hover:bg-ink-750",
  rowSelected: "bg-ink-700 hover:bg-ink-700",
  divider: "divide-ink-700",
};

/** `timestamp` columns come back from SQL as ISO strings (see the list
 * actions); render them once, the same way, in every list. */
export const formatListDate = (iso: string, locale = "en-US") =>
  new Date(iso).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
