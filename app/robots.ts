import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: ["/api/"],
  },
  sitemap: absoluteUrl("/sitemap.xml"),
  host: absoluteUrl(""),
});

export default robots;
