import { MEASUREMENT_SITES, type SiteId, siteLabelKey } from "@/lib/body/sites";
import { displayLength, signed } from "@/lib/body/units";
import { intlLocale, type Locale, type TFunction } from "@/lib/i18n/config";
import type { SiteSeries } from "@/lib/sync/body";
import { cn } from "@/lib/utils";

/**
 * The tape, one row per site in catalogue order: latest reading, when, and
 * the change since the previous one. The key site (where each sex stores fat
 * first) is lit, because that is the one that tells the truth about a phase.
 */
export const TapeList = ({
  sites,
  keySite,
  imperial,
  locale,
  t,
}: {
  sites: SiteSeries[];
  keySite: SiteId;
  imperial: boolean;
  locale: Locale;
  t: TFunction;
}) => {
  if (sites.length === 0)
    return <p className="text-sm text-ink-400">{t("body.noTape")}</p>;
  const unit = imperial ? "in" : "cm";
  const bySite = new Map(sites.map((s) => [s.site, s]));
  const fmt = new Intl.DateTimeFormat(intlLocale(locale), {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {MEASUREMENT_SITES.map(({ id }) => {
        const s = bySite.get(id);
        if (!s) return null;
        const key = id === keySite;
        return (
          <li
            key={id}
            className={cn(
              "flex items-center gap-3 rounded-field border px-4 py-3",
              key
                ? "border-brand/40 bg-brand/5"
                : "border-ink-600/70 bg-ink-900/40",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink-50">
                {t(siteLabelKey(id))}
                {key && (
                  <span className="rounded-full border border-brand/40 px-1.5 font-mono text-[10px] tracking-wide text-brand uppercase">
                    {t("body.keySite")}
                  </span>
                )}
              </span>
              <span className="block font-mono text-[11px] text-ink-500">
                {fmt.format(new Date(`${s.latest.date}T00:00:00Z`))}
                {s.previous
                  ? ` · ${t("body.previous", { value: `${displayLength(s.previous.cm, imperial)} ${unit}` })}`
                  : ""}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-mono text-lg font-bold text-ink-50 tabular-nums">
                {displayLength(s.latest.cm, imperial)}
                <span className="ml-1 text-xs font-normal text-ink-400">
                  {unit}
                </span>
              </span>
              {s.deltaCm !== null && (
                <span
                  className={cn(
                    "block font-mono text-[11px] tabular-nums",
                    s.deltaCm === 0 ? "text-ink-500" : "text-ink-300",
                  )}
                >
                  {signed(displayLength(s.deltaCm, imperial))} {unit}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
