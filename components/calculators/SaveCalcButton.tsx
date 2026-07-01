"use client";

import Link from "next/link";
import { useState } from "react";

import { BookmarkIcon, CheckIcon } from "@/components/icons";
import { BenefitsPanel } from "@/components/marketing/BenefitsPanel";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { track } from "@/lib/analytics/track";
import { useSession } from "@/lib/auth/client";
import { saveCalculation } from "@/lib/calculators/log";
import { CALCULATORS } from "@/lib/calculators/registry";
import { useI18n } from "@/lib/i18n";
import type { CalcId, CalcValues } from "@/lib/calculators/types";
import { routePath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

type State = "idle" | "saving" | "saved" | "error";

const baseBtn = cn(
  "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
  "focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none",
);

/**
 * Explicit "Save calculation" action. Signed-in users persist the current
 * result to their history (server action); signed-out users get an
 * account-prompt modal explaining the value of an account (compact
 * BenefitsPanel + T&C note + sign-up/sign-in CTAs). The calculator state already
 * lives in the URL, so no save-and-return wiring is needed.
 */
export const SaveCalcButton = ({
  id,
  values,
  canSave = true,
}: {
  id: CalcId;
  values: CalcValues;
  canSave?: boolean;
}) => {
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [state, setState] = useState<State>("idle");
  const [promptOpen, setPromptOpen] = useState(false);

  const onClick = async () => {
    if (!canSave) return;
    if (!session) {
      track("save_prompt_shown", { calculator: id });
      setPromptOpen(true);
      return;
    }
    if (state === "saving" || state === "saved") return;
    setState("saving");
    const results = CALCULATORS[id].compute(values);
    const res = await saveCalculation({
      calculatorType: id,
      inputs: values,
      results,
    });
    if (res.ok) {
      setState("saved");
      track("calculation_saved", { calculator: id });
      toast({ title: t("toast.calcSaved"), variant: "success" });
    } else {
      setState("error");
      toast({ title: t("toast.calcSaveError"), variant: "error" });
    }
  };

  return (
    <>
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={onClick}
          disabled={!canSave || state === "saving"}
          className={cn(
            baseBtn,
            "border-lime-600 text-lime-700 hover:bg-lime-50",
            "dark:border-lime-400/40 dark:text-lime-400 dark:hover:bg-lime-400/10",
            state === "saving" && "opacity-60",
            !canSave &&
              "cursor-not-allowed opacity-40 hover:bg-transparent dark:hover:bg-transparent",
          )}
        >
          {state === "saving" ? (
            <Spinner size="sm" />
          ) : state === "saved" ? (
            <CheckIcon size={14} />
          ) : (
            <BookmarkIcon size={14} />
          )}
          {state === "saved"
            ? t("calc.saved")
            : state === "saving"
              ? t("calc.saving")
              : t("calc.saveCta")}
        </button>
        {state === "saved" && (
          <Link
            href="/account"
            className="text-xs font-medium text-accent underline-offset-2 hover:underline"
          >
            {t("calc.saveViewHistory")}
          </Link>
        )}
      </div>

      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="flex max-w-2xl flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <DialogTitle>{t("calc.savePromptTitle")}</DialogTitle>
            <DialogDescription>{t("calc.savePromptDesc")}</DialogDescription>
          </div>

          <BenefitsPanel compact />

          <p className="text-xs leading-relaxed text-ink-400">
            {t("calc.savePromptTerms")}{" "}
            <Link
              href={routePath("terms", locale)}
              className="text-ink-200 underline underline-offset-2 hover:text-accent"
            >
              {t("calc.savePromptTermsLink")}
            </Link>{" "}
            {t("common.and")}{" "}
            <Link
              href={routePath("privacy", locale)}
              className="text-ink-200 underline underline-offset-2 hover:text-accent"
            >
              {t("calc.savePromptPrivacyLink")}
            </Link>
            .
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href={routePath("signUp", locale)}
              className={cn(
                baseBtn,
                "h-11 border-transparent bg-accent-fill text-sm text-ink-900 hover:opacity-90",
              )}
            >
              {t("calc.savePromptCreate")}
            </Link>
            <Link
              href={routePath("signIn", locale)}
              className={cn(
                baseBtn,
                "h-11 border-ink-600 text-sm text-ink-200 hover:bg-ink-800 hover:text-ink-50",
              )}
            >
              {t("calc.savePromptSignIn")}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
