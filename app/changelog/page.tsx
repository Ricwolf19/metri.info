import type { Metadata } from "next";

import { ChangelogView } from "@/components/changelog/ChangelogView";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "What's new on Metri — releases and improvements to the web app, plus the mobile app roadmap.",
  alternates: metaAlternates("changelog", "en"),
};

const ChangelogPage = () => <ChangelogView />;

export default ChangelogPage;
