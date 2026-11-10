import { EXERCISE_CATALOG } from "@/lib/training/catalog";

import {
  previousPeriod,
  type ReportInput,
  type ReportSession,
  type ReportSet,
} from "./monthly";

const index = new Map(
  EXERCISE_CATALOG.map((e) => [
    e.id,
    { primary: e.primary, secondary: e.secondary, category: e.category },
  ]),
);

const day = (period: string, n: number) =>
  `${period}-${String(n).padStart(2, "0")}`;

const SESSION_DAYS = [2, 5, 8, 11, 14, 17, 20, 23, 26];
const LIFTS: [id: string, startKg: number][] = [
  ["barbell-bench-press", 80],
  ["barbell-back-squat", 110],
  ["lat-pulldown", 60],
  ["overhead-press", 45],
];

/**
 * A steady lifter on a cut: four months of sessions with loads creeping up.
 * Shared by the tests (which bend it into each edge case) and the email/PDF
 * preview script.
 */
export const demoReportInput = (period = "2026-10"): ReportInput => {
  const periods = [3, 2, 1, 0].map((n) =>
    n === 0 ? period : previousPeriod(period, n),
  );
  const sessions: ReportSession[] = [];
  const sets: ReportSet[] = [];
  periods.forEach((p, monthIndex) => {
    for (const d of SESSION_DAYS) {
      const date = day(p, d);
      const id = `${date}-log`;
      sessions.push({ id, date, durationSeconds: 3600 });
      for (const [exerciseId, startKg] of LIFTS) {
        for (let s = 0; s < 4; s++) {
          sets.push({
            exerciseId,
            reps: 8,
            weightKg: startKg + monthIndex * 2.5,
            rir: 2,
            isFailure: false,
            at: Date.parse(`${date}T18:00:00Z`),
            date,
          });
        }
      }
    }
  });
  const weighIns = Array.from({ length: 28 }, (_, i) => ({
    date: day(period, i + 1),
    weightKg: 84 - i * 0.05,
  }));
  return {
    period,
    sessions,
    sets,
    skippedDays: [day(period, 9)],
    weighIns,
    tape: [
      { site: "waist", date: day(previousPeriod(period), 28), cm: 88 },
      { site: "waist", date: day(period, 27), cm: 87.2 },
    ],
    food: Array.from({ length: 24 }, (_, i) => ({
      date: day(period, i + 1),
      kcal: 2150,
      proteinG: 165,
    })),
    goal: { phase: "cut", targetKcal: 2200, proteinG: 170 },
    index,
    keySite: "waist",
  };
};
