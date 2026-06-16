import { absoluteUrl, siteUrl } from "@/lib/utils";

/** Organization schema — homepage/about. Establishes the brand entity. */
export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Metri",
  url: siteUrl,
  logo: absoluteUrl("/icon.svg"),
  sameAs: ["https://github.com/Ricwolf19/metri"],
});

/** WebSite schema with a SearchAction (enables a sitelinks search box). */
export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Metri",
  url: siteUrl,
  inLanguage: ["en", "es"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/docs?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});
