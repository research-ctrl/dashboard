import { ChapterClock } from "@/components/chapter-clock";
import { ChapterFocus } from "@/components/chapter-focus";
import { SheetTable } from "@/components/sheet-table";
import type { LoadedChapter } from "@/lib/load-chapters";
import { ACCENTS } from "@/lib/accents";

const tableTitle =
  "bb-t-label mb-2 font-medium tracking-[0.15em] text-ink-dim uppercase";

export function ChapterColumn({ chapter }: { chapter: LoadedChapter }) {
  const accent = ACCENTS[chapter.accent];

  return (
    <section className="flex min-w-0 flex-col gap-6" data-chapter={chapter.id}>
      <div>
        <div className="flex items-start justify-between gap-4">
          <h2
            className={`bb-t-title font-medium tracking-[0.2em] uppercase ${accent.title}`}
          >
            {chapter.name}
          </h2>
          <div className="flex shrink-0 items-start gap-3">
            <ChapterClock
              timeZone={chapter.timeZone}
              label={chapter.timeZoneLabel}
              accentClass={accent.title}
            />
            <ChapterFocus chapterId={chapter.id} name={chapter.name} />
          </div>
        </div>
        <div className={`mt-3 h-1 w-full rounded-full ${accent.rule}`} />
      </div>

      {chapter.tables.map(({ tab, title, result }) => (
        <div key={tab}>
          <h3 className={tableTitle}>{title}</h3>

          {result.ok ? (
            <SheetTable table={result.table} accent={accent} />
          ) : (
            /* Never quietly substitute other data — say what failed. */
            <p className="bb-badge-danger bb-t-body rounded-xl border px-3 py-2">
              Could not read the “{tab}” tab — {result.problem}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
