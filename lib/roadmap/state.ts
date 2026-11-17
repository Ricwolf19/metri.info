import { type Answers, parseAnswers } from "./diagnostic";
import type { Phase } from "./recommend";
import { STEP_IDS, type StepId } from "./steps";

/**
 * A roadmap as it's stored: the diagnostic answers (the plan is derived from
 * them), when it started, which steps were ticked and the plans before it.
 * The same shape lives in localStorage for everyone and in the `roadmap` row
 * for an account; `parseRoadmap` guards both, since neither is trusted.
 */

export type PastPlan = {
  phase: Phase;
  startedAt: string;
  endedAt: string;
  done: number;
  total: number;
};

export type RoadmapState = {
  answers: Answers;
  startedAt: string;
  done: Partial<Record<StepId, string>>;
  history: PastPlan[];
};

/** Past plans kept; older ones fall off. */
const HISTORY_LIMIT = 12;

const PHASES: readonly Phase[] = ["cut", "bulk", "recomp", "maintain"];

const isIso = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 40 && !Number.isNaN(Date.parse(v));

const parseDone = (raw: unknown): Partial<Record<StepId, string>> => {
  const out: Partial<Record<StepId, string>> = {};
  if (typeof raw !== "object" || raw === null) return out;
  for (const id of STEP_IDS) {
    const v = (raw as Record<string, unknown>)[id];
    if (isIso(v)) out[id] = v;
  }
  return out;
};

const parseHistory = (raw: unknown): PastPlan[] =>
  Array.isArray(raw)
    ? raw
        .flatMap((h): PastPlan[] => {
          if (typeof h !== "object" || h === null) return [];
          const r = h as Record<string, unknown>;
          const phase = PHASES.find((p) => p === r.phase);
          if (
            !phase ||
            !isIso(r.startedAt) ||
            !isIso(r.endedAt) ||
            typeof r.done !== "number" ||
            typeof r.total !== "number"
          )
            return [];
          return [
            {
              phase,
              startedAt: r.startedAt,
              endedAt: r.endedAt,
              done: Math.max(0, Math.floor(r.done)),
              total: Math.max(0, Math.floor(r.total)),
            },
          ];
        })
        .slice(0, HISTORY_LIMIT)
    : [];

export const parseRoadmap = (raw: unknown): RoadmapState | null => {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const answers = parseAnswers(r.answers);
  if (!answers || !isIso(r.startedAt)) return null;
  return {
    answers,
    startedAt: r.startedAt,
    done: parseDone(r.done),
    history: parseHistory(r.history),
  };
};

type Replaced = { state: RoadmapState; phase: Phase; total: number };

/** The history with the plan being replaced on top, with how far it got. */
const pushPast = (replaced: Replaced, now: Date): PastPlan[] =>
  [
    {
      phase: replaced.phase,
      startedAt: replaced.state.startedAt,
      endedAt: now.toISOString(),
      done: Object.keys(replaced.state.done).length,
      total: replaced.total,
    },
    ...replaced.state.history,
  ].slice(0, HISTORY_LIMIT);

/** A fresh roadmap from new answers; the one it replaces (if any) goes to
 * the top of the history with how far it got. */
export const startRoadmap = (
  answers: Answers,
  now: Date,
  previous: Replaced | null,
): RoadmapState => ({
  answers,
  startedAt: now.toISOString(),
  done: {},
  history: previous ? pushPast(previous, now) : [],
});

/** An account keeping a result it hadn't kept yet: the result keeps its
 * start date and the steps already ticked; the account's current plan, if
 * it had one, becomes the newest entry of the history. */
export const keepRoadmap = (
  draft: RoadmapState,
  now: Date,
  replacing: Replaced | null,
): RoadmapState => ({
  ...draft,
  history: replacing ? pushPast(replacing, now) : draft.history,
});

/** Tick or untick one step. */
export const markStep = (
  state: RoadmapState,
  id: StepId,
  on: boolean,
  now: Date,
): RoadmapState => {
  const done = { ...state.done };
  if (on) done[id] = now.toISOString();
  else delete done[id];
  return { ...state, done };
};
