import "server-only";

/**
 * Wire contract for the premium sync endpoints — the trust boundary between the
 * mobile app and this server. The client is an APK anyone can decompile,
 * repoint or replay, so everything is validated and normalized here before it
 * reaches the store.
 *
 * @see docs/sync.md → "Rules the server enforces"
 */

/** Mirrors `SYNC_TABLES` in the mobile app. Anything else is rejected outright
 * so a compromised client can't seed junk table names into the mirror. */
export const SYNC_TABLES = [
  "exercises",
  "programs",
  "routines",
  "workout_days",
  "workout_day_exercises",
  "week_configs",
  "user_programs",
  "workout_logs",
  "set_logs",
  "training_days",
  "body_metrics",
  "body_measurements",
  "body_goals",
  "custom_foods",
  "food_logs",
  "exercise_settings",
  "warmup_routines",
] as const;

const TABLES = new Set<string>(SYNC_TABLES);

export const LIMITS = {
  /** Rows + deletions in one push. The client chunks well below this. */
  batch: 1000,
  /** Serialized size of a single row's `data`. */
  rowBytes: 64 * 1024,
  /** Rows returned by one pull, so a large history paginates. */
  pullPage: 1000,
  /** How far ahead of server time a client clock is allowed to be. Beyond this
   * the timestamp is clamped rather than rejected — phone clocks drift, and a
   * hard failure would strand a user who can't sync until they fix it. */
  clockSkewMs: 5 * 60 * 1000,
} as const;

export type PushRow = {
  table: string;
  id: string;
  updatedAt: number;
  data: unknown;
};
export type PushDeletion = { table: string; id: string; deletedAt: number };

export type ValidationError = { error: string; detail?: string };

const isId = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0 && v.length <= 128;

const isTable = (v: unknown): v is string =>
  typeof v === "string" && TABLES.has(v);

/** Finite and positive; future values are clamped — see `LIMITS.clockSkewMs`. */
const normalizeTs = (v: unknown, now: number): number | null => {
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return null;
  return Math.min(v, now + LIMITS.clockSkewMs);
};

const rowTooBig = (data: unknown): boolean => {
  try {
    return JSON.stringify(data ?? null).length > LIMITS.rowBytes;
  } catch {
    // Circular or otherwise unserializable — it can't be stored as jsonb.
    return true;
  }
};

export type ParsedPush = {
  rows: PushRow[];
  deletions: PushDeletion[];
  /** Device id of the writer, if the client sent one. Stored as `origin` so
   * the pull can exclude a device's own writes (echo suppression). */
  origin: string | null;
};

/** Optional device id: absent is fine (legacy clients), a present-but-invalid
 * one is a hard error like everything else at this boundary. */
const parseDeviceId = (v: unknown): string | null | ValidationError => {
  if (v === undefined || v === null) return null;
  if (!isId(v)) return { error: "bad_request", detail: "invalid deviceId" };
  return v;
};

/**
 * Validate and normalize a push body. Returns the sanitized payload or a
 * `ValidationError` for the route to turn into a 400/413.
 *
 * Duplicate (table,id) pairs within one batch are collapsed to the newest
 * timestamp: Postgres raises `ON CONFLICT DO UPDATE command cannot affect row a
 * second time` when the same key appears twice in one statement, which would
 * have failed the entire chunk.
 */
export const parsePush = (
  body: unknown,
  now: number,
): ParsedPush | ValidationError => {
  if (typeof body !== "object" || body === null) {
    return { error: "bad_request", detail: "body must be an object" };
  }
  const { changes, deletions, deviceId } = body as {
    changes?: unknown;
    deletions?: unknown;
    deviceId?: unknown;
  };
  const origin = parseDeviceId(deviceId);
  if (isValidationError(origin)) return origin;
  // Absent arrays are an empty push; a present-but-non-array value is a broken
  // client, and silently accepting it would let it advance its watermark past
  // changes that never landed.
  if (changes != null && !Array.isArray(changes)) {
    return { error: "bad_request", detail: "changes must be an array" };
  }
  if (deletions != null && !Array.isArray(deletions)) {
    return { error: "bad_request", detail: "deletions must be an array" };
  }
  const rawRows = changes ?? [];
  const rawDels = deletions ?? [];

  if (rawRows.length + rawDels.length > LIMITS.batch) {
    return { error: "payload_too_large", detail: `max ${LIMITS.batch} items` };
  }

  // Newest-wins per (table,id), across changes and deletions alike.
  const byKey = new Map<
    string,
    { row: PushRow | null; del: PushDeletion | null; ts: number }
  >();

  for (const raw of rawRows) {
    if (typeof raw !== "object" || raw === null) {
      return { error: "bad_request", detail: "change must be an object" };
    }
    const { table, id, updatedAt, data } = raw as Record<string, unknown>;
    if (!isTable(table)) {
      return {
        error: "bad_request",
        detail: `unknown table: ${String(table)}`,
      };
    }
    if (!isId(id)) return { error: "bad_request", detail: "invalid row id" };
    const ts = normalizeTs(updatedAt, now);
    if (ts === null) {
      return { error: "bad_request", detail: "invalid updatedAt" };
    }
    if (rowTooBig(data)) {
      return { error: "payload_too_large", detail: `row ${id} exceeds limit` };
    }
    const key = `${table}:${id}`;
    const prev = byKey.get(key);
    if (!prev || ts >= prev.ts) {
      byKey.set(key, {
        row: { table, id, updatedAt: ts, data },
        del: null,
        ts,
      });
    }
  }

  for (const raw of rawDels) {
    if (typeof raw !== "object" || raw === null) {
      return { error: "bad_request", detail: "deletion must be an object" };
    }
    const { table, id, deletedAt } = raw as Record<string, unknown>;
    if (!isTable(table)) {
      return {
        error: "bad_request",
        detail: `unknown table: ${String(table)}`,
      };
    }
    if (!isId(id)) return { error: "bad_request", detail: "invalid row id" };
    const ts = normalizeTs(deletedAt, now);
    if (ts === null) {
      return { error: "bad_request", detail: "invalid deletedAt" };
    }
    const key = `${table}:${id}`;
    const prev = byKey.get(key);
    if (!prev || ts >= prev.ts) {
      byKey.set(key, { row: null, del: { table, id, deletedAt: ts }, ts });
    }
  }

  const rows: PushRow[] = [];
  const dels: PushDeletion[] = [];
  for (const entry of byKey.values()) {
    if (entry.row) rows.push(entry.row);
    else if (entry.del) dels.push(entry.del);
  }
  return { rows, deletions: dels, origin };
};

/** ISO cursor + optional device id from a pull body. `since: null` means "from
 * the beginning"; an unparseable string is an error rather than a silent full
 * resync. `deviceId` lets the store exclude the caller's own writes. */
export const parseCursor = (
  body: unknown,
): { since: string | null; deviceId: string | null } | ValidationError => {
  if (body === null || typeof body !== "object") {
    return { since: null, deviceId: null };
  }
  const { since, deviceId: rawDeviceId } = body as {
    since?: unknown;
    deviceId?: unknown;
  };
  const deviceId = parseDeviceId(rawDeviceId);
  if (isValidationError(deviceId)) return deviceId;
  if (since === undefined || since === null) return { since: null, deviceId };
  if (typeof since !== "string") {
    return { error: "bad_request", detail: "since must be a string" };
  }
  if (Number.isNaN(new Date(since).getTime())) {
    return { error: "bad_request", detail: "since is not a valid date" };
  }
  return { since, deviceId };
};

export const isValidationError = (v: unknown): v is ValidationError =>
  typeof v === "object" && v !== null && "error" in v;
