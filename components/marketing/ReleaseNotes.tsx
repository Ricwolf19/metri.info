import { renderReleaseNotes } from "@/lib/releases/markdown";

/**
 * The release-please changelog as HTML. `renderReleaseNotes` escapes the whole
 * source before adding markup, so the raw GitHub text can be injected safely.
 * Clamped with a fade; the full notes live on the GitHub release.
 */
export const ReleaseNotes = ({ markdown }: { markdown: string }) => {
  const html = renderReleaseNotes(markdown);
  if (!html) return null;
  return (
    <div className="relative max-h-56 overflow-hidden">
      <div
        className="space-y-2 text-sm leading-relaxed text-ink-300 [&_a]:text-ink-100 [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-ink-700 [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_h2]:pt-1 [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:tracking-widest [&_h2]:text-ink-400 [&_h2]:uppercase [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-ink-100 [&_li]:relative [&_li]:pl-4 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-brand [&_li]:before:content-['–'] [&_ul]:space-y-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-800 to-transparent"
      />
    </div>
  );
};
