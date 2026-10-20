import Link from "next/link";
import { Suspense } from "react";

import { AccountFavorites } from "@/components/account/AccountFavorites";
import {
  HistoryData,
  type HistorySearchParams,
} from "@/components/account/HistoryData";
import { SyncedActivity } from "@/components/account/SyncedActivity";
import { QuizHistory } from "@/components/quiz/QuizHistory";
import { ArrowLeftIcon, ArrowRightIcon, ScaleIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { PageHero } from "@/components/shared/PageHero";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";

const Block = ({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="mt-12 scroll-mt-24 first:mt-0">
    <h2 className="text-lg font-semibold text-ink-50">{title}</h2>
    <p className="mt-1 text-sm text-ink-300">{subtitle}</p>
    <div className="mt-5">{children}</div>
  </section>
);

/** "My activity" — what the app synced (Premium), favorites and calculation
 * history. Shared by /account/activity and /es/cuenta/actividad. */
export const ActivityView = ({
  userId,
  plan,
  locale,
  historyParams,
}: {
  userId: string;
  plan: string | null | undefined;
  locale: Locale;
  historyParams: HistorySearchParams;
}) => {
  const t = createT(locale);

  return (
    <>
      <PageHero
        eyebrow={t("account.activityEyebrow")}
        title={t("account.activityTitle")}
        subtitle={t("account.activitySubtitle")}
        align="left"
        compact
      >
        <Link
          href={routePath("account", locale)}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-300 transition-colors hover:text-accent"
        >
          <ArrowLeftIcon size={16} />
          {t("account.backToAccount")}
        </Link>
      </PageHero>

      <Container className="py-10 sm:py-14">
        <Block
          id="synced"
          title={t("activity.sync.title")}
          subtitle={t("activity.sync.subtitle")}
        >
          <SyncedActivity userId={userId} plan={plan} locale={locale} />
          <Link
            href={routePath("body", locale)}
            className="mt-4 inline-flex items-center gap-2 rounded-field border border-ink-600 px-4 py-2.5 text-sm font-medium text-ink-100 transition-colors hover:border-brand/50 hover:text-ink-50"
          >
            <ScaleIcon size={16} className="text-brand" />
            {t("body.link")}
            <ArrowRightIcon size={16} className="text-ink-400" />
          </Link>
        </Block>

        <Block
          id="quiz"
          title={t("quiz.historyTitle")}
          subtitle={t("quiz.historySubtitle")}
        >
          <QuizHistory userId={userId} locale={locale} />
        </Block>

        <Block
          title={t("account.favoritesTitle")}
          subtitle={t("account.favoritesSubtitle")}
        >
          <AccountFavorites userId={userId} locale={locale} />
        </Block>

        <Block
          id="history"
          title={t("account.historyTitle")}
          subtitle={t("account.historySubtitle")}
        >
          <Suspense fallback={<LoadingScreen label={t("common.loading")} />}>
            <HistoryData
              userId={userId}
              locale={locale}
              searchParams={historyParams}
            />
          </Suspense>
        </Block>
      </Container>
    </>
  );
};
