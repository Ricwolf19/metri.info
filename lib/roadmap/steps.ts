import type { RouteId } from "@/lib/i18n/routes";

import type { Answers } from "./diagnostic";
import { leadWeeks, type Phase, type Plan } from "./recommend";

/**
 * The roadmap: what to do, in order, for the plan the diagnostic produced.
 * Four stages (know where you start, set the phase up, run it, finish it);
 * each step links the guide or calculator that does the work. Only the person
 * ticks a step: a saved calculation or a quiz attempt doesn't mean the step
 * is learned, so nothing the account shows ever ticks one for them.
 * Step ids are stored (the done map), so add steps, never rename them.
 */

export const STAGES = ["baseline", "setup", "run", "finish"] as const;
type Stage = (typeof STAGES)[number];

export const STEP_IDS = [
  "measure",
  "maintenance",
  "knowledge",
  "sleep",
  "tracking",
  "dietBreak",
  "foundations",
  "calories",
  "protein",
  "training",
  "quality",
  "weighins",
  "checkins",
  "adjust",
  "transition",
  "reassess",
] as const;
export type StepId = (typeof STEP_IDS)[number];

export type StepLink = { doc: string } | { route: RouteId };

type StepDef = {
  id: StepId;
  stage: Stage;
  /** A step's links depend only on the phase. */
  links: (phase: Phase) => StepLink[];
  include?: (a: Answers, plan: Plan) => boolean;
};

const STEPS: StepDef[] = [
  {
    id: "measure",
    stage: "baseline",
    links: () => [{ doc: "measuring-progress" }, { route: "bodyfat" }],
  },
  {
    id: "maintenance",
    stage: "baseline",
    links: () => [{ route: "tdee" }, { doc: "tdee" }],
  },
  {
    id: "knowledge",
    stage: "baseline",
    links: () => [{ route: "quiz" }],
  },
  {
    id: "sleep",
    stage: "baseline",
    links: () => [{ doc: "sleep-quality" }, { doc: "sleep" }],
    include: (a) => a.sleep !== "seven_plus",
  },
  {
    id: "tracking",
    stage: "baseline",
    links: () => [{ doc: "tracking-food" }, { doc: "macros" }],
    include: (a) => a.tracking !== "now",
  },
  {
    id: "dietBreak",
    stage: "setup",
    links: () => [{ doc: "adaptive-thermogenesis" }],
    include: (_, p) => p.lead === "dietBreak",
  },
  {
    id: "foundations",
    stage: "setup",
    links: () => [
      { doc: "how-a-program-works" },
      { doc: "progressive-overload" },
    ],
    include: (_, p) => p.lead === "foundations",
  },
  {
    id: "calories",
    stage: "setup",
    links: (phase) =>
      phase === "cut"
        ? [{ route: "deficit" }, { doc: "choosing-your-phase" }]
        : phase === "bulk"
          ? [{ route: "macros" }, { doc: "choosing-your-phase" }]
          : [{ route: "macros" }, { doc: "personalizing-your-diet" }],
  },
  {
    id: "protein",
    stage: "setup",
    links: () => [{ route: "protein" }, { doc: "macros" }],
  },
  {
    id: "training",
    stage: "setup",
    links: () => [
      { doc: "how-a-program-works" },
      { doc: "progressive-overload" },
      { doc: "volume-frequency" },
    ],
    include: (_, p) => p.lead !== "foundations",
  },
  {
    id: "quality",
    stage: "setup",
    links: () => [{ doc: "diet-quality" }, { doc: "insulin-sensitivity" }],
    include: (_, p) => p.phase === "bulk",
  },
  {
    id: "weighins",
    stage: "run",
    links: () => [{ doc: "weight-tracking" }],
  },
  {
    id: "checkins",
    stage: "run",
    links: () => [{ doc: "reading-your-numbers" }],
  },
  {
    id: "adjust",
    stage: "run",
    links: (phase) =>
      phase === "cut"
        ? [{ doc: "breaking-a-plateau" }, { doc: "adaptive-thermogenesis" }]
        : [{ doc: "personalizing-your-diet" }, { doc: "breaking-a-plateau" }],
  },
  {
    id: "transition",
    stage: "finish",
    links: (phase) =>
      phase === "cut"
        ? [{ doc: "adaptive-thermogenesis" }, { doc: "choosing-your-phase" }]
        : [{ doc: "choosing-your-phase" }],
  },
  { id: "reassess", stage: "finish", links: () => [] },
];

type StepStatus = "done" | "current" | "todo";

export type RoadmapStep = {
  id: StepId;
  stage: Stage;
  links: StepLink[];
  status: StepStatus;
  /** When the person ticked it, ISO. */
  doneAt: string | null;
};

/** The plan's steps in order, each with its status; the first one not done
 * is `current` (where you are). */
export const roadmapSteps = ({
  answers,
  plan,
  done,
}: {
  answers: Answers;
  plan: Plan;
  done: Partial<Record<StepId, string>>;
}): RoadmapStep[] => {
  let currentSet = false;
  return STEPS.filter((s) => !s.include || s.include(answers, plan)).map(
    (s) => {
      const doneAt = done[s.id] ?? null;
      let status: StepStatus = doneAt ? "done" : "todo";
      if (status === "todo" && !currentSet) {
        status = "current";
        currentSet = true;
      }
      return {
        id: s.id,
        stage: s.stage,
        links: s.links(plan.phase),
        status,
        doneAt,
      };
    },
  );
};

const DAY_MS = 86_400_000;

export type Schedule = {
  /** The phase proper starts here, after any lead-in. ISO date. */
  phaseStart: string;
  phaseEnd: string;
  /** Week of the whole plan we're in now, from 1. */
  week: number;
  totalWeeks: number;
  /** Where today falls. */
  now: "lead" | "phase" | "over";
};

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** The plan on a calendar: when the lead-in ends, when the block ends and
 * which week today is. */
export const schedule = (
  startedAt: string,
  plan: Plan,
  now: Date,
): Schedule => {
  const start = Date.parse(startedAt);
  const lead = leadWeeks(plan.lead);
  const totalWeeks = lead + plan.blockWeeks;
  const phaseStart = start + lead * 7 * DAY_MS;
  const phaseEnd = start + totalWeeks * 7 * DAY_MS;
  const elapsed = Math.max(0, now.getTime() - start);
  const week = Math.min(totalWeeks, Math.floor(elapsed / (7 * DAY_MS)) + 1);
  return {
    phaseStart: isoDay(phaseStart),
    phaseEnd: isoDay(phaseEnd),
    week,
    totalWeeks,
    now:
      now.getTime() >= phaseEnd
        ? "over"
        : now.getTime() >= phaseStart
          ? "phase"
          : "lead",
  };
};

/** Every guide the roadmap can point at, for checks and title lookups. */
export const ROADMAP_DOCS: readonly string[] = [
  ...new Set([
    ...STEPS.flatMap((s) =>
      (["cut", "bulk", "recomp", "maintain"] as const).flatMap((phase) =>
        s.links(phase).flatMap((l) => ("doc" in l ? [l.doc] : [])),
      ),
    ),
    // The plan summary links these two directly.
    "choosing-your-phase",
    "somatotypes",
  ]),
];
