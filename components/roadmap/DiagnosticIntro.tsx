"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/** The diagnostic's first screen: what it asks and why, and Start. */
export const DiagnosticIntro = ({
  guest,
  onStart,
}: {
  /** Visitors are told their answers stay in this browser. */
  guest: boolean;
  onStart: () => void;
}) => {
  const t = useT();
  return (
    <div className="mx-auto max-w-xl rounded-card border border-ink-600 bg-ink-800 p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-balance text-ink-50">
        {t("roadmap.intro.title")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-300">
        {t("roadmap.intro.body")}
      </p>
      {guest ? (
        <p className="mt-3 text-xs text-ink-400">{t("roadmap.intro.guest")}</p>
      ) : null}
      <Button
        type="button"
        variant="brand"
        className="mt-6 w-full sm:w-auto"
        onClick={onStart}
      >
        {t("roadmap.intro.start")}
      </Button>
    </div>
  );
};
