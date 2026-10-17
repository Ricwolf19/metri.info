"use client";

import { ShareResultDialog } from "@/components/shared/ShareResultDialog";
import type { CalcId } from "@/lib/calculators/types";
import { useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * Share a calculator result. The inputs live in the `search` string and the
 * result recomputes from them, so the built URL *is* the shareable snapshot:
 * no account, no stored state, fully reproducible. The card image comes from
 * the /og/calc route.
 */
export const ShareDialog = ({
  calcId,
  locale,
  search,
}: {
  calcId: CalcId;
  locale: Locale;
  search: string;
}) => {
  const t = useT();
  return (
    <ShareResultDialog
      analyticsId={calcId}
      fileName={`metri-${calcId}.png`}
      triggerLabel={t("calc.shareCta")}
      title={t("calc.shareTitle")}
      description={t("calc.shareDesc")}
      links={() => {
        const { origin } = window.location;
        const tail = search ? `&${search}` : "";
        return {
          url: `${origin}/s/${calcId}?locale=${locale}${tail}`,
          imageUrl: `${origin}/og/calc?id=${calcId}&locale=${locale}${tail}`,
        };
      }}
    />
  );
};
