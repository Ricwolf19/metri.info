import Link from "next/link";
import type { MDXComponents } from "mdx/types";

import { autoLinkTerms } from "@/components/docs/autoLinkTerms";
import { Callout } from "@/components/docs/Callout";
import { MuscleBadge } from "@/components/docs/MuscleBadge";
import { Term } from "@/components/docs/Term";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Locale } from "@/lib/i18n/config";

/** Factory for MDX element overrides — prose auto-links glossary terms per locale. */
export const getMdxComponents = (locale: Locale): MDXComponents => ({
  h2: (props) => (
    <h2
      className="mt-12 scroll-mt-24 text-2xl font-bold tracking-tight text-ink-50"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 scroll-mt-24 text-xl font-semibold text-ink-50"
      {...props}
    />
  ),
  p: ({ children, ...props }) => (
    <p className="mt-4 leading-relaxed text-ink-200" {...props}>
      {autoLinkTerms(children, locale)}
    </p>
  ),
  ul: (props) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-200" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-ink-200" {...props} />
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {autoLinkTerms(children, locale)}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-ink-50" {...props}>
      {autoLinkTerms(children, locale)}
    </strong>
  ),
  a: ({ href = "", ...props }) =>
    href.startsWith("/") ? (
      <Link
        href={href}
        className="text-accent underline-offset-2 hover:underline"
        {...props}
      />
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-accent underline-offset-2 hover:underline"
        {...props}
      />
    ),
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-2 border-ink-500 pl-4 text-ink-300 italic"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-ink-700 px-1.5 py-0.5 font-mono text-[0.85em] text-ink-100"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-6 overflow-x-auto rounded-xl border border-ink-600 bg-ink-850 p-4 font-mono text-sm text-ink-200"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-ink-600" />,
  table: (props) => <Table {...props} />,
  thead: (props) => <TableHeader {...props} />,
  tbody: (props) => <TableBody {...props} />,
  tr: (props) => <TableRow {...props} />,
  th: (props) => <TableHead {...props} />,
  td: ({ children, ...props }) => (
    <TableCell {...props}>{autoLinkTerms(children, locale)}</TableCell>
  ),
  Callout,
  MuscleBadge,
  Term: ({ id, children }: { id: string; children: React.ReactNode }) => (
    <Term id={id} locale={locale}>
      {children}
    </Term>
  ),
});
