import { Fragment } from "react";

import { Term } from "@/components/docs/Term";
import type { Locale } from "@/lib/i18n/config";

/**
 * Auto-links known glossary acronyms inside MDX prose to their glossary entry —
 * so every guide gets term highlighting without editing 40 content files. Only
 * distinctive, case-sensitive acronyms are matched (low false-positive risk),
 * and each term is linked once per text block. Locale-aware (BMI ↔ IMC).
 */
const ALIASES: Record<Locale, [string, string][]> = {
  en: [
    ["BMR", "bmr"],
    ["TDEE", "tdee"],
    ["BMI", "bmi"],
    ["FFMI", "ffmi"],
    ["1RM", "one-rep-max"],
    ["RIR", "rir"],
    ["ROM", "rom"],
    ["TUT", "tut"],
    ["MET", "met"],
    ["DOTS", "wilks-dots"],
    ["Wilks", "wilks-dots"],
  ],
  es: [
    ["TMB", "bmr"],
    ["TDEE", "tdee"],
    ["IMC", "bmi"],
    ["FFMI", "ffmi"],
    ["1RM", "one-rep-max"],
    ["RIR", "rir"],
    ["ROM", "rom"],
    ["TUT", "tut"],
    ["MET", "met"],
    ["DOTS", "wilks-dots"],
    ["Wilks", "wilks-dots"],
  ],
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const regexFor = (locale: Locale) =>
  new RegExp(
    `\\b(${ALIASES[locale].map(([alias]) => escapeRe(alias)).join("|")})\\b`,
    "g",
  );

const idFor = (locale: Locale, token: string) =>
  ALIASES[locale].find(([alias]) => alias === token)?.[1];

const linkString = (
  text: string,
  locale: Locale,
  seen: Set<string>,
): React.ReactNode => {
  const re = regexFor(locale);
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const id = idFor(locale, m[0]);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <Term key={`${id}-${m.index}`} id={id} locale={locale}>
        {m[0]}
      </Term>,
    );
    last = m.index + m[0].length;
  }
  if (out.length === 0) return text;
  if (last < text.length) out.push(text.slice(last));
  return out;
};

export const autoLinkTerms = (
  children: React.ReactNode,
  locale: Locale,
): React.ReactNode => {
  const seen = new Set<string>();
  const walk = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === "string") return linkString(node, locale, seen);
    if (Array.isArray(node)) {
      return node.map((child, i) => <Fragment key={i}>{walk(child)}</Fragment>);
    }
    return node; // leave elements (links, code, bold) untouched here
  };
  return walk(children);
};
