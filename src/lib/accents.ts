/**
 * Per-chapter colour.
 *
 * Every value is a complete, literal class string, never built by
 * concatenation — but these are now plain CSS classes defined in globals.css,
 * not Tailwind utilities. Two reasons:
 *
 *  - They have to follow the theme. A fixed palette class is a fixed colour; a header
 *    row painted with it stays cream in dark mode. `.bb-head-amber` reads
 *    --bb-amber-fill, which the theme redefines.
 *  - Tailwind only emits a utility it can find as a whole word in the source,
 *    and a stale Turbopack scan silently dropping newly-added classes has cost
 *    this project hours. Literal CSS always ships.
 *
 * To recolour a chapter, change its `accent` in the chapter's data file. To
 * change what an accent looks like, edit the --bb-<name>-* variables in
 * globals.css — both themes are defined there, side by side.
 */
export type AccentName = "amber" | "indigo" | "teal";

export type Accent = {
  /** Chapter title. */
  title: string;
  /** Rule under the chapter title. */
  rule: string;
  /** Table header row — keeps its tint on hover. */
  headRow: string;
  /** Sticky first cell in the header row; must match headRow's background. */
  headSticky: string;
  /** Totals row. */
  footRow: string;
  footSticky: string;
  /** Card border. */
  card: string;
  /** Emphasised figures, e.g. column totals. */
  strong: string;
};

export const ACCENTS: Record<AccentName, Accent> = {
  amber: {
    title: "bb-title-amber",
    rule: "bb-rule-amber",
    headRow: "bb-head-amber",
    headSticky: "bb-fill-amber",
    footRow: "bb-fill-amber",
    footSticky: "bb-fill-amber",
    card: "bb-card-amber",
    strong: "bb-strong-amber",
  },
  indigo: {
    title: "bb-title-indigo",
    rule: "bb-rule-indigo",
    headRow: "bb-head-indigo",
    headSticky: "bb-fill-indigo",
    footRow: "bb-fill-indigo",
    footSticky: "bb-fill-indigo",
    card: "bb-card-indigo",
    strong: "bb-strong-indigo",
  },
  teal: {
    title: "bb-title-teal",
    rule: "bb-rule-teal",
    headRow: "bb-head-teal",
    headSticky: "bb-fill-teal",
    footRow: "bb-fill-teal",
    footSticky: "bb-fill-teal",
    card: "bb-card-teal",
    strong: "bb-strong-teal",
  },
};
