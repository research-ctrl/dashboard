import { ChapterClock } from "@/components/chapter-clock";
import { SheetTable } from "@/components/sheet-table";
import type { LoadedChapter } from "@/lib/load-chapters";
import { ACCENTS } from "@/lib/accents";

const tableTitle =
  "mb-2 text-[11px] font-medium tracking-[0.15em] text-neutral-500 uppercase";

export function ChapterColumn({ chapter }: { chapter: LoadedChapter }) {
  const accent = ACCENTS[chapter.accent];

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h2
            className={`text-lg font-medium tracking-[0.2em] uppercase ${accent.title}`}
          >
            {chapter.name}
          </h2>
          <ChapterClock
            timeZone={chapter.timeZone}
            label={chapter.timeZoneLabel}
            accentClass={accent.title}
          />
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
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              Could not read the “{tab}” tab — {result.problem}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
