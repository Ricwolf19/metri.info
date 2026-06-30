"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { SearchIcon } from "@/components/icons";
import { useSession } from "@/lib/auth/client";
import {
  type Command,
  type CommandDoc,
  type CommandGroup,
  GROUP_LABEL,
  buildCommands,
} from "@/lib/commands/registry";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n";
import { textMatches } from "@/lib/search";
import { cn } from "@/lib/utils";

const ORDER: CommandGroup[] = ["pages", "calculators", "docs", "account"];

export type DocsIndex = Record<Locale, CommandDoc[]>;

/**
 * ⌘K command palette — jump to any page, calculator or account section. Keyboard
 * driven (↑/↓ to move, ↵ to open, Esc to close) with hover + click support.
 * Commands come from the scalable `buildCommands` registry.
 */
export const CommandPalette = ({
  open,
  onOpenChange,
  docsIndex,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docsIndex: DocsIndex;
}) => {
  const { t, locale } = useI18n();
  const { data } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(
    () =>
      buildCommands(t, locale, { signedIn: !!data, docs: docsIndex[locale] }),
    [t, locale, data, docsIndex],
  );

  const filtered = useMemo(
    () => commands.filter((c) => textMatches(query, c.label, c.keywords)),
    [commands, query],
  );

  // Reset is handled by remounting (CommandPaletteMount keys this component per
  // open), so there's no reset-in-effect here.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (command?: Command) => {
    if (!command) return;
    onOpenChange(false);
    router.push(command.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(filtered[active]);
    }
  };

  const groups = ORDER.map((group) => ({
    group,
    items: filtered.filter((c) => c.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 [animation:metri-overlay-in_0.2s_ease-out] bg-ink-950/70 backdrop-blur-sm" />
        <Dialog.Content
          onKeyDown={onKeyDown}
          className="fixed top-[12vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 [animation:metri-pop-in_0.15s_ease-out] overflow-hidden rounded-card border border-ink-600 bg-ink-900 shadow-2xl"
        >
          <Dialog.Title className="sr-only">{t("cmd.title")}</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-ink-700 px-4">
            <SearchIcon size={18} className="shrink-0 text-ink-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              placeholder={t("cmd.placeholder")}
              aria-label={t("cmd.placeholder")}
              className="h-12 flex-1 bg-transparent text-sm text-ink-50 placeholder:text-ink-400 focus:outline-none"
            />
            <kbd className="shrink-0 rounded border border-ink-600 px-1.5 py-0.5 font-mono text-[10px] text-ink-400">
              ESC
            </kbd>
          </div>

          <div
            ref={listRef}
            className="max-h-[min(60vh,24rem)] overflow-y-auto p-2"
          >
            {groups.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-ink-400">
                {t("cmd.empty")}
              </p>
            ) : (
              groups.map(({ group, items }) => (
                <div key={group} className="mb-1">
                  <p className="px-3 py-1.5 font-mono text-[10px] tracking-widest text-ink-500 uppercase">
                    {t(GROUP_LABEL[group])}
                  </p>
                  {items.map((command) => {
                    const idx = filtered.indexOf(command);
                    const isActive = idx === active;
                    const Icon = command.icon;
                    return (
                      <button
                        key={command.id}
                        type="button"
                        data-active={isActive || undefined}
                        onClick={() => go(command)}
                        onMouseMove={() => setActive(idx)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-field px-3 py-2.5 text-left text-sm transition-colors",
                          isActive ? "bg-ink-800 text-ink-50" : "text-ink-300",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                            isActive
                              ? "bg-brand/10 text-brand"
                              : "bg-ink-800 text-ink-400",
                          )}
                        >
                          <Icon size={15} />
                        </span>
                        <span className="flex-1 truncate">{command.label}</span>
                        {isActive && (
                          <kbd className="shrink-0 font-mono text-[10px] text-ink-500">
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
