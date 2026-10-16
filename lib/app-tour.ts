import type { ComponentType } from "react";

import {
  AppleIcon,
  CompassIcon,
  DumbbellIcon,
  HomeIcon,
  type IconProps,
  TrendingUpIcon,
} from "@/components/icons";
import type { TranslationKey } from "@/lib/i18n/en";

export type TourStepId = "home" | "train" | "metrics" | "nutrition" | "explore";

export type TourStep = {
  id: TourStepId;
  icon: ComponentType<IconProps>;
  tabKey: TranslationKey;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  pointKeys: [TranslationKey, TranslationKey, TranslationKey];
  /** Real capture under `public/images/app-screenshots/`; null = CSS mockup. */
  image: string | null;
};

/** The five tabs of the mobile app, in the app's own order. Mirrors
 * `src/app/(tabs)/_layout.tsx` in the mobile repo. */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "home",
    icon: HomeIcon,
    tabKey: "tour.tab.home",
    titleKey: "tour.home.title",
    bodyKey: "tour.home.body",
    pointKeys: ["tour.home.p1", "tour.home.p2", "tour.home.p3"],
    image: null,
  },
  {
    id: "train",
    icon: DumbbellIcon,
    tabKey: "tour.tab.train",
    titleKey: "tour.train.title",
    bodyKey: "tour.train.body",
    pointKeys: ["tour.train.p1", "tour.train.p2", "tour.train.p3"],
    image: null,
  },
  {
    id: "metrics",
    icon: TrendingUpIcon,
    tabKey: "tour.tab.metrics",
    titleKey: "tour.metrics.title",
    bodyKey: "tour.metrics.body",
    pointKeys: ["tour.metrics.p1", "tour.metrics.p2", "tour.metrics.p3"],
    image: null,
  },
  {
    id: "nutrition",
    icon: AppleIcon,
    tabKey: "tour.tab.nutrition",
    titleKey: "tour.nutrition.title",
    bodyKey: "tour.nutrition.body",
    pointKeys: ["tour.nutrition.p1", "tour.nutrition.p2", "tour.nutrition.p3"],
    image: null,
  },
  {
    id: "explore",
    icon: CompassIcon,
    tabKey: "tour.tab.explore",
    titleKey: "tour.explore.title",
    bodyKey: "tour.explore.body",
    pointKeys: ["tour.explore.p1", "tour.explore.p2", "tour.explore.p3"],
    image: null,
  },
];
