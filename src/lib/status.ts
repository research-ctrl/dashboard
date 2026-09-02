/** Semantic colours — these read the same in every chapter. */

/** Completion band: the further along, the cooler the colour. */
export function completionStyle(percent: number) {
  if (percent >= 90) return "text-emerald-700";
  if (percent >= 50) return "text-sky-700";
  if (percent >= 25) return "text-amber-700";
  return "text-rose-700";
}

/** Add your own statuses here; anything unlisted falls back to grey. */
const STATUS_BADGES: Record<string, string> = {
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "land acquired": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "approvals in progress": "border-amber-200 bg-amber-50 text-amber-700",
  "design stage": "border-sky-200 bg-sky-50 text-sky-700",
  "yard slot booked": "border-violet-200 bg-violet-50 text-violet-700",
};

export const STATUS_FALLBACK = "border-neutral-200 bg-neutral-50 text-neutral-600";

export function statusStyle(status: string) {
  return STATUS_BADGES[status.toLowerCase()] ?? STATUS_FALLBACK;
}

/** Money that came in. */
export const moneyIn = "text-emerald-700";
/** Cost added this period. */
export const moneyExtra = "text-amber-700";
/** Cost taken off this period. */
export const moneyRemoved = "text-rose-700";
