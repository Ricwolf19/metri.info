import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Spline_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { MetaPixel } from "@/components/analytics/MetaPixel";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/providers";
import { siteUrl } from "@/lib/utils";

import "./globals.css";

const display = Spline_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-stack",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "METRI — Open-source fitness tracker for serious lifters",
    template: "%s · METRI",
  },
  description:
    "METRI is an open-source, offline-first training companion: free fitness calculators (1RM, TDEE, macros, body fat, FFMI), structured programs, an exercise library and an evidence-based knowledge base.",
  applicationName: "METRI",
  authors: [{ name: "Ricardo Tapia", url: siteUrl }],
  creator: "Ricardo Tapia",
  publisher: "METRI",
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
    siteName: "METRI",
    url: siteUrl,
    title: "METRI — Open-source fitness tracker for serious lifters",
    description:
      "Free fitness calculators, structured programs and an evidence-based knowledge base. Offline-first and open source.",
    // og:image is provided by the dynamic opengraph-image file convention.
  },
  twitter: {
    card: "summary_large_image",
    title: "METRI — Open-source fitness tracker",
    description:
      "Free fitness calculators, programs and a knowledge base. Offline-first and open source.",
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
  // Icons are provided by file conventions: app/icon.svg, app/icon.png,
  // app/apple-icon.png — all transparent-background (no black tile).
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "METRI",
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

// No-flash script: applies the persisted theme before first paint.
const NO_FLASH = `(function(){try{var m=document.cookie.match(/(?:^|; )metri_theme=([^;]+)/);var p=m?m[1]:'dark';var s=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.setAttribute('data-theme',s);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  // `lang` defaults to "en"; the client I18nProvider corrects it to "es" on /es
  // routes. `data-theme` defaults to dark and the no-flash script applies the
  // persisted theme before first paint. Both are static so pages can be SSG.
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        {/* Privacy-friendly product + Core Web Vitals analytics (no-op off Vercel). */}
        <Analytics />
        <SpeedInsights />
        {/* Google Analytics 4 — only when NEXT_PUBLIC_GA_ID is set. */}
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        {/* Meta Pixel — only when NEXT_PUBLIC_FB_PIXEL_ID is set. */}
        {fbPixelId ? <MetaPixel pixelId={fbPixelId} /> : null}
      </body>
    </html>
  );
};

export default RootLayout;
