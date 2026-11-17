"use client";

import { useEffect, useState } from "react";

import { loadRoadmap, saveRoadmap } from "@/app/roadmap/actions";
import { Diagnostic } from "@/components/roadmap/Diagnostic";
import { RoadmapOverview } from "@/components/roadmap/RoadmapOverview";
import { RoadmapStatus } from "@/components/roadmap/RoadmapStatus";
import { PlanSummary } from "@/components/roadmap/PlanSummary";
import { RoadmapHistory } from "@/components/roadmap/RoadmapHistory";
import { RoadmapSkeleton } from "@/components/skeletons/RoadmapSkeleton";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";
import { StickyColumn } from "@/components/shared/StickyColumn";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics/track";
import type { CalcFacts } from "@/lib/calculators/prefill";
import { useI18n } from "@/lib/i18n";
import { readLocalResult } from "@/lib/quiz/scores";
import type { Answers } from "@/lib/roadmap/diagnostic";
import { readLocalRoadmap, writeLocalRoadmap } from "@/lib/roadmap/local";
import { recommend } from "@/lib/roadmap/recommend";
import {
  keepRoadmap,
  markStep,
  type RoadmapState,
  startRoadmap,
} from "@/lib/roadmap/state";
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
  /** The plan the account keeps (signed in only). */
  kept: RoadmapState | null;
  /** A result not kept yet. A visitor's lives in this browser and is all a
   * visitor has; a signed-in retake lives on this page only, so a shared
   * browser never holds an account's answers. */
  draft: RoadmapState | null;
  /** The draft is the one stored in this browser (made as a visitor). */
  draftLocal: boolean;
  evidence: Evidence;
  facts: CalcFacts | null;
};

const prefersImperial = (facts: CalcFacts | null) => {
  try {
    if (localStorage.getItem("metri_units") === "imperial") return true;
  } catch {}
  return facts?.unitsPreference === "lb";
};

/** A plan's phase and step count, for the history entry it leaves. */
const summarize = (state: RoadmapState, evidence: Evidence) => {
  const plan = recommend(state.answers);
  return {
    state,
    phase: plan.phase,
    total: roadmapSteps({
      answers: state.answers,
      plan,
      done: state.done,
      evidence,
      startedAt: state.startedAt,
    }).length,
  };
};

/**
 * The roadmap page's client half. Every diagnostic result starts as a draft:
 * a visitor's stays in this browser (and says it's temporary), a signed-in
 * one waits on this page for "Keep this plan". Only a kept plan is written to
 * the `roadmap` row, and it is never replaced until the person keeps another
 * result, so the test can be taken as often as they like.
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
  const [keeping, setKeeping] = useState(false);
  const [attempt, setAttempt] = useState(0);

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
            kept: null,
            draft: local,
            draftLocal: true,
            evidence: quizAt ? { knowledge: quizAt } : {},
            facts: null,
          });
          return;
        }
        setLoaded({
          signedIn: true,
          failed: res.readFailed,
          kept: res.roadmap,
          draft: local,
          draftLocal: local !== null,
          evidence: res.evidence,
          facts: res.facts,
        });
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  if (!loaded) return <RoadmapSkeleton locale={locale} />;

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

  const { kept, draft, evidence, facts, signedIn } = loaded;
  const state = draft ?? kept;
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

  /** A draft changed: in this browser if that's where it lives. */
  const setDraft = (next: RoadmapState | null, local: boolean) => {
    if (local) writeLocalRoadmap(next);
    setLoaded({ ...loaded, draft: next, draftLocal: next !== null && local });
  };

  const complete = (answers: Answers) => {
    const now = new Date();
    if (signedIn) {
      // A retake never touches the kept plan, and replaces any older draft
      // (including one this browser held from before signing in).
      if (loaded.draftLocal) writeLocalRoadmap(null);
      setDraft(startRoadmap(answers, now, null), false);
    } else {
      setDraft(
        startRoadmap(answers, now, draft ? summarize(draft, evidence) : null),
        true,
      );
    }
    setRetaking(false);
    track("roadmap_created", {
      phase: recommend(answers).phase,
      retake: state !== null,
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

  const keep = async () => {
    if (!draft) return;
    setKeeping(true);
    const next = keepRoadmap(
      draft,
      new Date(),
      kept ? summarize(kept, evidence) : null,
    );
    const res = await saveRoadmap(next).catch(() => ({ ok: false }) as const);
    setKeeping(false);
    if (!res.ok) {
      toast({ title: t("roadmap.saveError"), variant: "error" });
      return;
    }
    if (loaded.draftLocal) writeLocalRoadmap(null);
    setLoaded({ ...loaded, kept: next, draft: null, draftLocal: false });
    toast({ title: t("roadmap.kept"), variant: "success" });
    track("roadmap_kept", { phase: plan.phase, replaced: kept !== null });
  };

  const toggle = (id: StepId, done: boolean) => {
    const next = markStep(state, id, done, new Date());
    track("roadmap_step", { step: id, done });
    if (draft) {
      setDraft(next, loaded.draftLocal || !signedIn);
      return;
    }
    setLoaded({ ...loaded, kept: next });
    void saveRoadmap(next).then((res) => {
      if (!res.ok) toast({ title: t("roadmap.saveError"), variant: "error" });
    });
  };
  const retake = () => setRetaking(true);
  const when = schedule(state.startedAt, plan, new Date());

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_auto_1fr] lg:items-start">
      <RoadmapStatus
        status={
          !signedIn
            ? { kind: "guest" }
            : draft
              ? {
                  kind: "draft",
                  replacing: kept
                    ? {
                        phase: recommend(kept.answers).phase,
                        startedAt: kept.startedAt,
                      }
                    : null,
                  keeping,
                  onKeep: () => void keep(),
                  onDiscard: () => setDraft(null, loaded.draftLocal),
                }
              : { kind: "kept" }
        }
        onRetake={retake}
        className="lg:col-span-2 lg:row-start-1"
      />
      <RoadmapOverview
        plan={plan}
        steps={steps}
        schedule={when}
        className="lg:col-start-1 lg:row-start-2"
      />
      <aside className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:self-stretch">
        <StickyColumn className="space-y-6">
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
        </StickyColumn>
      </aside>
      <div className="min-w-0 lg:col-start-1 lg:row-start-3">
        <RoadmapTimeline
          steps={steps}
          docTitles={docTitles}
          onToggle={toggle}
          onRetake={retake}
        />
      </div>
    </div>
  );
};
