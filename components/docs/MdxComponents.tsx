import Link from "next/link";
import type { MDXComponents } from "mdx/types";

import { Callout } from "@/components/docs/Callout";
import { MuscleBadge } from "@/components/docs/MuscleBadge";

/** Tailwind-styled HTML elements + custom components available inside MDX docs. */
export const mdxComponents: MDXComponents = {
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
  p: (props) => <p className="mt-4 leading-relaxed text-ink-200" {...props} />,
  ul: (props) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-200" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-ink-200" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  strong: (props) => (
    <strong className="font-semibold text-ink-50" {...props} />
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
  table: (props) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="border-b border-ink-600 px-3 py-2 text-left font-semibold text-ink-50"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border-b border-ink-700 px-3 py-2 text-ink-200" {...props} />
  ),
  Callout,
  MuscleBadge,
};
