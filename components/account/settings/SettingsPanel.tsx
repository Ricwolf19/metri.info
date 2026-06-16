"use client";

import { cn } from "@/lib/utils";

/**
 * A single settings section: a titled card body with a sticky footer holding its
 * own save action (adapted from the reference WizardLayout/WizardFooter, ported
 * to ink/accent tokens). Each panel owns its own form + submit.
 */
export const SettingsPanel = ({
  id,
  title,
  description,
  children,
  footer,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) => (
  <section
    id={id}
    className="scroll-mt-24 overflow-hidden rounded-card border border-ink-600 bg-ink-800"
  >
    <header className="border-b border-ink-700 px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold text-ink-50">{title}</h2>
      <p className="mt-0.5 text-sm text-ink-400">{description}</p>
    </header>
    <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    <footer className="flex items-center justify-end gap-3 border-t border-ink-700 bg-ink-900/40 px-5 py-4 sm:px-6">
      {footer}
    </footer>
  </section>
);

/** Right-aligned status text shown next to a panel's submit button. */
export const PanelStatus = ({
  message,
  tone,
}: {
  message: string | null;
  tone: "success" | "error";
}) =>
  message ? (
    <span
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mr-auto text-sm font-medium",
        tone === "error" ? "text-red-500" : "text-accent",
      )}
    >
      {message}
    </span>
  ) : null;

/** Two-column responsive field grid used inside panels. */
export const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-4 sm:grid-cols-2">{children}</div>
);
