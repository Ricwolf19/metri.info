import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ConsentedGA } from "@/components/analytics/ConsentedGA";
import { CommandLauncher } from "@/components/command/CommandLauncher";
import { CommandPaletteMount } from "@/components/command/CommandPaletteMount";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { getDocsIndex } from "@/lib/docs";
import { siteUrl } from "@/lib/utils";

import "./globals.css";

/**
 * Geist Sans (body + headings) and Geist Mono (nav, eyebrows, labels, numeric
 * values), self-hosted via the `geist` package — no Google Fonts round-trip.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Metri — Open-source fitness tracker for serious lifters",
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
    title: "Metri — Open-source fitness tracker for serious lifters",
    description:
      "Free fitness calculators and an evidence-based knowledge base. Offline-first and open source.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Metri — Open-source fitness tracker",
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0d12" },
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

const NO_FLASH = `(function(){try{var m=document.cookie.match(/(?:^|; )metri_theme=([^;]+)/);var p=m?m[1]:'dark';var s=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.setAttribute('data-theme',s);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Cached (`use cache`, max life) so the ⌘K palette can list docs without a
  // client-side filesystem read — and without the layout's disk I/O blocking
  // every route from prerendering.
  const docsIndex = await getDocsIndex();

  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <Providers>
          <div className="flex min-h-dvh flex-col">
            {/* The header reads the URL (usePathname, for nav highlighting and
                the locale switch). On routes whose path is known at build time
                PPR resolves it into the static shell; on a fully dynamic route
                like /s/[id] it can't, so the boundary keeps that one route from
                blocking instead of failing the prerender. */}
            <Suspense fallback={<div className="h-16 shrink-0" />}>
              <Header />
            </Suspense>
            {/* `min-h-dvh` keeps short pages (contact, download, auth) at least a
                full viewport tall so the footer always sits below the fold, not
                floating up into the first screen. */}
            <main className="min-h-dvh flex-1">{children}</main>
            <Footer />
          </div>
          <CookieConsent />
          <CommandLauncher />
          <CommandPaletteMount docsIndex={docsIndex} />
          <ServiceWorkerRegister />
        </Providers>
        <Analytics />
        <SpeedInsights />
        {gaId ? <ConsentedGA gaId={gaId} /> : null}
      </body>
    </html>
  );
};

export default RootLayout;
