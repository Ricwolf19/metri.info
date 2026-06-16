import { CheckIcon, ExternalLinkIcon, XIcon } from "@/components/icons";

type Service = {
  name: string;
  desc: string;
  href: string;
  /** Whether the integration's env is present. Computed server-side from
   * `Boolean(process.env.X)` only — no secret value is ever read into the UI.
   * `undefined` means the link is informational (no env to gate on). */
  configured?: boolean;
};

/** Outbound links to the consoles that own each metric, with a per-integration
 * "Configured / Not set" indicator derived purely from env presence (booleans —
 * never the secret values themselves). */
const SERVICES: Service[] = [
  {
    name: "Neon (Postgres)",
    desc: "Primary database — users, sessions, saved calculations, favorites.",
    href: "https://console.neon.tech",
    configured: Boolean(process.env.DATABASE_URL),
  },
  {
    name: "PostHog",
    desc: "Product analytics, heatmaps & session replay (Query API).",
    href: "https://us.posthog.com",
    configured: Boolean(
      process.env.POSTHOG_PERSONAL_API_KEY && process.env.POSTHOG_PROJECT_ID,
    ),
  },
  {
    name: "Resend",
    desc: "Contact-form + auth email delivery, bounces, domain status.",
    href: "https://resend.com/emails",
    configured: Boolean(process.env.RESEND_API_KEY),
  },
  {
    name: "Google Analytics 4",
    desc: "Sessions, events, conversions, audiences.",
    href: "https://analytics.google.com",
    configured: Boolean(process.env.NEXT_PUBLIC_GA_ID),
  },
  {
    name: "reCAPTCHA",
    desc: "v3 bot protection on the contact form.",
    href: "https://www.google.com/recaptcha/admin",
    configured: Boolean(process.env.RECAPTCHA_SECRET_KEY),
  },
  {
    name: "GitHub OAuth",
    desc: "Social sign-in provider.",
    href: "https://github.com/settings/developers",
    configured: Boolean(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
    ),
  },
  {
    name: "Google OAuth",
    desc: "Social sign-in provider.",
    href: "https://console.cloud.google.com/apis/credentials",
    configured: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
  },
  {
    name: "Vercel",
    desc: "Hosting, deployments, Analytics & Speed Insights.",
    href: "https://vercel.com/dashboard",
  },
  {
    name: "Google Search Console",
    desc: "Impressions, clicks, queries, indexing & sitemap status.",
    href: "https://search.google.com/search-console",
  },
  {
    name: "GitHub repository",
    desc: "Source code, issues, deployments.",
    href: "https://github.com",
  },
];

const StatusPill = ({ configured }: { configured: boolean }) =>
  configured ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
      <CheckIcon size={12} /> Configured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-ink-600 px-2 py-0.5 text-xs font-medium text-ink-400">
      <XIcon size={12} /> Not set
    </span>
  );

export const ServicesGrid = () => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {SERVICES.map((s) => (
      <a
        key={s.name}
        href={s.href}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex flex-col rounded-card border border-ink-600 bg-ink-800 p-5 transition-colors hover:border-ink-500 hover:bg-ink-750"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-ink-50">{s.name}</span>
          <ExternalLinkIcon
            size={16}
            className="shrink-0 text-ink-400 transition-colors group-hover:text-accent"
          />
        </div>
        <span className="mt-1.5 text-sm text-ink-300">{s.desc}</span>
        {s.configured !== undefined ? (
          <div className="mt-3">
            <StatusPill configured={s.configured} />
          </div>
        ) : null}
      </a>
    ))}
  </div>
);
