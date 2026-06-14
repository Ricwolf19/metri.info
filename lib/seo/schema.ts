import { absoluteUrl, siteUrl } from "@/lib/utils";

/** Organization schema — homepage/about. Establishes the brand entity. */
export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "METRI",
  url: siteUrl,
  logo: absoluteUrl("/icon.svg"),
  sameAs: ["https://github.com/Ricwolf19/metri"],
});

/** WebSite schema with a SearchAction (enables a sitelinks search box). */
export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "METRI",
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

/** BreadcrumbList — pass ordered { name, url } crumbs. */
export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.url),
  })),
});
