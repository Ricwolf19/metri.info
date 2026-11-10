"use client";

import { useId, useState } from "react";
import type { InputHTMLAttributes, Ref } from "react";

import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  error?: string | null;
  /** A standing rule under the field ("At least 8 characters"), read with it. */
  hint?: string;
  ref?: Ref<HTMLInputElement>;
};

/** Branded text input for the auth screens, with a password reveal toggle.
 * The hint and the error are tied to the input (`aria-describedby`), so a
 * screen reader hears them on the field itself. */
export const AuthInput = ({
  label,
  error,
  hint,
  id,
  className,
  type = "text",
  disabled,
  ref,
  "aria-describedby": describedByProp,
  ...rest
}: AuthInputProps) => {
  const t = useT();
  const reactId = useId();
  const inputId = id ?? reactId;
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);
  const effectiveType = isPassword ? (revealed ? "text" : "password") : type;
  const hasError = Boolean(error);
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy =
    [describedByProp, hint ? hintId : null, hasError ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("w-full", className)}>
      <Label htmlFor={inputId} className="mb-1.5 block">
        {label}
      </Label>
      <div className="relative">
        <Input
          {...rest}
          ref={ref}
          id={inputId}
          type={effectiveType}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(isPassword && "pr-11")}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            disabled={disabled}
            // One name, the state in `aria-pressed`: a label that flipped to
            // "Hide" read as "Hide password, pressed".
            aria-label={t("auth.showPassword")}
            aria-pressed={revealed}
            aria-controls={inputId}
            className="absolute inset-y-0 right-1 inline-flex w-9 items-center justify-center rounded-md text-ink-400 transition hover:text-ink-100"
          >
            {revealed ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-400">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
};

/** Labelled divider between the form and the social buttons. */
export const AuthDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 text-xs font-medium tracking-wider text-ink-400 uppercase">
    <span className="h-px flex-1 bg-ink-600" />
    <span>{label}</span>
    <span className="h-px flex-1 bg-ink-600" />
  </div>
);
