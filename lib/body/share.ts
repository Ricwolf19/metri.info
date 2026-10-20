import { isSiteId, type SiteId } from "@/lib/body/sites";
import { BODY_WINDOWS, type BodyWindow } from "@/lib/body/windows";
import type { BalanceStatus } from "@/lib/training/muscle-load";
import { MUSCLE_HEADS } from "@/lib/training/muscles";

/**
 * The share card's payload, packed into one URL token the way the quiz packs
 * its scores: numbers only, nothing that identifies the account, so the card
 * can be fetched by whoever the link reaches. Tenths are stored as integers;
 * `x` stands for "unknown".
 */
export type BodyShare = {
  sex: "m" | "f";
  windowDays: BodyWindow;
  weekAvgKg: number | null;
  deltaKg: number | null;
  bodyFatPct: number | null;
  sessions: number;
  keySite: SiteId;
  keySiteDeltaCm: number | null;
  /** Balance status per head, in `MUSCLE_HEADS` order. */
  balance: BalanceStatus[];
};

const VERSION = "1";
const STATUS: BalanceStatus[] = ["untrained", "low", "optimal", "high"];

const tenths = (n: number | null) =>
  n === null ? "x" : String(Math.round(n * 10));
const fromTenths = (s: string): number | null | undefined => {
  if (s === "x") return null;
  if (!/^-?\d{1,6}$/.test(s)) return undefined;
  return Number(s) / 10;
};

export const encodeBodyShare = (share: BodyShare): string =>
  [
    VERSION,
    share.sex,
    share.windowDays,
    tenths(share.weekAvgKg),
    tenths(share.deltaKg),
    tenths(share.bodyFatPct),
    Math.max(0, Math.round(share.sessions)),
    share.keySite,
    tenths(share.keySiteDeltaCm),
    share.balance.map((s) => STATUS.indexOf(s)).join(""),
  ].join(".");

/** Strict parse: `null` for anything that is not a token this module wrote. */
export const decodeBodyShare = (value: string | null): BodyShare | null => {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 10 || parts[0] !== VERSION) return null;
  const [, sex, win, avg, delta, fat, sessions, site, siteDelta, bal] = parts;
  if (sex !== "m" && sex !== "f") return null;
  const windowDays = Number(win);
  if (!(BODY_WINDOWS as readonly number[]).includes(windowDays)) return null;
  const weekAvgKg = fromTenths(avg);
  const deltaKg = fromTenths(delta);
  const bodyFatPct = fromTenths(fat);
  const keySiteDeltaCm = fromTenths(siteDelta);
  if (
    weekAvgKg === undefined ||
    deltaKg === undefined ||
    bodyFatPct === undefined ||
    keySiteDeltaCm === undefined
  )
    return null;
  if (!/^\d{1,4}$/.test(sessions) || !isSiteId(site)) return null;
  if (!new RegExp(`^[0-3]{${MUSCLE_HEADS.length}}$`).test(bal)) return null;
  return {
    sex,
    windowDays: windowDays as BodyWindow,
    weekAvgKg,
    deltaKg,
    bodyFatPct,
    sessions: Number(sessions),
    keySite: site,
    keySiteDeltaCm,
    balance: [...bal].map((c) => STATUS[Number(c)]),
  };
};
