import { AppShowcase } from "@/components/marketing/AppShowcase";
import { DocsPreview } from "@/components/marketing/DocsPreview";
import { Hero } from "@/components/marketing/Hero";
import { OpenSourceCTA } from "@/components/marketing/OpenSourceCTA";
import { ToolsPreview } from "@/components/marketing/ToolsPreview";

/** Homepage composition — shared by the EN (/) and ES (/es) routes; sections
 * localize themselves via the i18n provider (locale from the URL). */
export const Home = () => (
  <>
    <Hero />
    <AppShowcase />
    <ToolsPreview />
    <DocsPreview />
    <OpenSourceCTA />
  </>
);
