import {
  type IconProps,
  CheckIcon,
  FlameIcon,
  ShieldIcon,
} from "@/components/icons";
import { createT, type Locale } from "@/lib/i18n/config";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

type CalloutType = "tip" | "info" | "warning";

/** The kind, in words: icon and tint alone don't say "warning". */
const LABEL: Record<CalloutType, TranslationKey> = {
  tip: "docs.callout.tip",
  info: "docs.callout.info",
  warning: "docs.callout.warning",
};

const STYLES: Record<
  CalloutType,
  { icon: React.ComponentType<IconProps>; cls: string; iconCls: string }
> = {
  tip: {
    icon: CheckIcon,
    cls: "border-lime-400/30 bg-lime-400/[0.06]",
    iconCls: "text-accent",
  },
  info: {
    icon: ShieldIcon,
    cls: "border-ink-500/25 bg-ink-700/40",
    iconCls: "text-ink-200",
  },
  warning: {
    icon: FlameIcon,
    cls: "border-flame/30 bg-flame/[0.06]",
    iconCls: "text-flame",
  },
};

/** Used inside MDX: <Callout type="tip">…</Callout> */
export const Callout = ({
  type = "info",
  locale = "en",
  children,
}: {
  type?: CalloutType;
  locale?: Locale;
  children: React.ReactNode;
}) => {
  const { icon: Icon, cls, iconCls } = STYLES[type];
  return (
    <div
      role="note"
      className={cn("my-6 flex gap-3 rounded-xl border p-4", cls)}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", iconCls)} />
      <div className="text-sm leading-relaxed text-ink-200 [&>p]:my-0">
        <span className="sr-only">{createT(locale)(LABEL[type])}: </span>
        {children}
      </div>
    </div>
  );
};
