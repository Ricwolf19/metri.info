import { Suspense } from "react";

import { ContactForm } from "@/components/contact/ContactForm";
import {
  GithubIcon,
  MailIcon,
  ProfileIcon,
  type IconProps,
} from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { createT, type Locale } from "@/lib/i18n/config";
import { contactEmail, developerUrl, mobileAppRepo } from "@/lib/site";

const Channel = ({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ComponentType<IconProps>;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) => (
  <a
    href={href}
    target={external ? "_blank" : undefined}
    rel={external ? "noreferrer noopener" : undefined}
    className="group flex items-center gap-3 rounded-card border border-ink-600 bg-ink-800 p-4 transition-colors hover:border-brand/40"
  >
    <span className="flex size-10 shrink-0 items-center justify-center rounded-field border border-ink-600 bg-ink-850 text-brand">
      <Icon size={18} />
    </span>
    <span className="flex min-w-0 flex-col">
      <span className="font-mono text-[11px] tracking-widest text-ink-400 uppercase">
        {label}
      </span>
      <span className="truncate text-sm font-medium text-ink-100 transition-colors group-hover:text-accent">
        {value}
      </span>
    </span>
  </a>
);

/** Contact page — shared by the EN (/contact) and ES (/es/contacto) routes.
 * The form reads `?topic=` so it sits in a Suspense boundary and the page
 * itself stays static. */
export const ContactView = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);

  return (
    <>
      <PageHero
        eyebrow={t("nav.contact")}
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
        compact
      />
      <Container className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="space-y-3">
            <Channel
              icon={MailIcon}
              label={t("auth.email")}
              value={contactEmail}
              href={`mailto:${contactEmail}`}
            />
            <Channel
              icon={GithubIcon}
              label={t("contact.issuesLabel")}
              value={t("contact.issuesValue")}
              href={`${mobileAppRepo}/issues`}
              external
            />
            <Channel
              icon={ProfileIcon}
              label={t("contact.developer")}
              value="ricardotapia.dev"
              href={developerUrl}
              external
            />
            <p className="px-1 pt-2 text-sm leading-relaxed text-ink-400">
              {t("contact.responseNote")}
            </p>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <Suspense fallback={<LoadingScreen />}>
                <ContactForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
};
