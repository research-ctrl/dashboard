/**
 * The tabs each chapter's workbook holds, in the order the board stacks them.
 *
 * This list was previously repeated in four places — the board loader, the
 * admin live check, the admin form and the webhook's tab filter. Adding a tab
 * meant remembering all four, and forgetting the webhook's would have meant the
 * new tab rendered but never appeared in the update strip.
 */
export type TabSlot = {
  /** The chapter_connections column holding this tab's name. */
  field:
    | "projectsTab"
    | "pipelineTab"
    | "opexTab"
    | "liabilitiesTab"
    | "crmTab";
  /** Heading shown above the table on the board. */
  title: string;
  /** Tab name used when a chapter has no saved connection yet. */
  fallback: string;
};

export const tabSlots: TabSlot[] = [
  { field: "projectsTab", title: "Live Projects", fallback: "Live Projects" },
  { field: "pipelineTab", title: "Pipeline", fallback: "Pipeline" },
  { field: "opexTab", title: "Opex", fallback: "Opex" },
  // The only slot whose heading differs from its tab: the sheet is named
  // Liabilities, the board calls the table Total Debts.
  { field: "liabilitiesTab", title: "Total Debts", fallback: "Liabilities" },
  { field: "crmTab", title: "CRM Collection", fallback: "CRM Collection" },
];

/** The tab names a chapter is actually configured to read. */
export function tabNames(connection: Record<TabSlot["field"], string>) {
  return tabSlots.map((slot) => connection[slot.field]);
}
