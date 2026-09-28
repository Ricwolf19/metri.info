import Link from "next/link";
import { Suspense } from "react";

import { MailIcon } from "@/components/icons";
import { Container } from "@/components/shared/Container";
import { buttonVariants } from "@/components/ui/button";
import { createT, type Locale } from "@/lib/i18n/config";
import { routePath } from "@/lib/i18n/routes";
import { confirmUnsubscribe } from "@/lib/releases/actions";
import { verifyUnsubscribeToken } from "@/lib/releases/unsubscribe";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/** Reads the query, so it renders at request time inside the Suspense
 * boundary; the shell around it stays static. The GET only verifies — the
 * opt-out itself is the form POST (link scanners prefetch GETs). */
const UnsubscribeState = async ({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: SearchParams;
}) => {
  const t = createT(locale);
  const params = await searchParams;
  const token = first(params.token);
  const done = first(params.done) === "1";
  const valid = !done && verifyUnsubscribeToken(token) !== null;

  const [title, body] = done
    ? [t("unsubscribe.doneTitle"), t("unsubscribe.doneBody")]
    : valid
      ? [t("unsubscribe.title"), t("unsubscribe.body")]
      : [t("unsubscribe.invalidTitle"), t("unsubscribe.invalidBody")];

  return (
    <>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-balance text-ink-50">
        {title}
      </h1>
      <p className="mt-4 text-pretty text-ink-300">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {valid && (
          <form action={confirmUnsubscribe}>
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={buttonVariants({ size: "lg" })}>
              {t("unsubscribe.confirm")}
            </button>
          </form>
        )}
        <Link
          href={routePath("home", locale)}
          className={buttonVariants({ variant: "secondary", size: "lg" })}
        >
          {t("unsubscribe.home")}
        </Link>
      </div>
    </>
  );
};

/** Release-email opt-out page — shared by /unsubscribe and
 * /es/cancelar-suscripcion. */
export const UnsubscribeView = ({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: SearchParams;
}) => (
  <Container className="py-14 lg:py-20">
    <div className="mx-auto max-w-xl">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-ink-600 bg-ink-800 text-accent">
        <MailIcon size={28} />
      </div>
      <Suspense fallback={null}>
        <UnsubscribeState locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  </Container>
);
