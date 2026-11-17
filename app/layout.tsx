import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ConsentedGA } from "@/components/analytics/ConsentedGA";
import { CommandLauncher } from "@/components/command/CommandLauncher";
import { CommandPaletteMount } from "@/components/command/CommandPaletteMount";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { ToolNames } from "@/components/layout/site-nav";
import { MAIN_ID, SkipLink } from "@/components/layout/SkipLink";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Providers } from "@/components/providers";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { CALC_CONTENT } from "@/lib/calculators/content";
import { getDocsIndex } from "@/lib/docs";
import { featuredDocTitles } from "@/lib/docs/featured";
import { CALC_IDS } from "@/lib/i18n/routes";
import { HTML_LANG_SCRIPT } from "@/lib/i18n/html-lang";
import { siteUrl } from "@/lib/utils";

import "./globals.css";

/**
 * Geist Sans for everything meant to be read (headings, paragraphs, buttons)
 * and JetBrains Mono for the machine voice (nav, kickers, labels, numbers,
 * badges). Both are self-hosted: Geist via its package, JetBrains through
 * `next/font`, which downloads it at build time — no runtime font request.
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Metri · Open-source fitness tracker for serious lifters",
    template: "%s · Metri",
  },
  description:
    "Metri is an open-source, offline-first training companion: free fitness calculators (1RM, TDEE, macros, body fat, FFMI) and an evidence-based knowledge base.",
  applicationName: "Metri",
  authors: [{ name: "Ricardo Tapia", url: siteUrl }],
  creator: "Ricardo Tapia",
  publisher: "Metri",
  keywords: [
    "fitness calculator",
    "1RM calculator",
    "TDEE calculator",
    "macro calculator",
    "FFMI",
    "open source fitness app",
    "workout tracker",
    "hypertrophy",
    "strength training",
  ],
  category: "health",
  openGraph: {
    type: "website",
    siteName: "Metri",
    url: siteUrl,
    title: "Metri · Open-source fitness tracker for serious lifters",
    description:
      "Free fitness calculators and an evidence-based knowledge base. Offline-first and open source.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Metri · Open-source fitness tracker",
    description:
      "Free fitness calculators and a knowledge base. Offline-first and open source.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Metri",
  },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/** Each calculator's name for the header menu, resolved here so the
 * calculator content (FAQs, sources) never reaches the client bundle. */
const TOOL_NAMES = {
  en: Object.fromEntries(CALC_IDS.map((id) => [id, CALC_CONTENT[id].en.h1])),
  es: Object.fromEntries(CALC_IDS.map((id) => [id, CALC_CONTENT[id].es.h1])),
} as ToolNames;

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Cached (`use cache`, max life) so the ⌘K palette and the header's Learn
  // panel can list docs without a client-side filesystem read — and without
  // the layout's disk I/O blocking every route from prerendering.
  const docsIndex = await getDocsIndex();

  return (
    // `lang` is the shell's default; the head script switches it to `es` on
    // Spanish paths before paint, and `suppressHydrationWarning` lets React
    // keep that corrected attribute instead of flagging it.
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${GeistSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: HTML_LANG_SCRIPT }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <Providers>
          <SkipLink />
          {/* `overflow-x-clip` here (not on <html>) swallows decorative overflow
              from any page without turning the body into a scroll container, so
              sticky headers keep tracking the viewport under Radix scroll-lock. */}
          <div className="flex min-h-dvh flex-col overflow-x-clip">
            {/* The header reads the URL (usePathname, for nav highlighting and
                the locale switch). On routes whose path is known at build time
                PPR resolves it into the static shell; on a fully dynamic route
                like /s/[id] it can't, so the boundary keeps that one route from
                blocking instead of failing the prerender. */}
            <Suspense fallback={<div className="h-16 shrink-0" />}>
              <Header
                toolNames={TOOL_NAMES}
                docTitles={featuredDocTitles(docsIndex)}
              />
            </Suspense>
            {/* `min-h-dvh` keeps short pages (contact, download, auth) at least a
                full viewport tall so the footer always sits below the fold, not
                floating up into the first screen. */}
            <main
              id={MAIN_ID}
              tabIndex={-1}
              className="min-h-dvh flex-1 focus:outline-none"
            >
              {children}
            </main>
            <Footer />
          </div>
          <CookieConsent />
          <CommandLauncher />
          <CommandPaletteMount docsIndex={docsIndex} />
          <ServiceWorkerRegister />
          <InstallPrompt />
        </Providers>
        <Analytics />
        <SpeedInsights />
        {gaId ? <ConsentedGA gaId={gaId} /> : null}
      </body>
    </html>
  );
};

export default RootLayout;
