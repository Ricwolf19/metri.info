import { Card, Placeholder } from "@/components/admin/ui";
import {
  type AnalyticsSource,
  SOURCES,
  sourceMode,
} from "@/lib/analytics/sources";

const isEmptyList = (data: unknown) => Array.isArray(data) && data.length === 0;

/**
 * A dashboard card fed by one upstream. It owns the ways a card can be
 * without real content, so no panel repeats them: the source isn't connected
 * (says which keys to set), it didn't answer (`data === null`), or it
 * answered with nothing in the range. Otherwise `children` renders the data —
 * badged "Simulated" when a dev server made it up.
 */
export const SourceCard = <T,>({
  source,
  data,
  title,
  subtitle,
  className,
  empty = "Nothing in this range yet.",
  isEmpty = isEmptyList,
  children,
}: {
  source: AnalyticsSource;
  data: T | null;
  title: string;
  subtitle?: string;
  className?: string;
  empty?: string;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}) => {
  const mode = sourceMode(source);
  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={className}
      aside={mode === "simulated" ? <SimulatedBadge /> : null}
    >
      {mode === "off" ? (
        <ConnectHint source={source} />
      ) : data === null ? (
        <Placeholder>
          {SOURCES[source].label} didn&apos;t answer. The keys are set; it may
          be rate limiting or down, so try again in a minute.
        </Placeholder>
      ) : isEmpty(data) ? (
        <Placeholder>{empty}</Placeholder>
      ) : (
        children(data)
      )}
    </Card>
  );
};

/** "Connect PostHog: set …", for a card or a whole section. */
export const ConnectHint = ({ source }: { source: AnalyticsSource }) => (
  <Placeholder>
    Connect {SOURCES[source].label}. {SOURCES[source].setup}
  </Placeholder>
);

/** Marks numbers a dev server made up, so they're never read as real. */
export const SimulatedBadge = () => (
  <span className="shrink-0 rounded-full border border-flame/40 px-2 py-0.5 font-mono text-[10px] tracking-wide whitespace-nowrap text-flame uppercase">
    Simulated
  </span>
);

/**
 * The top of a dashboard tab: one connect card when its source is off (the
 * tab renders nothing else), a notice when it's simulated, nothing when live.
 */
export const SourceNotice = ({ source }: { source: AnalyticsSource }) => {
  const mode = sourceMode(source);
  if (mode === "live") return null;
  if (mode === "off")
    return (
      <Card title={SOURCES[source].label}>
        <ConnectHint source={source} />
      </Card>
    );
  return (
    <div
      role="note"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-card border border-flame/30 bg-flame/5 px-4 py-3 text-sm text-ink-200"
    >
      <SimulatedBadge />
      <span>
        Made-up {SOURCES[source].label} data: this dev server has no keys for
        it. Deployed builds never simulate. {SOURCES[source].setup}
      </span>
    </div>
  );
};
