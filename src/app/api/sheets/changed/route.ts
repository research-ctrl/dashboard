import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Called by the Apps Script bound to each Google Sheet whenever an editor
 * saves. Three things happen:
 *
 *  1. revalidateTag("sheets") drops any cached read.
 *  2. sync_state is bumped. Every open dashboard is subscribed to that row
 *     through Supabase Realtime, so they refresh within a second — no browser
 *     ever polls.
 *  3. If the script sent cell details, the edit is recorded against its
 *     chapter so the board can show what changed and who owns it.
 *
 * Every parameter except `secret` is optional, so an older copy of the Apps
 * Script keeps working exactly as before.
 */

/** "Amount opex (Lincoln)" -> "Lincoln". Empty when the header has no owner. */
function ownerFromHeader(header: string) {
  const match = header.match(/\(([^)]*)\)\s*$/);
  return match ? match[1].trim() : "";
}

async function recordEdit(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const spreadsheetId = params.get("spreadsheetId")?.trim();
  const tab = params.get("tab")?.trim();
  if (!spreadsheetId || !tab) return null;

  const column = params.get("column")?.trim() ?? "";
  const firstColumn = params.get("firstColumn")?.trim() ?? "";

  // The edited column names its owner; if it has none — CRM's project columns
  // are bare names — fall back to whoever owns the tab's first column.
  const owner = ownerFromHeader(column) || ownerFromHeader(firstColumn);

  const connection = await prisma.chapterConnection.findFirst({
    where: { spreadsheetId },
  });
  if (!connection) return null;

  await prisma.sheetEdit.upsert({
    where: { chapterId: connection.id },
    update: { tab, column, owner },
    create: { chapterId: connection.id, tab, column, owner },
  });

  return { chapter: connection.id, tab, column, owner };
}

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
  let edit: Awaited<ReturnType<typeof recordEdit>> = null;

  try {
    edit = await recordEdit(request);

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
        error: cause instanceof Error ? cause.message : "database write failed",
      },
      { status: 200 },
    );
  }

  return NextResponse.json({
    revalidated: true,
    pushed: true,
    version,
    source,
    edit,
  });
}

export async function POST(request: NextRequest) {
  return handle(request);
}

/** Same behaviour on GET so the hook can be tested from a browser. */
export async function GET(request: NextRequest) {
  return handle(request);
}
