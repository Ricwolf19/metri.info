import { connection, NextResponse } from "next/server";

import { getLatestRelease } from "@/lib/releases/store";

/**
 * GET /api/latest-version — public; the app's update check reads it.
 * 200 `AppRelease` · 404 `{ error: "no_release" }`.
 *
 * `connection()` keeps the handler request-time so the explicit CDN header
 * below is what ships; the data comes from the tagged `use cache` read, which
 * the release webhook expires.
 */
export const GET = async () => {
  await connection();
  const release = await getLatestRelease();
  if (!release) {
    return NextResponse.json(
      { error: "no_release" },
      { status: 404, headers: { "Cache-Control": "public, s-maxage=60" } },
    );
  }
  return NextResponse.json(release, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
};
