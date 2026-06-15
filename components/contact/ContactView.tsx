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
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-md">
          <PageHeader
            align="left"
            eyebrow={t("nav.contact")}
            title={t("contact.title")}
            subtitle={t("contact.subtitle")}
          />

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink-200 transition-colors hover:text-accent"
          >
            <MailIcon size={16} />
            {CONTACT_EMAIL}
          </a>

          <p className="mt-6 text-sm text-ink-400">
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

        <Card>
          <CardContent className="p-6 sm:p-8">
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};
