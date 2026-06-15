import { type AppError, type ErrorCode, toAppError } from "@/lib/errors";

/**
 * A serializable success/failure envelope for everything that crosses the
 * server↔client boundary (Server Actions, route handlers, fetch wrappers).
 *
 * The failure side is a PLAIN object (not an `AppError` instance) so it survives
 * RSC serialization and carries only client-safe fields. Use `safeAsync` to
 * turn any throwing async fn into a `Result` — internal errors are logged on the
 * server and collapsed to a generic message before they reach the client.
 */

export type ActionError = {
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });

export const fail = (error: ActionError): Result<never> => ({
  ok: false,
  error,
});

const toActionError = (err: AppError): ActionError => ({
  code: err.code,
  message: err.publicMessage,
  ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {}),
});

/**
 * Run an async backend operation and never let it throw past this point.
 * Expected `AppError`s become typed failures; anything else is logged with its
 * real cause and returned as a generic `internal` error (no leakage).
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
): Promise<Result<T>> => {
  try {
    return ok(await fn());
  } catch (raw) {
    const err = toAppError(raw);
    if (err.code === "internal") {
      console.error("[safeAsync] unhandled error:", err.cause ?? raw);
    }
    return fail(toActionError(err));
  }
};
