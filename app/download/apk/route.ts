import { connection } from "next/server";

import { event } from "@/lib/log/logger";
import { getLatestRelease } from "@/lib/releases/store";
import type { AppRelease } from "@/lib/releases/types";
import { mobileAppReleases } from "@/lib/site";

/**
 * GET /download/apk — the Android package, served from our own origin.
 *
 * GitHub serves release assets as `application/octet-stream` behind a signed
 * redirect to objects.githubusercontent.com. Android browsers download that,
 * but the download manager cannot classify it as a package: Chrome sits at
 * "Downloading… 100%" waiting for a type it never gets, and nothing offers to
 * install. Streaming the same bytes through here with the APK media type, an
 * explicit filename and Range passthrough lets the phone finish, verify and
 * hand off to the installer. Desktop never noticed because it only saves the
 * file.
 *
 * The body is streamed (never buffered), so the function stays small; the
 * versioned upstream URL is immutable, so a resumed download gets the same
 * bytes. `HEAD` answers link scanners and download managers without moving
 * the body. With no release known we fall back to the releases list.
 */
export const maxDuration = 300;

const PASSTHROUGH = [
  "content-length",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
] as const;

/** Only a single byte range is forwarded: a multi-range request would make
 * upstream answer `multipart/byteranges` under our single-part media type. */
const SINGLE_RANGE = /^bytes=\d*-\d*$/;

const apkHeaders = (release: AppRelease, upstream: Response) => {
  const headers = new Headers();
  for (const name of PASSTHROUGH) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (!headers.has("accept-ranges")) headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", "application/vnd.android.package-archive");
  headers.set(
    "Content-Disposition",
    `attachment; filename="metri-${release.version}.apk"`,
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cache-Control", "no-store");
  return headers;
};

const serve = async (request: Request, method: "GET" | "HEAD") => {
  await connection();
  const release = await getLatestRelease();
  if (!release) return Response.redirect(mobileAppReleases, 302);

  const rawRange = request.headers.get("range");
  const range = rawRange && SINGLE_RANGE.test(rawRange) ? rawRange : null;
  let upstream: Response;
  try {
    upstream = await fetch(release.apkUrl, {
      method,
      headers: range ? { range } : undefined,
      redirect: "follow",
      cache: "no-store",
    });
  } catch (error) {
    event.warn("release.apk-proxy-failed", {
      tag: release.tag,
      error: String(error),
    });
    return Response.redirect(release.apkUrl, 302);
  }
  // A resume past the end is the client's mistake; answer it, don't redirect.
  if (upstream.status === 416) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": upstream.headers.get("content-range") ?? "" },
    });
  }
  if (!upstream.ok) {
    event.warn("release.apk-proxy-upstream", {
      tag: release.tag,
      status: upstream.status,
    });
    return Response.redirect(release.apkUrl, 302);
  }
  return new Response(method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers: apkHeaders(release, upstream),
  });
};

export const GET = (request: Request) => serve(request, "GET");
export const HEAD = (request: Request) => serve(request, "HEAD");
