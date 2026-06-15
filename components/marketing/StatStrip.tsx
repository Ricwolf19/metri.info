"use client";

import { Container } from "@/components/shared/Container";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";

const STATS: { value: string; key: TranslationKey }[] = [
  { value: "8", key: "stats.calculators" },
  { value: "100%", key: "stats.private" },
  { value: "0", key: "stats.account" },
  { value: "MIT", key: "stats.license" },
];

/** Compact trust band under the hero — quick proof points, no JS gating. */
export const StatStrip = () => {
  const t = useT();

  return (
    <section className="pb-4 sm:pb-10">
      <Container>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-ink-600 bg-ink-600 sm:grid-cols-4">
          {STATS.map(({ value, key }) => (
            <div
              key={key}
              className="flex flex-col items-center bg-ink-850 px-4 py-8 text-center"
            >
              <p className="text-3xl font-bold tracking-tight text-ink-50">
                {value}
              </p>
              <p className="mt-1 text-sm text-ink-400">{t(key)}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
