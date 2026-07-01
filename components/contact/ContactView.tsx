import { MailIcon } from "@/components/icons";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/Section";
import { Card, CardContent } from "@/components/ui/card";
import { createT, type Locale } from "@/lib/i18n/config";

const CONTACT_EMAIL = "rhtc19@gmail.com";
const DEVELOPER_URL = "https://www.ricardotapia.dev";

/** Contact page — shared by the EN (/contact) and ES (/es/contacto) routes. */
export const ContactView = ({ locale }: { locale: Locale }) => {
  const t = createT(locale);

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-md">
          <PageHeader
            align="left"
            eyebrow={t("nav.contact")}
            title={t("contact.title")}
            subtitle={t("contact.subtitle")}
          />

          <div className="mt-8 rounded-card border border-ink-600 bg-ink-850/60 p-5">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group flex items-center gap-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-accent transition-colors group-hover:border-accent/40">
                <MailIcon size={18} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-xs text-ink-400">{t("auth.email")}</span>
                <span className="truncate text-sm font-medium text-ink-100 transition-colors group-hover:text-accent">
                  {CONTACT_EMAIL}
                </span>
              </span>
            </a>

            <p className="mt-4 border-t border-ink-700 pt-4 text-sm text-ink-400">
              {t("contact.developer")}{" "}
              <a
                href={DEVELOPER_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-ink-200 transition-colors hover:text-accent"
              >
                ricardotapia.dev
              </a>
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};
