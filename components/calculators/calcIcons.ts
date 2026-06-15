import type { ComponentType } from "react";

import {
  ActivityIcon,
  AppleIcon,
  CalculatorIcon,
  DropletsIcon,
  DumbbellIcon,
  FlameIcon,
  type IconProps,
  RulerIcon,
  ScaleIcon,
} from "@/components/icons";
import type { CalcRouteId } from "@/lib/i18n/routes";

/** One icon per calculator — shared by the tools index, related lists, etc. */
export const CALC_ICONS: Record<CalcRouteId, ComponentType<IconProps>> = {
  onerm: DumbbellIcon,
  tdee: FlameIcon,
  macros: AppleIcon,
  bodyfat: ScaleIcon,
  bmi: RulerIcon,
  ffmi: ActivityIcon,
  water: DropletsIcon,
  plates: CalculatorIcon,
};
