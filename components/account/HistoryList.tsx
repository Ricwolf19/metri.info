"use client";

import type { ListQuery, ListResult } from "listkit";
import { ES_LABELS, serverActionAdapter } from "listkit";
import { NextListView } from "listkit/next";
import { useMemo } from "react";

import { listMyCalculations } from "@/app/account/activity/actions";
import type { Locale } from "@/lib/i18n/config";
import { type HistoryRow, historyListConfig } from "@/lib/lists/history";

/** The account's calculation history: server-seeded, server-paged, localized. */
export const HistoryList = ({
  userId,
  locale,
  initialData,
  initialQuery,
}: {
  /** Scopes listkit's client cache so a sign-out never serves another account's page. */
  userId: string;
  locale: Locale;
  /** The server-fetched first page; absent when that fetch failed and the
   * list falls back to fetching on the client. */
  initialData?: ListResult<HistoryRow>;
  initialQuery: ListQuery;
}) => {
  const config = useMemo(() => historyListConfig(locale), [locale]);
  const adapter = useMemo(
    () => serverActionAdapter<HistoryRow>(listMyCalculations),
    [],
  );
  return (
    <NextListView
      config={config}
      adapter={adapter}
      cacheScope={userId}
      labels={locale === "es" ? ES_LABELS : undefined}
      initialData={initialData}
      initialQuery={initialQuery}
      paginationVariant="inline"
    />
  );
};
