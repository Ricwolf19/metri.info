import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Spline_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/providers";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
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

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

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
          <InstallPrompt />
          <ServiceWorkerRegister />
        </Providers>
        <Analytics />
        <SpeedInsights />
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
};

export default RootLayout;
