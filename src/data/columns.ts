/**
 * Column headers for every table.
 *
 * Each column renders as "Label (owner)" — e.g. "Inventory (Lincoln)".
 * Set `owner` to "" to show no bracket at all.
 * These labels are also the header row of the Excel sheets in /excel.
 */
export type Column = { label: string; owner: string };

export const projectColumns = {
  name: { label: "Live projects", owner: "" },
  completion: { label: "Percentage of completion", owner: "Lindsay" },
  soldAssets: { label: "Total sold assets", owner: "CRM" },
  inventory: { label: "Inventory", owner: "Lincoln" },
  expectedOutcome: { label: "Expected outcome", owner: "Lindsay" },
  expectedHandover: { label: "Expected handover", owner: "Lindsay" },
  repaidToFirstProject: {
    label: "Amount repaid to first project",
    owner: "Lindsay",
  },
  yearStarted: { label: "Year started", owner: "CRM" },
  comments: { label: "Comments", owner: "Lincoln" },
} satisfies Record<string, Column>;

export const pipelineColumns = {
  name: { label: "Pipeline project", owner: "" },
  onward: { label: "Onward", owner: "Lincoln" },
  inventory: { label: "Inventory", owner: "Lincoln/Lindsay" },
  ticketSize: { label: "Ticket size", owner: "Lincoln" },
  constructionCost: {
    label: "Total cost of construction",
    owner: "Lincoln/Lindsay",
  },
  planned: { label: "Planned", owner: "Lincoln" },
  status: { label: "Status", owner: "Lincoln" },
} satisfies Record<string, Column>;

export const opexColumns = {
  name: { label: "Opex", owner: "" },
  amount: { label: "Amount opex", owner: "Lincoln" },
  extra: { label: "Extra", owner: "Lincoln" },
  remark: { label: "Remark", owner: "Lincoln" },
  /** Calculated: Amount opex + Extra. Never entered by hand. */
  allocated: { label: "Allocated amount + extra", owner: "" },
} satisfies Record<string, Column>;

/**
 * No owners in brackets, because the sheet's headers carry none. Edits here
 * are logged against the tab with a blank name — add "(Lincoln)" to a header
 * in the sheet and the update strip starts naming them, no code change.
 */
export const liabilityColumns = {
  lender: { label: "Lender", owner: "" },
  loanAmount: { label: "Loan amount", owner: "" },
  outstanding: { label: "Outstanding", owner: "" },
} satisfies Record<string, Column>;

export const crmColumns = {
  month: { label: "Month", owner: "Lendl" },
} satisfies Record<string, Column>;

/** "Label (owner)", or just "Label" when no owner is set. */
export function header(column: Column) {
  return column.owner ? `${column.label} (${column.owner})` : column.label;
}
