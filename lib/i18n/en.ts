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

  // Auth
  "auth.signIn": "Sign in",
  "auth.signUp": "Create account",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.name": "Name",
  "auth.or": "or",
  "auth.continueGoogle": "Continue with Google",
  "auth.continueGithub": "Continue with GitHub",
  "auth.signInTitle": "Welcome back",
  "auth.signInSubtitle": "Sign in to save your results and sync with the app.",
  "auth.signUpTitle": "Create your account",
  "auth.signUpSubtitle": "Free forever. Save your calculations and progress.",
  "auth.noAccount": "Don't have an account?",
  "auth.haveAccount": "Already have an account?",
  "auth.createAccount": "Create one",
  "auth.backHome": "Back to home",
  "auth.errorGeneric": "Something went wrong. Please try again.",
  "auth.brandTitle": "Train smarter,",
  "auth.brandHighlight": "track everything.",
  "auth.brandSubtitle":
    "Free fitness calculators, programs and guides — your account keeps your results in sync.",

  // Hero
  "hero.badge": "Open-source fitness tracker",
  "hero.title": "Track. Progress. Evolve.",
  "hero.subtitle":
    "The open-source training companion for serious lifters — calculators, programs and a knowledge base, free and private by design.",
  "hero.ctaDownload": "Download App",
  "hero.ctaDocs": "Explore Docs",
  "hero.ctaTools": "Try the Calculators",

  // App showcase
  "showcase.badge": "Also on mobile",
  "showcase.title": "Prefer your phone?",
  "showcase.highlight": "Take it with you.",
  "showcase.subtitle":
    "Everything on METRI is free on the web. A native app is on the way as an optional extra — the same tools, fully offline.",
  "showcase.feature1": "Instant calculators that run on every keystroke",
  "showcase.feature2": "Works 100% offline — your data stays on device",
  "showcase.feature3": "Progress photos, reminders and structured programs",
  "showcase.feature4": "Free and open source, forever",

  // Bento (homepage value props)
  "bento.eyebrow": "Why METRI",
  "bento.title": "Everything a lifter needs,",
  "bento.highlight": "free on the web.",
  "bento.subtitle":
    "No paywalls, no sign-up, no fluff — open-source tools you can actually trust. The app is just an optional extra.",
  "bento.calc.title": "8 instant calculators",
  "bento.calc.desc":
    "1RM, TDEE, macros, body fat, BMI, FFMI, hydration and plate loading — each with a visual chart and a shareable link.",
  "bento.calc.cta": "Open the calculators",
  "bento.oss.title": "Open source forever",
  "bento.oss.desc":
    "MIT-licensed and built in the open. Read the formulas, fork it, contribute.",
  "bento.offline.title": "Works offline",
  "bento.offline.desc":
    "The optional native app runs every tool with zero connection — your data stays on device.",
  "bento.docs.title": "Evidence-based guides",
  "bento.docs.desc":
    "A growing knowledge base on nutrition, training and recovery — written for lifters, not clicks.",
  "bento.docs.cta": "Browse the docs",
  "bento.privacy.title": "Private by design",
  "bento.privacy.desc":
    "Calculators run in your browser. An account is optional and only syncs what you choose to save.",

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
  "calc.metric": "Metric",
  "calc.imperial": "Imperial",
  // Calculator fields
  "calc.bodyFat": "Body fat",
  "calc.neck": "Neck",
  "calc.waist": "Waist",
  "calc.hip": "Hip",
  "calc.calories": "Calories",
  "calc.goalLabel": "Goal",
  "calc.targetWeight": "Target weight",
  "calc.barWeight": "Bar weight",
  // Activity options
  "activity.sedentary": "Sedentary",
  "activity.light": "Light",
  "activity.moderate": "Moderate",
  "activity.active": "Active",
  "activity.veryActive": "Very active",
  // Goal options
  "calc.goal.cut": "Cut",
  "calc.goal.maintain": "Maintain",
  "calc.goal.bulk": "Bulk",
  // Formula options
  "calc.formula.epley": "Epley",
  "calc.formula.brzycki": "Brzycki",
  "calc.formula.mifflin": "Mifflin-St Jeor",
  "calc.formula.harris": "Harris-Benedict",
  "calc.formula.katch": "Katch-McArdle",
  // Result labels
  "calc.result.oneRm": "Estimated 1RM",
  "calc.result.tdee": "Maintenance (TDEE)",
  "calc.result.bmr": "BMR",
  "calc.result.cut": "Mild cut (−500)",
  "calc.result.bulk": "Lean bulk (+300)",
  "calc.result.protein": "Protein",
  "calc.result.carbs": "Carbs",
  "calc.result.fat": "Fat",
  "calc.result.bodyFat": "Body fat",
  "calc.result.bmi": "BMI",
  "calc.result.healthyRange": "Healthy weight",
  "calc.result.ffmi": "Normalized FFMI",
  "calc.result.ffmiRaw": "Raw FFMI",
  "calc.result.water": "Daily water",
  "calc.result.milliliters": "Millilitres",
  "calc.result.cups": "Cups (~240 ml)",
  "calc.result.perSide": "Per side",
  // BMI categories
  "calc.bmi.underweight": "Underweight",
  "calc.bmi.normal": "Normal weight",
  "calc.bmi.overweight": "Overweight",
  "calc.bmi.obese": "Obese",
  // Body-fat categories
  "calc.bf.essential": "Essential fat",
  "calc.bf.athlete": "Athletic",
  "calc.bf.fitness": "Fitness",
  "calc.bf.average": "Average",
  "calc.bf.high": "High",
  // FFMI bands
  "calc.ffmi.below": "Below average",
  "calc.ffmi.average": "Average",
  "calc.ffmi.aboveAverage": "Above average",
  "calc.ffmi.excellent": "Excellent",
  "calc.ffmi.superior": "Superior",
  "calc.ffmi.suspicious": "Exceptional",
  // Calculator page UI
  "calc.howTitle": "How it's calculated",
  "calc.interpretTitle": "How to read your result",
  "calc.faqTitle": "Frequently asked questions",
  "calc.relatedTitle": "Related calculators",

  // Exercise library
  "ex.title": "Exercise Library",
  "ex.subtitle":
    "Form guides for the lifts that matter — muscles worked, equipment and step-by-step technique.",
  "ex.searchPlaceholder": "Search exercises…",
  "ex.allCategories": "All muscle groups",
  "ex.allEquipment": "All equipment",
  "ex.noResults": "No exercises found.",
  "ex.instructions": "How to perform",
  "ex.primaryMuscles": "Primary muscles",
  "ex.secondaryMuscles": "Secondary muscles",
  "ex.equipmentLabel": "Equipment",
  "ex.difficultyLabel": "Difficulty",
  "ex.cat.chest": "Chest",
  "ex.cat.back": "Back",
  "ex.cat.legs": "Legs",
  "ex.cat.shoulders": "Shoulders",
  "ex.cat.arms": "Arms",
  "ex.cat.core": "Core",
  "ex.eq.barbell": "Barbell",
  "ex.eq.dumbbell": "Dumbbell",
  "ex.eq.machine": "Machine",
  "ex.eq.cable": "Cable",
  "ex.eq.bodyweight": "Bodyweight",
  "ex.eq.kettlebell": "Kettlebell",
  "ex.diff.beginner": "Beginner",
  "ex.diff.intermediate": "Intermediate",
  "ex.diff.advanced": "Advanced",

  // Muscles
  "muscle.chest": "Chest",
  "muscle.upperBack": "Upper back",
  "muscle.lats": "Lats",
  "muscle.lowerBack": "Lower back",
  "muscle.traps": "Traps",
  "muscle.frontDelts": "Front delts",
  "muscle.sideDelts": "Side delts",
  "muscle.triceps": "Triceps",
  "muscle.biceps": "Biceps",
  "muscle.forearms": "Forearms",
  "muscle.quads": "Quads",
  "muscle.hamstrings": "Hamstrings",
  "muscle.glutes": "Glutes",
  "muscle.calves": "Calves",
  "muscle.abs": "Abs",
  "muscle.obliques": "Obliques",
  "muscle.core": "Core",

  // Programs
  "program.title": "Training Programs",
  "program.subtitle":
    "Structured, multi-week routines — pick a goal and follow a proven plan.",
  "program.weeks": "{n} weeks",
  "program.daysPerWeek": "{n} days/week",
  "program.day": "Day",
  "program.sets": "Sets",
  "program.reps": "Reps",
  "program.exercisesTitle": "The plan",
  "program.featured": "Featured",
  "program.goal.strength": "Strength",
  "program.goal.hypertrophy": "Hypertrophy",
  "program.goal.powerbuilding": "Powerbuilding",
  "program.goal.endurance": "Endurance",

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
  "docs.catNutrition": "Nutrition",
  "docs.catNutritionDesc":
    "Macros, calories, meal timing and hydration — what actually moves body composition.",
  "docs.catTraining": "Training",
  "docs.catTrainingDesc":
    "Progressive overload, RIR/RPE, volume landmarks and how to program for growth.",
  "docs.catRecovery": "Recovery",
  "docs.catRecoveryDesc":
    "Sleep, deloads and managing fatigue so your training actually sticks.",
  // Knowledge-base category labels (sidebar/index)
  "docs.category.gettingStarted": "Getting started",
  "docs.category.nutrition": "Nutrition",
  "docs.category.training": "Training",
  "docs.category.recovery": "Recovery",

  // Homepage CTAs
  "home.toolsCta": "See all calculators",
  "home.docsCta": "Browse the knowledge base",

  // Coming-soon placeholder
  "soon.badge": "Coming soon",
  "soon.body": "This section is being built and lands in an upcoming release.",
  "soon.backHome": "Back to home",

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
  "download.devBadge": "Mobile app in development",
  "download.devTitle": "A native app is on the way",
  "download.devBody":
    "METRI is free and open source on the web — every calculator and guide, no account, forever. A native iOS and Android app is in development as an optional extra.",
  "download.devCtaTools": "Explore the calculators",
  "download.devCtaGithub": "Follow progress on GitHub",
  "download.platformsTitle": "Coming to",
  "download.iosSoon": "App Store — coming soon",
  "download.androidSoon": "Google Play — coming soon",
  "download.notifyNote":
    "Star the repo to get notified when the first build drops.",
} as const;

export type TranslationKey = keyof typeof en;
