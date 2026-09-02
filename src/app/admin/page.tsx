import { redirect } from "next/navigation";

import { signOut } from "@/app/admin/actions";
import { ConnectionsForm } from "@/components/admin/connections-form";
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

  const [connections, status] = await Promise.all([
    prisma.chapterConnection.findMany({ orderBy: { createdAt: "asc" } }),
    readConnectionStatus(),
  ]);

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-lg font-medium tracking-[0.2em] text-neutral-900 uppercase">
            Connections
          </h1>
          <form action={signOut}>
            <button
              type="submit"
              className="cursor-pointer text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
            >
              Sign out {admin.email}
            </button>
          </form>
        </div>

        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-neutral-600">
          One Google Sheet per chapter, four tabs inside it. Each sheet must be
          shared as Anyone with the link. Saved to Supabase, so every admin sees
          the same values.
        </p>

        {/* Read live on every load: a failed read silently falls back to the
            built-in rows, so without this the only symptom is "my edits do
            nothing". */}
        <section className="mt-6 rounded-xl border border-neutral-200 p-4">
          <h2 className="text-[10px] font-medium tracking-[0.15em] text-neutral-500 uppercase">
            Live check
          </h2>

          <div className="mt-3 flex flex-col gap-4">
            {status.map((chapter) => (
              <div key={chapter.id}>
                <div className="flex items-baseline gap-2 text-xs">
                  <span className="font-medium text-neutral-900">
                    {chapter.name}
                  </span>
                  {chapter.live ? (
                    <span className="text-emerald-700">reading from Sheets</span>
                  ) : chapter.spreadsheetId ? (
                    <span className="text-rose-700">
                      not reading — showing built-in data
                    </span>
                  ) : (
                    <span className="text-neutral-400">no sheet linked</span>
                  )}
                </div>

                {chapter.spreadsheetId && (
                  <p className="mt-0.5 text-[11px] break-all text-neutral-400">
                    {chapter.spreadsheetId}
                  </p>
                )}

                <ul className="mt-1.5 flex flex-col gap-0.5">
                  {chapter.tabs.map((tab) => (
                    <li key={tab.tab} className="text-[11px] text-neutral-600">
                      <span
                        className={tab.ok ? "text-emerald-700" : "text-rose-700"}
                      >
                        {tab.ok ? "OK" : "FAIL"}
                      </span>{" "}
                      <span className="text-neutral-900">{tab.tab}</span>
                      {tab.ok ? (
                        <span className="text-neutral-400">
                          {" "}
                          — {tab.rows} row{tab.rows === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="text-rose-700"> — {tab.problem}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <ConnectionsForm connections={connections} />

        <a
          href="/"
          className="mt-8 inline-block text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
        >
          Back to the board
        </a>
      </div>
    </main>
  );
}
