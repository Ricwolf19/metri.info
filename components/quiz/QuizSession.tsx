import { MotionProvider } from "@/components/motion/MotionProvider";
import { QuizFlow } from "@/components/quiz/QuizFlow";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/entitlements";
import { decodeScores, type StoredResult } from "@/lib/quiz/scores";
import { listAttempts } from "@/lib/quiz/store";

export type QuizSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

/** The per-visitor half of the quiz page: reads the session (so the public
 * hero above stays static behind a Suspense boundary), finds the account's
 * latest saved attempt, decodes a shared result from `?r=`, and mounts the
 * flow. */
export const QuizSession = async ({
  searchParams,
}: {
  searchParams: QuizSearchParams;
}) => {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  const r = params.r;
  const shared = decodeScores(typeof r === "string" ? r : null);
  const plan = (session?.user as { plan?: string | null } | undefined)?.plan;
  const signedIn = Boolean(session);
  const canSave = signedIn && can(plan, "history");
  let initial: StoredResult | null = null;
  if (session && canSave) {
    const [latest] = await listAttempts(session.user.id, 1);
    if (latest)
      initial = {
        scores: latest.scores,
        at: latest.createdAt.toISOString(),
        misses: latest.misses,
      };
  }
  return (
    <MotionProvider>
      <QuizFlow
        initial={initial}
        shared={shared}
        canSave={canSave}
        signedIn={signedIn}
      />
    </MotionProvider>
  );
};
