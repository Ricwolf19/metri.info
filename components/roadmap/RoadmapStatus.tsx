"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { routePath } from "@/lib/i18n/routes";
import { formatDay } from "@/lib/roadmap/format";
import type { Phase } from "@/lib/roadmap/recommend";
import { cn } from "@/lib/utils";

type Status =
  /** A visitor's result: this browser only. */
  | { kind: "guest" }
  /** A signed-in result not kept yet; `replacing` is the account's plan. */
  | {
      kind: "draft";
      replacing: { phase: Phase; startedAt: string } | null;
      keeping: boolean;
      onKeep: () => void;
      onDiscard: () => void;
    }
  /** The plan the account keeps. */
  | { kind: "kept" };

/**
 * The band over a plan that says where it lives and what to do about it: a
 * visitor's result is temporary (sign in to keep it), a signed-in result
 * waits to be kept (and never replaces the account's plan until it is), a
 * kept plan says so. Taking the test again is one tap from every state.
 */
export const RoadmapStatus = ({
  status,
  onRetake,
  className,
}: {
  status: Status;
  onRetake: () => void;
  className?: string;
}) => {
  const { t, locale } = useI18n();
  const pending = status.kind !== "kept";
  const title =
    status.kind === "guest"
      ? t("roadmap.status.guestTitle")
      : status.kind === "draft"
        ? t("roadmap.status.draftTitle")
        : t("roadmap.status.keptTitle");
  const body =
    status.kind === "guest"
      ? t("roadmap.status.guestBody")
      : status.kind === "draft"
        ? status.replacing
          ? t("roadmap.status.replacing", {
              phase: t(
                `roadmap.phase.${status.replacing.phase}` as TranslationKey,
              ),
              date: formatDay(status.replacing.startedAt, locale),
            })
          : t("roadmap.status.draftBody")
        : t("roadmap.status.keptBody");

  return (
    <section
      aria-label={title}
      className={cn(
        "flex flex-col gap-4 rounded-card border p-4 sm:flex-row sm:items-center sm:p-5",
        pending ? "border-brand/30 bg-brand/10" : "border-ink-600 bg-ink-800",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-50">
          <span
            aria-hidden
            className={cn(
              "size-2 shrink-0 rounded-full",
              pending ? "bg-brand" : "bg-ink-400",
            )}
          />
          {title}
        </p>
        <p className="mt-1 text-sm text-pretty text-ink-300">{body}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {status.kind === "guest" ? (
          <Link
            href={routePath("signIn", locale)}
            className={buttonVariants({ variant: "brand", size: "sm" })}
          >
            {t("roadmap.status.signIn")}
          </Link>
        ) : null}
        {status.kind === "draft" ? (
          <Button
            type="button"
            variant="brand"
            size="sm"
            loading={status.keeping}
            onClick={status.onKeep}
          >
            {t("roadmap.keep")}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={status.kind === "draft" && status.keeping}
          onClick={onRetake}
        >
          {t("roadmap.retakeTest")}
        </Button>
        {status.kind === "draft" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={status.keeping}
            onClick={status.onDiscard}
          >
            {t("roadmap.discard")}
          </Button>
        ) : null}
      </div>
    </section>
  );
};
