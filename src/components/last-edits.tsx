import { chapters } from "@/data/chapters";
import { ACCENTS } from "@/lib/accents";
import { prisma } from "@/lib/prisma";

export type LastEdit = {
  id: string;
  chapterId: string;
  tab: string;
  column: string;
  owner: string;
  rowLabel: string;
  oldValue: string;
  newValue: string;
  editedAt: Date;
};

/**
 * How many times the content is repeated across the track.
 *
 * The track shifts by exactly one copy per cycle, so the visible window is
 * only ever gap-free while (COPIES - 1) copies are wider than the screen.
 * Two copies and two short updates leaves a blank stretch on a wide monitor,
 * which reads as the strip stalling. Eleven spare copies covers a 2560px
 * display even with a single short entry, and costs a few spans.
 *
 * That single-entry case is now the common one rather than the edge: expanding
 * a chapter hides the other chapter's entry. It still holds, and with room to
 * spare, because the strip's type grows with the viewport — the wider the
 * screen, the wider each copy is.
 *
 * The strip's height, and the space the board reserves beneath itself for it,
 * both come from --bb-ticker-h in globals.css so the two cannot drift apart.
 */
const COPIES = 12;

/** The newest entry for each chapter — one query per chapter, and there are two. */
export async function readLastEdits(): Promise<LastEdit[]> {
  try {
    const latest = await Promise.all(
      chapters.map((chapter) =>
        prisma.sheetEdit.findFirst({
          where: { chapterId: chapter.id },
          orderBy: { editedAt: "desc" },
        }),
      ),
    );

    return latest.filter((edit): edit is LastEdit => edit !== null);
  } catch {
    // No database reachable — the strip simply does not render.
    return [];
  }
}

/** "3 Sept, 10:46 IST", in the chapter's own zone. */
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
 * The animation is plain CSS shipped inline with the markup, not a Tailwind
 * utility. Keyframes are exactly the kind of newly-introduced class that a
 * stale Turbopack build silently drops, and a strip that mysteriously stops
 * moving is worse than no strip.
 *
 * The colours are --bb-* variables rather than the hex values they used to be.
 * Inline CSS never sees a `dark:` variant, so hardcoding here would have left
 * a white strip glued to the bottom of a dark board.
 */
const css = `
.bb-ticker {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  height: var(--bb-ticker-h);
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--bb-veil);
  border-top: 1px solid var(--bb-line);
  backdrop-filter: blur(6px);
  /* Never intercept a click meant for the table underneath. */
  pointer-events: none;
}

.bb-ticker-track {
  display: flex;
  width: max-content;
  will-change: transform;
  animation: bb-ticker-scroll 20s linear infinite;
}

/* Identical copies sit side by side, so shifting the track by exactly one
   copy width and starting over is seamless - there is no jump to hide.
   ${100 / COPIES}% of the track is precisely one copy.

   The track travels LEFT, which reads as text entering from the right and
   leaving at the left - the direction a news ticker runs, and the one that
   matches how the line itself is read. */
@keyframes bb-ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-${100 / COPIES}%); }
}

.bb-ticker-group {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.bb-ticker-item {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55em;
  padding: 0 2em;
  font-size: var(--bb-ticker-text);
  line-height: 1;
}

.bb-ticker-label {
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.bb-ticker-who { color: var(--bb-ink); font-weight: 500; }
.bb-ticker-where { color: var(--bb-ink-dim); }
.bb-ticker-change { color: var(--bb-ink); }
.bb-ticker-when { color: var(--bb-ink-faint); font-variant-numeric: tabular-nums; }
.bb-ticker-sep { color: var(--bb-ink-ghost); }

@media (prefers-reduced-motion: reduce) {
  .bb-ticker-track {
    animation: none;
    transform: none;
  }
}
`;

export function LastEdits({ edits }: { edits: LastEdit[] }) {
  const items = chapters
    .map((chapter) => ({
      chapter,
      edit: edits.find((entry) => entry.chapterId === chapter.id),
    }))
    .filter(
      (row): row is { chapter: (typeof chapters)[number]; edit: LastEdit } =>
        row.edit !== undefined,
    );

  if (items.length === 0) return null;

  const group = (
    <div className="bb-ticker-group">
      {items.map(({ chapter, edit }) => (
        <span
          className="bb-ticker-item"
          data-ticker-chapter={chapter.id}
          key={chapter.id}
        >
          <span
            className={`bb-ticker-label ${ACCENTS[chapter.accent].title}`}
          >
            {chapter.name.replace(" Chapter", "")}
          </span>
          {edit.owner && (
            <span className="bb-ticker-who">{edit.owner}</span>
          )}
          <span className="bb-ticker-where">
            {edit.tab}
            {edit.rowLabel ? ` · ${edit.rowLabel}` : ""}
            {edit.column ? ` · ${edit.column}` : ""}
          </span>
          {(edit.oldValue || edit.newValue) && (
            <span className="bb-ticker-change">
              {edit.oldValue || "blank"} → {edit.newValue || "blank"}
            </span>
          )}
          <span className="bb-ticker-when">
            {stamp(edit.editedAt, chapter.timeZone, chapter.timeAbbreviation)}
          </span>
          <span className="bb-ticker-sep">•</span>
        </span>
      ))}
    </div>
  );

  return (
    <>
      <style>{css}</style>

      <div className="bb-ticker" aria-label="Last sheet updates">
        <div className="bb-ticker-track">
          {Array.from({ length: COPIES }, (_, copy) => (
            <div
              key={copy}
              style={{ display: "flex" }}
              /* Only the first copy is real content; the rest are padding
                 for the loop and must not be read out twice. */
              aria-hidden={copy > 0 ? "true" : undefined}
            >
              {group}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
