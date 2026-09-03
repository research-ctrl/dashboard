import type { AccentName } from "@/lib/accents";

/**
 * Everything about a chapter that is NOT in its Google Sheet.
 * The tables themselves come straight from the sheet — see lib/sheets.ts.
 */
export type ChapterMeta = {
  id: string;
  name: string;
  accent: AccentName;
  timeZone: string;
  timeZoneLabel: string;
  /** Short zone abbreviation shown beside a timestamp, e.g. IST. */
  timeAbbreviation: string;
};
