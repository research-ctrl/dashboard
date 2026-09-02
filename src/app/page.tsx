import { ChapterColumn } from "@/components/chapter-column";
import { LiveRefresh } from "@/components/live-refresh";
import { LogoCurtain } from "@/components/logo-curtain";
import { loadChapters } from "@/lib/load-chapters";

/** Rendered per request: the board must never serve a stale page. */
export const dynamic = "force-dynamic";

export default async function Home() {
  const chapters = await loadChapters();
  const anyLive = chapters.some((chapter) => chapter.source === "sheets");

  return (
    <main className="flex-1 bg-white">
      <LiveRefresh />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:px-12">
        <h1 className="sr-only">Dashboard</h1>

        <div className="mb-4 flex items-center justify-end gap-3">
          {!anyLive && (
            <span className="text-[10px] tracking-[0.12em] text-neutral-400 uppercase">
              Showing built-in data — connect the sheets in /admin
            </span>
          )}
          <LogoCurtain />
        </div>

        {/* Two parts: left and right. Stacks on small screens.
            min-w-0 keeps a wide table from stretching its column past a half. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 2xl:gap-10">
          {chapters.map((chapter) => (
            <ChapterColumn key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </div>
    </main>
  );
}
