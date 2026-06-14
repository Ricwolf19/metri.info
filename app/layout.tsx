import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Spline_Sans } from "next/font/google";
import { cookies } from "next/headers";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/providers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { THEME_COOKIE, type ThemePreference } from "@/lib/theme/theme-context";
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
    images: [{ url: "/og/default.png", width: 1200, height: 630, alt: "METRI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "METRI — Open-source fitness tracker",
    description:
      "Free fitness calculators, programs and a knowledge base. Offline-first and open source.",
    images: ["/og/default.png"],
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
  icons: {
    icon: [
      { url: "/brand/favicon.png", type: "image/png" },
      { url: "/brand/metri-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/icon.png",
    shortcut: "/brand/favicon.png",
  },
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

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const store = await cookies();
  const localeCookie = store.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;
  const themePref = (store.get(THEME_COOKIE)?.value ??
    "dark") as ThemePreference;
  const initialScheme = themePref === "light" ? "light" : "dark"; // 'system' resolves client-side

  return (
    <html
      lang={locale}
      data-theme={initialScheme}
      className={`${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <Providers locale={locale} themePreference={themePref}>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
