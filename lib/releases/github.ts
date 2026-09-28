import "server-only";

import { event } from "@/lib/log/logger";
import { mobileAppRepo } from "@/lib/site";

import type { AppRelease } from "./types";

/**
 * GitHub side of the release contract. The mobile repo's CI uploads, to every
 * release-please release `metri-v<version>`:
 *
 *   metri-<version>.apk · metri-<version>.apk.sha256 · release.json
 *
 * `release.json` is the only machine-readable source we trust; the release's
 * own metadata supplies the changelog (`body`) and the publish date. Nothing
 * here throws — every failure collapses into a typed reason for the caller.
 */

const API = mobileAppRepo.replace(
  "https://github.com/",
  "https://api.github.com/repos/",
);
const MANIFEST = "release.json";
const TIMEOUT_MS = 10_000;
/** Release-please changelogs are a few KB; anything past this is not one. */
const MAX_NOTES = 50_000;

/** `metri-v1.12.0`, optionally with a semver pre-release suffix. Also guards
 * the tag before it is interpolated into a GitHub URL path. */
export const TAG_RE = /^metri-v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;
const SHA256_RE = /^[a-f0-9]{64}$/;

export type FetchFailure = "not_found" | "invalid" | "unavailable";
export type FetchResult =
  | { ok: true; release: AppRelease }
  | { ok: false; reason: FetchFailure };

type GithubAsset = { name: string; browser_download_url: string };
type GithubRelease = {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  body: string;
  published_at: string;
  assets: GithubAsset[];
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const parseGithubRelease = (raw: unknown): GithubRelease | null => {
  if (!isRecord(raw)) return null;
  const { tag_name, draft, prerelease, body, published_at, assets } = raw;
  if (
    typeof tag_name !== "string" ||
    typeof draft !== "boolean" ||
    typeof prerelease !== "boolean" ||
    typeof published_at !== "string" ||
    !Array.isArray(assets)
  ) {
    return null;
  }
  return {
    tag_name,
    draft,
    prerelease,
    body: typeof body === "string" ? body : "",
    published_at,
    assets: assets.flatMap((a) =>
      isRecord(a) &&
      typeof a.name === "string" &&
      typeof a.browser_download_url === "string"
        ? [{ name: a.name, browser_download_url: a.browser_download_url }]
        : [],
    ),
  };
};

/**
 * Validate `release.json` against its GitHub release: the manifest's tag must
 * be the release's tag, its version the tag's version, and its APK an asset
 * actually attached to that release.
 */
const buildRelease = (
  manifest: unknown,
  release: GithubRelease,
): AppRelease | null => {
  if (!isRecord(manifest)) return null;
  const { version, tag, runtimeVersion, apk, sha256, sizeBytes } = manifest;
  const tagMatch = TAG_RE.exec(release.tag_name);
  if (
    !tagMatch ||
    tag !== release.tag_name ||
    version !== tagMatch[1] ||
    typeof runtimeVersion !== "string" ||
    runtimeVersion.length === 0 ||
    runtimeVersion.length > 256 ||
    // The contract names the file after the version, so the link always
    // matches the build it describes.
    apk !== `metri-${version}.apk` ||
    !release.assets.some((a) => a.name === apk) ||
    typeof sha256 !== "string" ||
    !SHA256_RE.test(sha256.toLowerCase()) ||
    typeof sizeBytes !== "number" ||
    !Number.isSafeInteger(sizeBytes) ||
    sizeBytes <= 0
  ) {
    return null;
  }
  const publishedAt = new Date(release.published_at);
  if (Number.isNaN(publishedAt.getTime())) return null;

  return {
    version: tagMatch[1],
    tag: release.tag_name,
    runtimeVersion,
    apkUrl: `${mobileAppRepo}/releases/download/${release.tag_name}/${apk}`,
    sha256: sha256.toLowerCase(),
    sizeBytes,
    notes: release.body.slice(0, MAX_NOTES),
    publishedAt: publishedAt.toISOString(),
    releaseUrl: `${mobileAppRepo}/releases/tag/${release.tag_name}`,
  };
};

// Public repo, so no token: a release costs a handful of unauthenticated calls
// (well under GitHub's 60/hour per IP), and the fallback read is cached for hours.
const apiHeaders = (): Record<string, string> => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "metri.info",
});

type Json = { status: "ok"; body: unknown } | { status: FetchFailure };

const getJson = async (url: string, init: RequestInit): Promise<Json> => {
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 404) return { status: "not_found" };
    if (!res.ok) {
      event.warn("release.github-http", { url, status: res.status });
      return { status: "unavailable" };
    }
    return { status: "ok", body: await res.json() };
  } catch (error) {
    // A body that is not JSON lands here too — treat it as unreachable
    // rather than invalid: the manifest might just be mid-upload.
    event.warn("release.github-fetch-failed", { url, error });
    return { status: "unavailable" };
  }
};

/** Download and validate the release's `release.json` asset. The URL must be
 * exactly the known repo's asset for THIS tag — never a URL the API response
 * merely points at (SSRF guard, and it pins the manifest to its release). */
const resolveManifest = async (
  release: GithubRelease,
): Promise<FetchResult> => {
  const asset = release.assets.find((a) => a.name === MANIFEST);
  if (!asset) return { ok: false, reason: "not_found" };
  const expected = `${mobileAppRepo}/releases/download/${release.tag_name}/${MANIFEST}`;
  if (asset.browser_download_url !== expected) {
    return { ok: false, reason: "invalid" };
  }
  const manifest = await getJson(expected, {
    headers: { "User-Agent": "metri.info" },
    cache: "no-store",
  });
  if (manifest.status !== "ok") return { ok: false, reason: manifest.status };
  const built = buildRelease(manifest.body, release);
  if (!built) {
    event.warn("release.manifest-invalid", { tag: release.tag_name });
    return { ok: false, reason: "invalid" };
  }
  return { ok: true, release: built };
};

/** One release by tag — what the notify webhook stores. Drafts and
 * pre-releases are `not_found`: only a stable release is announced. */
export const fetchReleaseByTag = async (tag: string): Promise<FetchResult> => {
  if (!TAG_RE.test(tag)) return { ok: false, reason: "invalid" };
  const res = await getJson(`${API}/releases/tags/${tag}`, {
    headers: apiHeaders(),
    cache: "no-store",
  });
  if (res.status !== "ok") return { ok: false, reason: res.status };
  const release = parseGithubRelease(res.body);
  if (!release) return { ok: false, reason: "invalid" };
  if (release.draft || release.prerelease || release.tag_name !== tag) {
    return { ok: false, reason: "not_found" };
  }
  return resolveManifest(release);
};

/**
 * Newest stable release that carries a `release.json` — the fallback for an
 * empty `app_release` table (first deploy, or a DB outage). Older releases cut
 * before the manifest existed are skipped, not errors.
 */
export const fetchLatestFromGithub = async (): Promise<AppRelease | null> => {
  const res = await getJson(`${API}/releases?per_page=10`, {
    headers: apiHeaders(),
  });
  if (res.status !== "ok" || !Array.isArray(res.body)) return null;
  const candidate = res.body
    .map(parseGithubRelease)
    .find(
      (r): r is GithubRelease =>
        r !== null &&
        !r.draft &&
        !r.prerelease &&
        TAG_RE.test(r.tag_name) &&
        r.assets.some((a) => a.name === MANIFEST),
    );
  if (!candidate) return null;
  const result = await resolveManifest(candidate);
  return result.ok ? result.release : null;
};
