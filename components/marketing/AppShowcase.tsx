"use client";

import { motion } from "framer-motion";

import {
  CodeIcon,
  TrendingUpIcon,
  WifiOffIcon,
  ZapIcon,
  type IconProps,
} from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { GradientText } from "@/components/shared/GradientText";
import { PhoneMockup } from "@/components/marketing/PhoneMockup";
import { inViewOnce } from "@/lib/animations";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";

const FEATURES: {
  icon: React.ComponentType<IconProps>;
  key: TranslationKey;
}[] = [
  { icon: ZapIcon, key: "showcase.feature1" },
  { icon: WifiOffIcon, key: "showcase.feature2" },
  { icon: TrendingUpIcon, key: "showcase.feature3" },
  { icon: CodeIcon, key: "showcase.feature4" },
];

export const AppShowcase = () => {
  const t = useT();

  return (
    <section className="border-y border-ink-600/40 bg-ink-850 py-20 sm:py-28">
      <Container className="grid items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1 text-xs font-medium text-accent">
            {t("showcase.badge")}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-ink-50 sm:text-4xl">
            {t("showcase.title")}{" "}
            <GradientText>{t("showcase.highlight")}</GradientText>
          </h2>
          <p className="mt-4 max-w-md text-ink-300">{t("showcase.subtitle")}</p>

          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime-400/10 text-accent">
                  <Icon size={16} />
                </span>
                <span className="text-sm text-ink-200">{t(key)}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.5 }}
        >
          <PhoneMockup />
        </motion.div>
      </Container>
    </section>
  );
};
