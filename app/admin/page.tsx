import { count } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { AdminSignOut } from "@/app/admin/AdminSignOut";
import { ExternalLinkIcon } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/shared/Container";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { calculationLog, exercise, program, user } from "@/lib/db/schema";

const rowCount = async (table: PgTable) => {
  try {
    const [r] = await db.select({ c: count() }).from(table);
    return r?.c ?? 0;
  } catch {
    return null;
  }
};

/** Outbound links to the dashboards that own each metric. Most analytics live in
 * the provider's own console — we surface deep links rather than re-plot data. */
const SERVICES = [
  {
    name: "Vercel Analytics & Speed Insights",
    desc: "Traffic, Core Web Vitals (LCP/CLS/INP), top pages.",
    href: "https://vercel.com/dashboard",
  },
  {
    name: "Google Analytics 4",
    desc: "Sessions, events, conversions, audiences.",
    href: "https://analytics.google.com",
  },
  {
    name: "Google Search Console",
    desc: "Impressions, clicks, queries, indexing & sitemap status.",
    href: "https://search.google.com/search-console",
  },
  {
    name: "Resend",
    desc: "Contact-form email delivery, bounces, domain status.",
    href: "https://resend.com/emails",
  },
  {
    name: "Meta Events Manager",
    desc: "Facebook Pixel events, audiences, diagnostics.",
    href: "https://business.facebook.com/events_manager2",
  },
  {
    name: "PostHog",
    desc: "Product analytics & funnels (when configured).",
    href: "https://us.posthog.com",
  },
];

const Metric = ({ label, value }: { label: string; value: number | null }) => (
  <div className="rounded-card border border-ink-600 bg-ink-800 p-5">
    <p className="text-sm text-ink-400">{label}</p>
    <p className="mt-1 font-mono text-3xl font-bold text-ink-50">
      {value === null ? "—" : value.toLocaleString("en-US")}
    </p>
  </div>
);

const AdminPage = async () => {
  const admin = await requireAdmin();
  const [users, calcs, exercises, programs] = await Promise.all([
    rowCount(user),
    rowCount(calculationLog),
    rowCount(exercise),
    rowCount(program),
  ]);

  return (
    <>
      <header className="border-b border-ink-600/60 bg-ink-850">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-md border border-ink-600 bg-ink-800 px-2 py-0.5 text-xs font-semibold text-accent">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-400 sm:inline">
              {admin.email}
            </span>
            <AdminSignOut />
          </div>
        </Container>
      </header>

      <Container className="py-10">
        <h1 className="text-2xl font-bold text-ink-50">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-300">
          Live counts from the database. Deep analytics live in each provider’s
          console below.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Registered users" value={users} />
          <Metric label="Saved calculations" value={calcs} />
          <Metric label="Exercises (catalog)" value={exercises} />
          <Metric label="Programs (catalog)" value={programs} />
        </div>

        <h2 className="mt-12 text-lg font-semibold text-ink-50">
          Analytics & services
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-col rounded-card border border-ink-600 bg-ink-800 p-5 transition-colors hover:border-ink-500 hover:bg-ink-750"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-50">{s.name}</span>
                <ExternalLinkIcon
                  size={16}
                  className="text-ink-400 transition-colors group-hover:text-accent"
                />
              </div>
              <span className="mt-1.5 text-sm text-ink-300">{s.desc}</span>
            </a>
          ))}
        </div>
      </Container>
    </>
  );
};

export default AdminPage;
