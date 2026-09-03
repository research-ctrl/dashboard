import { chapters } from "@/data/chapters";
import { ACCENTS } from "@/lib/accents";
import { prisma } from "@/lib/prisma";

export type LastEdit = {
  chapterId: string;
  tab: string;
  column: string;
  owner: string;
  editedAt: Date;
};

export async function readLastEdits(): Promise<LastEdit[]> {
  try {
    return await prisma.sheetEdit.findMany();
  } catch {
    // No database reachable — the panel simply does not render.
    return [];
  }
}

/** "2 Sep, 14:32 IST", in the chapter's own zone. */
function stamp(editedAt: Date, timeZone: string, abbreviation: string) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(editedAt);

  return `${formatted} ${abbreviation}`;
}

/**
 * A quiet marker of who last touched each workbook.
 *
 * The name comes from the edited column's own header — "Amount opex
 * (Lincoln)" — not from a Google account, which is frequently blank and would
 * name the sheet's owner rather than the person responsible for the column.
 */
export function LastEdits({ edits }: { edits: LastEdit[] }) {
  const rows = chapters
    .map((chapter) => ({
      chapter,
      edit: edits.find((entry) => entry.chapterId === chapter.id),
    }))
    .filter((row) => row.edit);

  if (rows.length === 0) return null;

  return (
    <aside
      aria-label="Last sheet updates"
      className="pointer-events-none fixed bottom-3 left-3 z-30 max-w-[min(20rem,calc(100vw-1.5rem))] rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 backdrop-blur"
    >
      <p className="text-[9px] tracking-[0.15em] text-neutral-400 uppercase">
        Last updated
      </p>

      <ul className="mt-1 flex flex-col gap-1">
        {rows.map(({ chapter, edit }) => (
          <li key={chapter.id} className="text-[11px] leading-tight">
            <span
              className={`font-medium tracking-[0.08em] uppercase ${ACCENTS[chapter.accent].title}`}
            >
              {chapter.name.replace(" Chapter", "")}
            </span>{" "}
            <span className="text-neutral-900">
              {edit!.owner || "unknown"}
            </span>{" "}
            <span className="text-neutral-500">
              · {edit!.tab}
              {edit!.column ? ` · ${edit!.column}` : ""}
            </span>
            <br />
            <span className="tabular-nums text-neutral-400">
              {stamp(edit!.editedAt, chapter.timeZone, chapter.timeAbbreviation)}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
