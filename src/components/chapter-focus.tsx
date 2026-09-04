/**
 * Expand one chapter to fill the board, and put it back.
 *
 * No JavaScript, by the same reasoning as the logo curtain: three hidden radio
 * buttons hold the view, and plain CSS sibling rules in globals.css do the
 * rest. That matters more here than it looks. LiveRefresh calls
 * router.refresh() on every sheet edit and every time the tab regains focus,
 * so anything holding this in React state would snap the board back to two
 * columns while someone was reading it — several times an hour.
 *
 * An uncontrolled input survives that. React's updateInput only writes
 * checkedness when a `checked` or `defaultChecked` prop is present, and these
 * have neither, so a refresh reconciles the DOM node without touching it.
 * Which is also why none of them is marked defaultChecked: "both" is simply
 * the state where no rule fires, so the default needs no prop and no CSS.
 */
export const VIEW_BOTH = "bb-view-both";

/** The radio id that expands a given chapter. Kept next to its only consumer. */
export function viewId(chapterId: string) {
  return `bb-view-${chapterId}`;
}

/**
 * Lives next to the grid in page.tsx, because the CSS reaches the board with a
 * sibling combinator — these must stay siblings of it.
 */
export function ChapterViewInputs({ chapterIds }: { chapterIds: string[] }) {
  return (
    <>
      <input type="radio" name="bb-view" id={VIEW_BOTH} className="bb-view" />
      {chapterIds.map((id) => (
        <input
          key={id}
          type="radio"
          name="bb-view"
          id={viewId(id)}
          className="bb-view"
        />
      ))}
    </>
  );
}

function ExpandIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9h6V3M21 9h-6V3M3 15h6v6M21 15h-6v6" />
    </svg>
  );
}

/**
 * Two labels, not one.
 *
 * A radio cannot be unchecked by clicking it again, so the control that
 * expands a chapter cannot also be the one that restores the pair. Both are
 * always rendered and CSS shows whichever the current view calls for.
 */
export function ChapterFocus({
  chapterId,
  name,
}: {
  chapterId: string;
  name: string;
}) {
  const short = name.replace(" Chapter", "");

  return (
    <>
      <label
        htmlFor={viewId(chapterId)}
        className="bb-focus-btn bb-focus-in"
        title={`Show only ${short}`}
        aria-label={`Show only ${short}`}
      >
        <ExpandIcon />
      </label>
      <label
        htmlFor={VIEW_BOTH}
        className="bb-focus-btn bb-focus-out"
        title="Show both chapters"
        aria-label="Show both chapters"
      >
        <CollapseIcon />
      </label>
    </>
  );
}
