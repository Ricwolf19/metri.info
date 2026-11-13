import { ConnectHint, SimulatedBadge } from "@/components/admin/SourceCard";
import { Card, fmt, Placeholder } from "@/components/admin/ui";
import {
  canonicalMismatch,
  coverageGroups,
  type Inspection,
  isIndexed,
} from "@/lib/analytics/search";
import { getIndexCoverage } from "@/lib/analytics/search-console";
import { sourceMode } from "@/lib/analytics/sources";
import { cn } from "@/lib/utils";

const ago = (iso: string | null) => {
  if (!iso) return "never crawled";
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  return days <= 0 ? "crawled today" : `crawled ${days} d ago`;
};

const UrlRow = ({ i }: { i: Inspection }) => (
  <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-1.5">
    <a
      href={i.url}
      target="_blank"
      rel="noreferrer noopener"
      className="min-w-0 truncate font-mono text-xs text-ink-100 hover:text-brand"
    >
      {new URL(i.url).pathname}
    </a>
    <span className="shrink-0 font-mono text-[11px] text-ink-500">
      {ago(i.lastCrawl)}
      {canonicalMismatch(i) ? " · Google picked another canonical" : ""}
    </span>
  </li>
);

/**
 * Every sitemap URL through the URL Inspection API, grouped the way the Page
 * indexing report groups them ("Discovered - currently not indexed"…), but
 * per URL with its last crawl. Each answer is cached a day, so a full sweep
 * costs one quota unit per URL per day. Streams on its own: a cold sweep
 * takes a while.
 */
export const IndexCoverage = async () => {
  const mode = sourceMode("gsc");
  if (mode === "off")
    return (
      <Card title="Index coverage">
        <ConnectHint source="gsc" />
      </Card>
    );
  const sweep = await getIndexCoverage();
  if (!sweep)
    return (
      <Card title="Index coverage">
        <Placeholder>
          URL Inspection didn&apos;t answer. The service account needs to be a
          user on the Search Console property.
        </Placeholder>
      </Card>
    );
  const indexed = sweep.inspections.filter(isIndexed).length;
  const groups = coverageGroups(sweep.inspections);
  return (
    <Card
      title="Index coverage"
      aside={mode === "simulated" ? <SimulatedBadge /> : null}
      subtitle={`URL Inspection on every sitemap URL · ${fmt(indexed)} of ${fmt(sweep.total)} indexed${sweep.failed ? ` · ${fmt(sweep.failed)} didn't answer` : ""} · refreshed daily`}
    >
      <ul className="space-y-2">
        {groups.map((g) => (
          <li key={g.coverage}>
            <details className="group rounded-lg border border-ink-700 bg-ink-850/60">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 focus-visible:ring-2 focus-visible:ring-brand/55 focus-visible:outline-none">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      g.indexed ? "bg-lime-400" : "bg-flame",
                    )}
                  />
                  <span className="truncate text-sm text-ink-100">
                    {g.coverage}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-sm text-ink-300">
                  {fmt(g.urls.length)}
                </span>
              </summary>
              <ul className="divide-y divide-ink-700 border-t border-ink-700 px-3">
                {g.urls.map((i) => (
                  <UrlRow key={i.url} i={i} />
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </Card>
  );
};
