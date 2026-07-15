import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/entitlements";
import { pullSince } from "@/lib/sync/store";

/**
 * POST /api/sync/pull — premium only. Body: { since: string | null } (the ISO
 * cursor from the previous pull). Returns the caller's rows changed since then
 * plus the new cursor.
 */
export const POST = async (req: Request) => {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can((session.user as { plan?: string }).plan, "sync"))
    return NextResponse.json({ error: "premium_required" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    since?: string | null;
  };
  const since = typeof body?.since === "string" ? body.since : null;

  const result = await pullSince(session.user.id, since);
  return NextResponse.json(result);
};
