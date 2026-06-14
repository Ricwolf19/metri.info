/**
 * English strings — the source of truth for translation keys (web).
 * Mirrors the mobile app's flat dotted-key convention. `es.ts` must provide the
 * same keys. Use `{name}`-style placeholders for interpolation (see `t()`).
 */
export const en = {
  // Common
  "common.continue": "Continue",
  "common.learnMore": "Learn more",
  "common.readMore": "Read more",
  "common.comingSoon": "Coming soon",
  "common.openSource": "Open source",
  "common.search": "Search",
  "common.loading": "Loading…",

  // Languages
  "lang.en": "English",
  "lang.es": "Spanish",

  // Theme
  "theme.title": "Appearance",
  "theme.system": "System",
  "theme.light": "Light",
  "theme.dark": "Dark",

  // Navigation
  "nav.home": "Home",
  "nav.docs": "Docs",
  "nav.tools": "Tools",
  "nav.exercises": "Exercises",
  "nav.programs": "Programs",
  "nav.download": "Download",
  "nav.signIn": "Sign In",
  "nav.signUp": "Sign Up",
  "nav.github": "GitHub",
  "nav.menu": "Menu",
  "nav.close": "Close",

  // Hero
  "hero.badge": "Open-source fitness tracker",
  "hero.title": "Track. Progress. Evolve.",
  "hero.subtitle":
    "The open-source training companion for serious lifters — calculators, programs and a knowledge base, free and private by design.",
  "hero.ctaDownload": "Download App",
  "hero.ctaDocs": "Explore Docs",
  "hero.ctaTools": "Try the Calculators",

  // App showcase
  "showcase.badge": "Mobile App",
  "showcase.title": "Your whole training life,",
  "showcase.highlight": "offline-first.",
  "showcase.subtitle":
    "METRI runs fully on your device. No account required, no data leaves your phone.",
  "showcase.feature1": "Instant calculators that run on every keystroke",
  "showcase.feature2": "Works 100% offline — your data stays on device",
  "showcase.feature3": "Progress photos, reminders and structured programs",
  "showcase.feature4": "Free and open source, forever",

  // Tools / calculators directory
  "tools.title": "Calculators & Tools",
  "tools.subtitle":
    "The same formulas as the app — run instantly in your browser. Share results with a link.",
  "tools.bmr.title": "BMR & TDEE",
  "tools.bmr.desc":
    "Estimate daily energy expenditure (Harris-Benedict, Mifflin-St Jeor, Katch-McArdle).",
  "tools.macros.title": "Macro Splitter",
  "tools.macros.desc":
    "Protein, carbs and fat targets from your calories and goal.",
  "tools.onerm.title": "1RM Calculator",
  "tools.onerm.desc":
    "Estimate your one-rep max (Epley, Brzycki) from any set.",
  "tools.bodyfat.title": "Body Fat",
  "tools.bodyfat.desc":
    "U.S. Navy circumference method for body-fat percentage.",
  "tools.ideal.title": "Healthy Weight & BMI",
  "tools.ideal.desc": "Your BMI and the WHO healthy-weight range.",
  "tools.ffmi.title": "FFMI",
  "tools.ffmi.desc": "Fat-free mass index — how much muscle you carry.",
  "tools.water.title": "Hydration",
  "tools.water.desc": "Daily water target from body weight and activity.",
  "tools.plates.title": "Plate Calculator",
  "tools.plates.desc": "Which plates to load on the bar for any target weight.",

  // Calculator UI
  "calc.weight": "Weight",
  "calc.reps": "Reps",
  "calc.height": "Height",
  "calc.age": "Age",
  "calc.sex": "Sex",
  "calc.male": "Male",
  "calc.female": "Female",
  "calc.activity": "Activity level",
  "calc.formula": "Formula",
  "calc.result": "Result",
  "calc.share": "Copy share link",
  "calc.copied": "Link copied",

  // Docs preview
  "docs.title": "Knowledge Base",
  "docs.subtitle":
    "Evidence-based guides on nutrition, training and recovery — written for lifters, not clickbait.",
  "docs.searchPlaceholder": "Search the docs…",
  "docs.noResults": "No results found.",
  "docs.readingTime": "{minutes} min read",
  "docs.onThisPage": "On this page",
  "docs.disclaimer":
    "Educational content only. Not medical advice — consult a professional for your situation.",

  // Open-source CTA
  "oss.title": "Built in the open.",
  "oss.subtitle":
    "METRI is MIT-licensed and free forever. Star it, fork it, or contribute on GitHub.",
  "oss.cta": "View on GitHub",

  // Footer
  "footer.tagline": "Open-source fitness, built for lifters.",
  "footer.product": "Product",
  "footer.resources": "Resources",
  "footer.company": "Company",
  "footer.about": "About",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.rights": "All rights reserved.",
  "footer.builtWith": "Free & open source.",
  "footer.siteSource": "Website source",

  // Download page
  "download.title": "Get METRI on your phone",
  "download.subtitle": "Free, offline-first, no account required.",
  "download.ios": "Download on the App Store",
  "download.android": "Get it on Google Play",
  "download.scan": "Scan to download",
  // In-development state
  "download.devBadge": "In development",
  "download.devTitle": "The METRI app is almost here",
  "download.devBody":
    "We're putting the finishing touches on the mobile app. iOS and Android builds are coming soon — meanwhile, every calculator already works right here on the web.",
  "download.devCtaTools": "Use the web calculators",
  "download.devCtaGithub": "Follow progress on GitHub",
  "download.platformsTitle": "Where you'll get it",
  "download.iosSoon": "App Store — coming soon",
  "download.androidSoon": "Google Play — coming soon",
  "download.notifyNote":
    "Star the repo to get notified when the first build drops.",
} as const;

export type TranslationKey = keyof typeof en;
