/** Shared class names so every table on the dashboard looks the same. */

/** Card around a table — pair with the chapter accent's `card` border colour. */
export const tableCard = "overflow-hidden rounded-xl border bg-surface";

/** Table root — monospace is wide, so tables run a step smaller than body text. */
export const tableBase = "text-xs";

/**
 * First column stays put when the table scrolls sideways.
 * Body cells add `bg-surface`; header and footer cells add the accent tint,
 * otherwise scrolled content shows through.
 */
export const stickyBase = "sticky left-0 z-10 border-r border-line";
export const stickyCell = `${stickyBase} bg-surface`;

/** Headers wrap instead of forcing the table wider than the screen. */
export const headCell =
  "h-auto px-1.5 py-2.5 align-bottom text-[10px] leading-tight whitespace-normal";

/** Numeric cells: right aligned, aligned digits, never wrapped. */
export const numCell = "px-1.5 py-2.5 text-right tabular-nums whitespace-nowrap";

/** Plain text cell. */
export const textCell = "px-1.5 py-2.5";
