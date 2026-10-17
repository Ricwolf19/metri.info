import { loadInitialList, type SearchParamsLike } from "listkit/server";

import { HistoryList } from "@/components/account/HistoryList";
import { listMyCalculations } from "@/app/account/activity/actions";
import type { Locale } from "@/lib/i18n/config";
import { historyListConfig } from "@/lib/lists/history";

export type HistorySearchParams = SearchParamsLike;

/** Server half of the history list: derives the first query from the URL and
 * fetches that page, so the rows are in the HTML and the client skips a fetch. */
export const HistoryData = async ({
  userId,
  locale,
  searchParams,
}: {
  userId: string;
  locale: Locale;
  searchParams: HistorySearchParams;
}) => {
  const { initialData, initialQuery } = await loadInitialList(
    historyListConfig(locale),
    searchParams,
    listMyCalculations,
  );
  return (
    <HistoryList
      userId={userId}
      locale={locale}
      initialData={initialData}
      initialQuery={initialQuery}
    />
  );
};
