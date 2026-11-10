/**
 * Whether a request carries the `CRON_SECRET` bearer token Vercel Cron
 * attaches. Fails closed: with the variable unset nothing is authorized, so a
 * fresh deploy without the secret can't be triggered by strangers.
 */
export const isCronRequest = (req: Request): boolean => {
  const secret = process.env.CRON_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
};
