/**
 * Semantic colours — these read the same in every chapter.
 *
 * As with the accents, these are plain CSS classes from globals.css rather
 * than Tailwind palette utilities, so they follow the theme. Their values live
 * in the --bb-positive / --bb-info / --bb-warn / --bb-danger sets.
 */

/** Completion band: the further along, the cooler the colour. */
export function completionStyle(percent: number) {
  if (percent >= 90) return "bb-text-positive";
  if (percent >= 50) return "bb-text-info";
  if (percent >= 25) return "bb-text-warn";
  return "bb-text-danger";
}

/** Add your own statuses here; anything unlisted falls back to grey. */
const STATUS_BADGES: Record<string, string> = {
  delivered: "bb-badge-positive",
  "land acquired": "bb-badge-positive",
  "approvals in progress": "bb-badge-warn",
  "design stage": "bb-badge-info",
  "yard slot booked": "bb-badge-special",
};

export const STATUS_FALLBACK = "bb-badge-neutral";

export function statusStyle(status: string) {
  return STATUS_BADGES[status.toLowerCase()] ?? STATUS_FALLBACK;
}

/**
 * Whether a cell's text is one of the statuses above.
 *
 * The table used to work this out by sniffing the returned class string for
 * "border-" and "neutral", which quietly tied the rendering decision to how
 * the classes happened to be spelled. Asking the question directly survives
 * renaming them.
 */
export function isKnownStatus(status: string) {
  return status.toLowerCase() in STATUS_BADGES;
}

/** Money that came in. */
export const moneyIn = "bb-text-positive";
/** Cost added this period. */
export const moneyExtra = "bb-text-warn";
/** Cost taken off this period. */
export const moneyRemoved = "bb-text-danger";
