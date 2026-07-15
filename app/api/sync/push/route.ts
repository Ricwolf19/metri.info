import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/entitlements";
import { applyPush, type PushDeletion, type PushRow } from "@/lib/sync/store";

/**
 * POST /api/sync/push — premium only. Body:
 *   { changes: PushRow[], deletions: PushDeletion[] }
 * Upserts the caller's rows into the mirror (Last-Write-Wins). The user is taken
 * from the session, so the client can never write another user's data.
 */
export const POST = async (req: Request) => {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can((session.user as { plan?: string }).plan, "sync"))
    return NextResponse.json({ error: "premium_required" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as {
    changes?: PushRow[];
    deletions?: PushDeletion[];
  } | null;
  if (!body)
    return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const changes = Array.isArray(body.changes) ? body.changes : [];
  const deletions = Array.isArray(body.deletions) ? body.deletions : [];
  await applyPush(session.user.id, changes, deletions);

  return NextResponse.json({
    ok: true,
    count: changes.length + deletions.length,
  });
};
