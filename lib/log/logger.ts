import "server-only";

/**
 * Tiny structured-logging helper. Every line is grepeable in Vercel logs
 * (`[auth] verify-send-failed to=user@x resendError="..."`) and is shaped
 * so a future Sentry / Highlight.io / Logflare adapter can fan events out to
 * a UI without re-parsing free-form strings.
 *
 * What this is NOT:
 *  - a transport. It just calls `console.*` with a stable prefix. Wire your
 *    own sink if you want JSON logs or APM breadcrumbs.
 *  - a privacy filter. The user passes context in, the user keeps it safe.
 *
 * Levels follow standard practice: `info` is a successful event worth a
 * timestamp, `warn` is a recoverable problem the operator should know about,
 * `error` is a fault that probably needs action.
 */

type Fields = Record<string, unknown>;

const emit = (
  level: "info" | "warn" | "error",
  prefix: string,
  fields: Fields,
) => {
  // Sinks should always receive a plain object so they can serialize however
  // they want (JSON.stringify, etc.). Avoid the temptation to embed non-
  // primitive values that don't survive structured parsing (Error objects,
  // Buffers, …).
  const safeFields: Fields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v instanceof Error) {
      safeFields[k] = { name: v.name, message: v.message, stack: v.stack };
    } else if (typeof v !== "function") {
      safeFields[k] = v;
    }
  }
  const line = `[${prefix}] ${Object.keys(safeFields).join(" ")}`;
  (console[level] as (...args: unknown[]) => void)(line, safeFields);
};

export const event = {
  info: (prefix: string, fields: Fields = {}): void =>
    emit("info", prefix, fields),
  warn: (prefix: string, fields: Fields = {}): void =>
    emit("warn", prefix, fields),
  error: (prefix: string, fields: Fields = {}): void =>
    emit("error", prefix, fields),
};
