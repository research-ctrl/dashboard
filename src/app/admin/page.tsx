import { redirect } from "next/navigation";

import { signOut } from "@/app/admin/actions";
import { ConnectionsForm } from "@/components/admin/connections-form";
import { EditLog, type LogEntry } from "@/components/admin/edit-log";
import { ThemeToggle } from "@/components/theme-toggle";
import { chapters as chapterMeta } from "@/data/chapters";
import { getAdminUser, needsSetup } from "@/lib/auth";
import { readConnectionStatus } from "@/lib/connection-status";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Connections" };

// Reads cookies and the database on every request; never prerender it.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (await needsSetup()) redirect("/admin/setup");

  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  const [connections, status, edits, lastWebhook] = await Promise.all([
    prisma.chapterConnection.findMany({ orderBy: { createdAt: "asc" } }),
    readConnectionStatus(),
    prisma.sheetEdit.findMany({ orderBy: { editedAt: "desc" }, take: 60 }),
    prisma.appSetting.findUnique({ where: { key: "last_webhook" } }),
  ]);

  // Stamped here rather than in the client component, so each entry can use
  // its own chapter's time zone.
  const logEntries: LogEntry[] = edits.map((edit) => {
    const chapter = chapterMeta.find((item) => item.id === edit.chapterId);

    const stamp = new Intl.DateTimeFormat("en-GB", {
      timeZone: chapter?.timeZone ?? "UTC",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(edit.editedAt);

    return {
      id: edit.id,
      chapterId: edit.chapterId,
      chapterName: chapter?.name.replace(" Chapter", "") ?? edit.chapterId,
      tab: edit.tab,
      column: edit.column,
      owner: edit.owner,
      rowLabel: edit.rowLabel,
      oldValue: edit.oldValue,
      newValue: edit.newValue,
      stamp: `${stamp} ${chapter?.timeAbbreviation ?? "UTC"}`,
    };
  });

  return (
    <main className="flex-1 bg-canvas">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-lg font-medium tracking-[0.2em] text-ink uppercase">
            Connections
          </h1>
          <div className="flex items-center gap-3">
            <form action={signOut}>
              <button
                type="submit"
                className="cursor-pointer text-xs text-ink-dim underline underline-offset-4 hover:text-ink"
              >
                Sign out {admin.email}
              </button>
            </form>
            <ThemeToggle />
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-ink-mute">
          One Google Sheet per chapter, five tabs inside it. Each sheet must be
          shared as Anyone with the link. Saved to Supabase, so every admin sees
          the same values.
        </p>

        {/* Read live on every load: a failed read silently falls back to the
            built-in rows, so without this the only symptom is "my edits do
            nothing". */}
        <section className="mt-6 rounded-xl border border-line p-4">
          <h2 className="text-[10px] font-medium tracking-[0.15em] text-ink-dim uppercase">
            Live check
          </h2>

          <div className="mt-3 flex flex-col gap-4">
            {status.map((chapter) => (
              <div key={chapter.id}>
                <div className="flex items-baseline gap-2 text-xs">
                  <span className="font-medium text-ink">
                    {chapter.name}
                  </span>
                  {chapter.live ? (
                    <span className="text-positive">reading from Sheets</span>
                  ) : chapter.spreadsheetId ? (
                    <span className="text-danger">
                      not reading — showing built-in data
                    </span>
                  ) : (
                    <span className="text-ink-faint">no sheet linked</span>
                  )}
                </div>

                {chapter.spreadsheetId && (
                  <p className="mt-0.5 text-[11px] break-all text-ink-faint">
                    {chapter.spreadsheetId}
                  </p>
                )}

                <ul className="mt-1.5 flex flex-col gap-0.5">
                  {chapter.tabs.map((tab) => (
                    <li key={tab.tab} className="text-[11px] text-ink-mute">
                      <span
                        className={tab.ok ? "text-positive" : "text-danger"}
                      >
                        {tab.ok ? "OK" : "FAIL"}
                      </span>{" "}
                      <span className="text-ink">{tab.tab}</span>
                      {tab.ok ? (
                        <span className="text-ink-faint">
                          {" "}
                          — {tab.rows} row{tab.rows === 1 ? "" : "s"},{" "}
                          {tab.columns} column{tab.columns === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="text-danger"> — {tab.problem}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {lastWebhook && (
          <section className="mt-6 rounded-xl border border-line p-4">
            <h2 className="text-[10px] font-medium tracking-[0.15em] text-ink-dim uppercase">
              Last webhook received
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-dim">
              Exactly what the Apps Script last sent.{" "}
              <code className="text-ink">scriptVersion</code> missing or
              below 4 means that sheet is running an outdated copy — re-paste
              it. <code className="text-ink">trigger: &quot;change&quot;</code>{" "}
              means the edit arrived without before/after values, which Sheets
              only supplies on a single-cell edit.
            </p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-surface-alt p-2 text-[11px] text-ink-mute">
              {JSON.stringify(JSON.parse(lastWebhook.value), null, 2)}
            </pre>
          </section>
        )}

        <EditLog entries={logEntries} />

        <ConnectionsForm connections={connections} />

        <a
          href="/"
          className="mt-8 inline-block text-xs text-ink-dim underline underline-offset-4 hover:text-ink"
        >
          Back to the board
        </a>
      </div>
    </main>
  );
}
