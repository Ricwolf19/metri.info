import type { Metadata } from "next";

import { Home } from "@/components/marketing/Home";
import { JsonLd } from "@/components/seo/JsonLd";
import { metaAlternates } from "@/lib/i18n/routes";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  alternates: metaAlternates("home", "en"),
};

const HomePage = () => (
  <>
    <JsonLd data={[organizationSchema(), websiteSchema()]} />
    <Home />
  </>
);

export default HomePage;
