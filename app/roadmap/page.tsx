import type { Metadata } from "next";

import { RoadmapView } from "@/components/roadmap/RoadmapView";
import { sectionMetadata } from "@/lib/seo/pages";

export const metadata: Metadata = sectionMetadata("roadmap", "en");

const RoadmapPage = () => <RoadmapView locale="en" />;

export default RoadmapPage;
