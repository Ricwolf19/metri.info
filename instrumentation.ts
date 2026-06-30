/**
 * Next.js instrumentation — runs once per server boot (dev / prod / cold start).
 * Acts as the env gate: in production a misconfigured deploy throws here and
 * never serves, so the failure mode is "the app didn't come up" pointing at a
 * missing env var. Node runtime only; the validator no-ops during `next build`.
 */
export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { validateEnv } = await import("./lib/env");
  validateEnv();
};
