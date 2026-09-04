/** Shared class names so every table on the dashboard looks the same. */

/** Card around a table — pair with the chapter accent's `card` border colour. */
export const tableCard = "overflow-hidden rounded-xl border bg-surface";

/**
 * Table root. Monospace is wide, so tables run a step smaller than body text.
 * bb-t-body is fluid against the chapter column — see the type scale in
 * globals.css — so this grows when the chapter is expanded or the screen is.
 */
export const tableBase = "bb-t-body";

/**
 * First column stays put when the table scrolls sideways.
 * Body cells add `bg-surface`; header and footer cells add the accent tint,
 * otherwise scrolled content shows through.
 */
export const stickyBase = "sticky left-0 z-10 border-r border-line";
export const stickyCell = `${stickyBase} bg-surface`;

/** Headers wrap instead of forcing the table wider than the screen. */
export const headCell =
  "h-auto align-bottom leading-tight whitespace-normal bb-t-head";

/** Numeric cells: right aligned, aligned digits, never wrapped. */
export const numCell =
  "bb-t-cell text-right tabular-nums whitespace-nowrap";

/** Plain text cell. */
export const textCell = "bb-t-cell";
