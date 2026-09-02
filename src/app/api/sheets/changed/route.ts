import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Called by the Apps Script bound to each Google Sheet whenever an editor
 * saves. Two things happen:
 *
 *  1. revalidateTag("sheets") drops the cached CSV, so the next render reads
 *     the sheet again. Without this the board would serve stale rows.
 *  2. sync_state is bumped. Every open dashboard is subscribed to that row
 *     through Supabase Realtime, so they refresh themselves within a second
 *     — no browser ever polls.
 */
async function handle(request: NextRequest) {
  const secret = process.env.SHEETS_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "SHEETS_WEBHOOK_SECRET is not configured." },
      { status: 500 },
    );
  }

  const provided =
    request.nextUrl.searchParams.get("secret") ??
    request.headers.get("x-webhook-secret");

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = request.nextUrl.searchParams.get("source") ?? "sheet";

  // expire: 0 rather than "max" — a webhook wants the next read to wait for
  // fresh rows, not to be served the stale copy while it refetches.
  revalidateTag("sheets", { expire: 0 });

  let version = 0;
  try {
    const row = await prisma.syncState.upsert({
      where: { id: "global" },
      update: { version: { increment: 1 }, source },
      create: { id: "global", version: 1, source },
    });
    version = row.version;
  } catch (cause) {
    return NextResponse.json(
      {
        revalidated: true,
        pushed: false,
        error: cause instanceof Error ? cause.message : "sync_state update failed",
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ revalidated: true, pushed: true, version, source });
}

export async function POST(request: NextRequest) {
  return handle(request);
}

/** Same behaviour on GET so the hook can be tested from a browser. */
export async function GET(request: NextRequest) {
  return handle(request);
}
