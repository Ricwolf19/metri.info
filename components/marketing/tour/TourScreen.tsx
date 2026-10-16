"use client";

import Image from "next/image";

import { ExploreScreen } from "@/components/marketing/tour/ExploreScreen";
import { HomeScreen } from "@/components/marketing/tour/HomeScreen";
import { MetricsScreen } from "@/components/marketing/tour/MetricsScreen";
import { NutritionScreen } from "@/components/marketing/tour/NutritionScreen";
import { TrainScreen } from "@/components/marketing/tour/TrainScreen";
import type { TourStepId } from "@/lib/app-tour";

const MOCKUPS: Record<TourStepId, React.ComponentType> = {
  home: HomeScreen,
  train: TrainScreen,
  metrics: MetricsScreen,
  nutrition: NutritionScreen,
  explore: ExploreScreen,
};

/** A real capture when the step has one, otherwise the CSS mockup. Takes only
 * serializable props so Server Components (the download page) can render it. */
export const TourScreen = ({
  stepId,
  image,
  alt,
}: {
  stepId: TourStepId;
  image: string | null;
  alt: string;
}) => {
  if (image) {
    return (
      <Image
        src={image}
        alt={alt}
        fill
        sizes="272px"
        className="object-cover"
        priority={stepId === "home"}
      />
    );
  }
  const Mock = MOCKUPS[stepId];
  return <Mock />;
};
