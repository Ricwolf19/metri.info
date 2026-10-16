import {
  BookIcon,
  CalculatorIcon,
  DropletsIcon,
  DumbbellIcon,
  FlameIcon,
  HomeIcon,
  type IconProps,
  MoonIcon,
  TrendingUpIcon,
} from "@/components/icons";
import type { TranslationKey } from "@/lib/i18n/en";

/**
 * The knowledge-base taxonomy, importable from Client Components (the rest of
 * `lib/docs` is server-only because it reads MDX off disk). One place for the
 * order, the label keys, the icons and the index-page anchors.
 */
export const DOC_CATEGORIES = [
  "getting-started",
  "calculators",
  "nutrition",
  "training",
  "recovery",
  "supplements",
  "progress",
  "glossary",
] as const;

export type DocCategory = (typeof DOC_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<DocCategory, TranslationKey> = {
  "getting-started": "docs.category.gettingStarted",
  calculators: "docs.category.calculators",
  nutrition: "docs.category.nutrition",
  training: "docs.category.training",
  recovery: "docs.category.recovery",
  supplements: "docs.category.supplements",
  progress: "docs.category.progress",
  glossary: "docs.category.glossary",
};

export const CATEGORY_ICON: Record<
  DocCategory,
  React.ComponentType<IconProps>
> = {
  "getting-started": HomeIcon,
  calculators: CalculatorIcon,
  nutrition: DropletsIcon,
  training: DumbbellIcon,
  recovery: MoonIcon,
  supplements: FlameIcon,
  progress: TrendingUpIcon,
  glossary: BookIcon,
};

/** DOM id of a category's section on the docs index (`/docs#docs-training`). */
export const docsSectionId = (category: DocCategory) => `docs-${category}`;
