import {
  ANALYTICS_TIME_ZONE,
  parseRange,
  type SearchParams,
  todayIn,
} from "./range";

/** An analytics page's URL, read: its params, today on the operator's clock
 * and the window they ask for. Request-time by nature (it reads the clock),
 * so pages call it only after awaiting `searchParams`. */
export const readAnalyticsRequest = async (
  searchParams: Promise<SearchParams>,
) => {
  const params = await searchParams;
  const today = todayIn(ANALYTICS_TIME_ZONE, new Date());
  return { params, today, window: parseRange(params, today) };
};

/** A Suspense key that changes with the window, so a new range shows the
 * loader instead of the previous range's numbers. */
export const windowKey = (w: { startDate: string; endDate: string }) =>
  `${w.startDate}:${w.endDate}`;
