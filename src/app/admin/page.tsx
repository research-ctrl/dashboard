import { redirect } from "next/navigation";

import { signOut } from "@/app/admin/actions";
import { ConnectionsForm } from "@/components/admin/connections-form";
import { getAdminUser, needsSetup } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Connections" };

// Reads cookies and the database on every request; never prerender it.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (await needsSetup()) redirect("/admin/setup");

  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  const connections = await prisma.chapterConnection.findMany({
    orderBy: { createdAt: "asc" },
  });

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
          One Google Sheet per chapter, four tabs inside it. Upload the workbooks
          from /excel to Drive, open each as a Google Sheet, then paste its link
          here. These are stored in Supabase, so every admin sees the same values.
        </p>

        <p className="mt-3 max-w-2xl rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          The sheet reads are not built yet. Links are saved, but the board still
          renders its built-in data.
        </p>

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
