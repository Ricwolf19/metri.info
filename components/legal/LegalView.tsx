import { Container } from "@/components/shared/Container";
import type { Locale } from "@/lib/i18n/config";
import { LEGAL_CONTENT, type LegalDoc } from "@/lib/legal/content";

/** Static about / privacy / terms page — shared by the EN and ES routes.
 * Content is locale-prop driven so every page prerenders per language. */
export const LegalView = ({
  locale,
  doc,
}: {
  locale: Locale;
  doc: LegalDoc;
}) => {
  const c = LEGAL_CONTENT[doc][locale];

  return (
    <Container className="py-16 sm:py-20">
      <article className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-balance text-ink-50 sm:text-5xl">
          {c.title}
        </h1>
        {c.updated && <p className="mt-3 text-sm text-ink-400">{c.updated}</p>}
        <p className="mt-5 text-lg leading-relaxed text-pretty text-ink-300">
          {c.lead}
        </p>

        <div className="mt-12 space-y-10">
          {c.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold text-ink-50">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-3 leading-relaxed text-ink-200">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </Container>
  );
};
