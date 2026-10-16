import { AppTour } from "@/components/marketing/AppTour";
import { Hero } from "@/components/marketing/Hero";
import { Marquees } from "@/components/marketing/Marquees";
import { PlansSection } from "@/components/marketing/PlansSection";
import { WebPreview } from "@/components/marketing/WebPreview";
import { MotionProvider } from "@/components/motion/MotionProvider";
import type { Locale } from "@/lib/i18n/config";

/** Homepage composition — shared by EN (/) and ES (/es). Five beats: the hero,
 * the two link strips, the app tour, the web half, and the plans with the
 * ownership promise. The hero stays outside the motion runtime on purpose: it
 * animates with CSS so it paints before hydration. */
export const Home = ({ locale }: { locale: Locale }) => (
  <>
    <Hero />
    <Marquees locale={locale} />
    <MotionProvider>
      <AppTour />
      <WebPreview />
      <PlansSection />
    </MotionProvider>
  </>
);
