/**
 * Typed application errors. Every backend failure becomes an `AppError` so the
 * surrounding code knows (a) the HTTP-ish category, (b) a message that is SAFE
 * to show users / send over the wire, and (c) optional per-field messages.
 *
 * Rule of thumb: `throw new XError(...)` inside backend logic, then convert at
 * the boundary with `toAppError()` (see `lib/result.ts`). Never leak `cause`
 * or raw `Error.message` to the client — those go to server logs only.
 */

export type ErrorCode =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "external_service"
  | "internal";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  validation: 422,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  rate_limited: 429,
  external_service: 502,
  internal: 500,
};

type AppErrorOptions = {
  /** Message safe to surface to end users. Defaults to a generic per-code text. */
  publicMessage?: string;
  /** Per-field messages for forms, keyed by field name. */
  fieldErrors?: Record<string, string>;
  /** Underlying error for server-side logging only — never serialized out. */
  cause?: unknown;
};

const GENERIC_MESSAGE: Record<ErrorCode, string> = {
  validation: "Please check the highlighted fields and try again.",
  unauthorized: "You need to sign in to do that.",
  forbidden: "You don't have permission to do that.",
  not_found: "We couldn't find what you were looking for.",
  rate_limited: "Too many requests. Please wait a moment and try again.",
  external_service: "A service we depend on is unavailable. Please try again.",
  internal: "Something went wrong on our end. Please try again.",
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  /** Message that is safe to expose to clients. */
  readonly publicMessage: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(code: ErrorCode, options: AppErrorOptions = {}) {
    super(options.publicMessage ?? GENERIC_MESSAGE[code], {
      cause: options.cause,
    });
    this.name = new.target.name;
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.publicMessage = options.publicMessage ?? GENERIC_MESSAGE[code];
    this.fieldErrors = options.fieldErrors;
  }
}

export class ValidationError extends AppError {
  constructor(
    fieldErrors: Record<string, string>,
    publicMessage?: string,
    cause?: unknown,
  ) {
    super("validation", { fieldErrors, publicMessage, cause });
  }
}

export class UnauthorizedError extends AppError {
  constructor(publicMessage?: string, cause?: unknown) {
    super("unauthorized", { publicMessage, cause });
  }
}

export class ForbiddenError extends AppError {
  constructor(publicMessage?: string, cause?: unknown) {
    super("forbidden", { publicMessage, cause });
  }
}

export class NotFoundError extends AppError {
  constructor(publicMessage?: string, cause?: unknown) {
    super("not_found", { publicMessage, cause });
  }
}

export class RateLimitError extends AppError {
  constructor(publicMessage?: string, cause?: unknown) {
    super("rate_limited", { publicMessage, cause });
  }
}

/** A third-party (Resend, reCAPTCHA, OAuth, …) failed or returned an error. */
export class ExternalServiceError extends AppError {
  constructor(publicMessage?: string, cause?: unknown) {
    super("external_service", { publicMessage, cause });
  }
}

/** Coerce any thrown value into an AppError without leaking internals. */
export const toAppError = (value: unknown): AppError => {
  if (value instanceof AppError) return value;
  return new AppError("internal", { cause: value });
};
