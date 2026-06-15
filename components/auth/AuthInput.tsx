"use client";

import { useId, useState } from "react";
import type { InputHTMLAttributes, Ref } from "react";

import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  error?: string | null;
  ref?: Ref<HTMLInputElement>;
};

/** Branded text input for the auth screens, with a password reveal toggle. */
export const AuthInput = ({
  label,
  error,
  id,
  className,
  type = "text",
  disabled,
  ref,
  ...rest
}: AuthInputProps) => {
  const reactId = useId();
  const inputId = id ?? reactId;
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);
  const effectiveType = isPassword ? (revealed ? "text" : "password") : type;
  const hasError = Boolean(error);

  return (
    <div className={cn("w-full", className)}>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-ink-200"
      >
        {label}
      </label>
      <div
        className={cn(
          "relative flex items-center rounded-xl border bg-ink-900 transition",
          hasError
            ? "border-red-500/60 focus-within:ring-2 focus-within:ring-red-500/20"
            : "border-ink-600 focus-within:border-ink-500 focus-within:ring-2 focus-within:ring-ink-500/40",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type={effectiveType}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          className={cn(
            "w-full bg-transparent px-3.5 py-2.5 text-sm text-ink-50 outline-none placeholder:text-ink-400",
            isPassword && "pr-11",
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            disabled={disabled}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-1 inline-flex size-9 items-center justify-center rounded-md text-ink-400 transition hover:text-ink-100"
          >
            {revealed ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-500">
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
