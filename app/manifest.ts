import type { MetadataRoute } from "next";

/** PWA manifest — served at /manifest.webmanifest. */
const manifest = (): MetadataRoute.Manifest => ({
  name: "METRI — Open-source fitness tracker",
  short_name: "METRI",
  description:
    "Free fitness calculators, structured programs and an evidence-based knowledge base. Offline-first and open source.",
  start_url: "/",
  display: "standalone",
  background_color: "#0b0d12",
  theme_color: "#0b0d12",
  orientation: "portrait",
  scope: "/",
  categories: ["health", "fitness", "lifestyle"],
  lang: "en",
  dir: "ltr",
  icons: [
    {
      src: "/brand/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/brand/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/brand/android-icon-foreground.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
});

export default manifest;
