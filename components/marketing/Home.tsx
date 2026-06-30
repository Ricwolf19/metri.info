import { AppShowcase } from "@/components/marketing/AppShowcase";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
import { Bento } from "@/components/marketing/Bento";
import { DocsPreview } from "@/components/marketing/DocsPreview";
import { Hero } from "@/components/marketing/Hero";
import { OpenSourceCTA } from "@/components/marketing/OpenSourceCTA";
import { ToolsPreview } from "@/components/marketing/ToolsPreview";

/** Homepage composition — shared by EN (/) and ES (/es); sections localize via
 * the i18n provider (locale from the URL). */
export const Home = () => (
  <>
    <Hero />
    <Bento />
    <ToolsPreview />
    <DocsPreview />
    <BenefitsSection />
    <AppShowcase />
    <OpenSourceCTA />
  </>
);
