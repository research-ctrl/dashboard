/**
 * Per-chapter colour. Every value is a complete, literal class string —
 * Tailwind only sees classes it can find as whole words in the source, so
 * these must never be built by concatenation.
 *
 * To recolour a chapter, change its `accent` in the chapter's data file.
 */
export type AccentName = "amber" | "indigo" | "teal";

export type Accent = {
  /** Chapter title. */
  title: string;
  /** Rule under the chapter title. */
  rule: string;
  /** Table header row — includes hover so it keeps its tint. */
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
    title: "text-amber-800",
    rule: "bg-amber-500",
    headRow: "bg-amber-50 text-amber-900 hover:bg-amber-50",
    headSticky: "bg-amber-50",
    footRow: "bg-amber-50 hover:bg-amber-50",
    footSticky: "bg-amber-50",
    card: "border-amber-200",
    strong: "text-amber-800",
  },
  indigo: {
    title: "text-indigo-800",
    rule: "bg-indigo-500",
    headRow: "bg-indigo-50 text-indigo-900 hover:bg-indigo-50",
    headSticky: "bg-indigo-50",
    footRow: "bg-indigo-50 hover:bg-indigo-50",
    footSticky: "bg-indigo-50",
    card: "border-indigo-200",
    strong: "text-indigo-800",
  },
  teal: {
    title: "text-teal-800",
    rule: "bg-teal-500",
    headRow: "bg-teal-50 text-teal-900 hover:bg-teal-50",
    headSticky: "bg-teal-50",
    footRow: "bg-teal-50 hover:bg-teal-50",
    footSticky: "bg-teal-50",
    card: "border-teal-200",
    strong: "text-teal-800",
  },
};
