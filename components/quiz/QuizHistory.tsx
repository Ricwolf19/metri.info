import { QuizPromo } from "@/components/quiz/QuizPromo";
import { QuizResult } from "@/components/quiz/QuizResult";
import { createT, intlLocale, type Locale } from "@/lib/i18n/config";
import { AREA_SHORT_KEY, QUIZ_AREAS } from "@/lib/quiz/areas";
import { listAttempts } from "@/lib/quiz/store";

/**
 * The activity page's knowledge-check block: the latest map with its review
 * list and study plan, the earlier attempts underneath, and the card to take
 * it again. Every signed-in account keeps its attempts.
 */
export const QuizHistory = async ({
  userId,
  locale,
}: {
  userId: string;
  locale: Locale;
}) => {
  const t = createT(locale);
  const attempts = await listAttempts(userId, 8);
  if (attempts.length === 0) {
    return (
      <div className="space-y-3">
        <QuizPromo />
        <p className="text-sm text-ink-400">{t("quiz.historyEmpty")}</p>
      </div>
    );
  }
  const [latest, ...earlier] = attempts;
  const fmt = new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <div className="rounded-card border border-ink-600 bg-ink-800 p-5 sm:p-6">
      <p className="font-mono text-[11px] font-medium tracking-widest text-ink-400 uppercase">
        {t("quiz.lastTaken", { date: fmt.format(latest.createdAt) })} ·{" "}
        {t("quiz.attemptMeta", { n: latest.asked })}
      </p>
      <div className="mt-4">
        <QuizResult
          locale={locale}
          scores={latest.scores}
          misses={latest.misses}
          compact
        />
      </div>
      {earlier.length > 0 && (
        <ul className="mt-6 divide-y divide-ink-700 border-t border-ink-700">
          {earlier.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
            >
              <span className="text-ink-300">{fmt.format(a.createdAt)}</span>
              <span className="flex flex-wrap gap-x-3 font-mono text-xs text-ink-400">
                {QUIZ_AREAS.map((area) => (
                  <span key={area}>
                    {t(AREA_SHORT_KEY[area])}{" "}
                    <span className="text-ink-100">{a.scores[area]}</span>/4
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5">
        <QuizPromo compact />
      </div>
    </div>
  );
};
