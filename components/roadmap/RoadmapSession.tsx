"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { loadRoadmap, saveRoadmap } from "@/app/roadmap/actions";
import { Diagnostic } from "@/components/roadmap/Diagnostic";
import { RoadmapOverview } from "@/components/roadmap/RoadmapOverview";
import { PlanSummary } from "@/components/roadmap/PlanSummary";
import { RoadmapHistory } from "@/components/roadmap/RoadmapHistory";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics/track";
import type { CalcFacts } from "@/lib/calculators/prefill";
import { useI18n } from "@/lib/i18n";
import { routePath } from "@/lib/i18n/routes";
import { readLocalResult } from "@/lib/quiz/scores";
import type { Answers } from "@/lib/roadmap/diagnostic";
import { readLocalRoadmap, writeLocalRoadmap } from "@/lib/roadmap/local";
import { recommend } from "@/lib/roadmap/recommend";
import { markStep, type RoadmapState, startRoadmap } from "@/lib/roadmap/state";
import {
  type Evidence,
  roadmapSteps,
  schedule,
  type StepId,
} from "@/lib/roadmap/steps";

type Loaded = {
  signedIn: boolean;
  /** The account's plan couldn't be read; offer a retry, never a new plan. */
  failed: boolean;
  state: RoadmapState | null;
  evidence: Evidence;
  facts: CalcFacts | null;
};

const prefersImperial = (facts: CalcFacts | null) => {
  try {
    if (localStorage.getItem("metri_units") === "imperial") return true;
  } catch {}
  return facts?.unitsPreference === "lb";
};

/**
 * The roadmap page's client half: loads the plan (the account's, else this
 * browser's), shows the diagnostic when there is none, and the plan, its
 * steps and the history when there is. Changes are saved only on a user
 * action: to the `roadmap` row for an account, to this browser otherwise.
 */
export const RoadmapSession = ({
  docTitles,
}: {
  docTitles: Record<string, string>;
}) => {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [retaking, setRetaking] = useState(false);

  const [attempt, setAttempt] = useState(0);

  // A visitor's plan lives in this browser; an account's lives only on the
  // server, so a shared browser never hands one person's plan to the next.
  // A plan made as a visitor moves to the account once, then leaves.
  useEffect(() => {
    let active = true;
    const local = readLocalRoadmap();
    void loadRoadmap()
      .catch(() => ({ signedIn: false }) as const)
      .then((res) => {
        if (!active) return;
        if (!res.signedIn) {
          const quizAt = readLocalResult()?.at || undefined;
          setLoaded({
            signedIn: false,
            failed: false,
            state: local,
            evidence: quizAt ? { knowledge: quizAt } : {},
            facts: null,
          });
          return;
        }
        let state = res.roadmap;
        if (!state && local && !res.readFailed) {
          state = local;
          void saveRoadmap(local).then((saved) => {
            if (saved.ok) writeLocalRoadmap(null);
          });
        }
        setLoaded({
          signedIn: true,
          failed: res.readFailed,
          state,
          evidence: res.evidence,
          facts: res.facts,
        });
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  if (!loaded) return <LoadingScreen locale={locale} />;

  if (loaded.failed) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-card border border-ink-600 bg-ink-800 p-6 text-center"
      >
        <p className="text-sm text-ink-200">{t("roadmap.loadError")}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            setLoaded(null);
            setAttempt((n) => n + 1);
          }}
        >
          {t("roadmap.retry")}
        </Button>
      </div>
    );
  }

  const commit = (next: RoadmapState) => {
    setLoaded({ ...loaded, state: next });
    if (!loaded.signedIn) {
      writeLocalRoadmap(next);
      return;
    }
    void saveRoadmap(next).then((res) => {
      if (!res.ok) toast({ title: t("roadmap.saveError"), variant: "error" });
    });
  };

  const { state, evidence, facts } = loaded;
  const plan = state ? recommend(state.answers) : null;
  const steps =
    state && plan
      ? roadmapSteps({
          answers: state.answers,
          plan,
          done: state.done,
          evidence,
          startedAt: state.startedAt,
        })
      : [];

  const complete = (answers: Answers) => {
    const previous =
      state && plan ? { state, phase: plan.phase, total: steps.length } : null;
    const next = startRoadmap(answers, new Date(), previous);
    commit(next);
    setRetaking(false);
    track("roadmap_created", {
      phase: recommend(answers).phase,
      retake: previous !== null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!state || !plan || retaking) {
    return (
      <Diagnostic
        previous={state?.answers ?? null}
        facts={facts}
        imperial={prefersImperial(facts)}
        onComplete={complete}
        onCancel={state ? () => setRetaking(false) : undefined}
      />
    );
  }

  const toggle = (id: StepId, done: boolean) => {
    commit(markStep(state, id, done, new Date()));
    track("roadmap_step", { step: id, done });
  };
  const when = schedule(state.startedAt, plan, new Date());

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_1fr] lg:items-start">
      <RoadmapOverview
        plan={plan}
        steps={steps}
        schedule={when}
        className="lg:col-start-1 lg:row-start-1"
      />
      <aside className="min-w-0 space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <PlanSummary
          plan={plan}
          schedule={when}
          maintenanceKcal={facts?.maintenanceKcal ?? null}
          startedAt={state.startedAt}
        />
        <RoadmapHistory
          steps={steps}
          startedAt={state.startedAt}
          history={state.history}
        />
        {!loaded.signedIn ? (
          <p className="text-xs text-ink-400">
            {t("roadmap.guestNote")}{" "}
            <Link
              href={routePath("signIn", locale)}
              className="font-medium text-brand underline underline-offset-2"
            >
              {t("roadmap.guestSignIn")}
            </Link>
          </p>
        ) : null}
      </aside>
      <div className="min-w-0 lg:col-start-1 lg:row-start-2">
        <RoadmapTimeline
          steps={steps}
          docTitles={docTitles}
          onToggle={toggle}
          onRetake={() => setRetaking(true)}
        />
      </div>
    </div>
  );
};
