/**
 * The one Google service account behind both read-only Google sources: the
 * GA4 Data API (Viewer on the property) and Search Console (a user on the
 * property). `GA4_CREDENTIALS_JSON` holds its JSON key inline — as pasted, as
 * base64, or with its newlines escaped once too often by a dashboard.
 */
export type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

export const parseServiceAccount = (
  raw: string | undefined,
): ServiceAccount | null => {
  if (!raw?.trim()) return null;
  const text = raw.trim().startsWith("{")
    ? raw.trim()
    : Buffer.from(raw.trim(), "base64").toString("utf8");
  try {
    const parsed = JSON.parse(text) as Partial<ServiceAccount>;
    if (
      typeof parsed.client_email !== "string" ||
      typeof parsed.private_key !== "string"
    )
      return null;
    return {
      client_email: parsed.client_email,
      // `\\n` survives a double-escaped paste; PEM needs real newlines.
      private_key: parsed.private_key.replace(/\\n/g, "\n"),
      project_id: parsed.project_id,
    };
  } catch {
    return null;
  }
};

let cached: { raw: string | undefined; account: ServiceAccount | null } | null =
  null;

/** The parsed account, or null when unset or unreadable. */
export const googleServiceAccount = (): ServiceAccount | null => {
  const raw = process.env.GA4_CREDENTIALS_JSON;
  if (!cached || cached.raw !== raw)
    cached = { raw, account: parseServiceAccount(raw) };
  return cached.account;
};
