import Link from "next/link";

import { AccountFavorites } from "@/components/account/AccountFavorites";
import { AccountHistory } from "@/components/account/AccountHistory";
import { GearIcon } from "@/components/icons";
import { BenefitsPanel } from "@/components/marketing/BenefitsPanel";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/shared/Section";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/admin";
import { createT } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const Section = ({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="mt-12 scroll-mt-24 first:mt-0">
    <h2 className="text-lg font-semibold text-ink-50">{title}</h2>
    <p className="mt-1 text-sm text-ink-300">{subtitle}</p>
    <div className="mt-5">{children}</div>
  </section>
);

const AccountPage = async (props: {
  searchParams: Promise<{ historyPage?: string }>;
}) => {
  const user = await requireUser();
  const locale = "en";
  const t = createT(locale);
  const { historyPage } = await props.searchParams;
  const page = Number(historyPage) || 1;

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow={t("nav.account")}
        title={t("account.title")}
        subtitle={t("account.subtitle")}
        align="left"
        className="mb-6"
      >
        <Link
          href="/account/settings"
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "mt-6",
          )}
        >
          <GearIcon size={16} />
          {t("account.settingsLink")}
        </Link>
      </PageHeader>

      <Section
        title={t("account.favoritesTitle")}
        subtitle={t("account.favoritesSubtitle")}
      >
        <AccountFavorites userId={user.id} locale={locale} />
      </Section>

      <Section
        id="history"
        title={t("account.historyTitle")}
        subtitle={t("account.historySubtitle")}
      >
        <AccountHistory userId={user.id} locale={locale} page={page} />
      </Section>

      <Section title={t("benefits.title")} subtitle={t("benefits.subtitle")}>
        <BenefitsPanel />
      </Section>
    </Container>
  );
};

export default AccountPage;
