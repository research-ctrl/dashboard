import type { AccentName } from "@/lib/accents";
import type { Month } from "@/data/months";

export type Project = {
  id: string;
  /** Live projects */
  name: string;
  /** Percentage of completion, 0-100 */
  completion: number;
  /** Total sold assets — number of units sold */
  soldAssets: number;
  /** Inventory — unsold units remaining */
  inventory: number;
  /** Expected outcome — projected value on completion */
  expectedOutcome: number;
  /** Expected handover — free text, e.g. "Mar 2027" or "Q4 2026" */
  expectedHandover: string;
  /** Amount repaid to first project */
  repaidToFirstProject: number;
  /** Year started */
  yearStarted: number;
  comments: string;
};

export type PipelineProject = {
  id: string;
  /** Pipeline project */
  name: string;
  /** Onward — free text, e.g. "Apr 2026" */
  onward: string;
  /** Inventory — units currently available */
  inventory: number;
  /** Ticket size — price per unit */
  ticketSize: number;
  /** Total cost of construction */
  constructionCost: number;
  /** Planned — units planned */
  planned: number;
  /** Status — free text, shown as a pill */
  status: string;
};

export type OpexLine = {
  id: string;
  /** Opex — the line item */
  name: string;
  /** Amount opex */
  amount: number;
  /** Extra — added this period */
  extra: number;
  /** Remark — free text. Replaced the old "Remove" money column. */
  remark: string;
};

/** One column of the dashboard. */
export type Chapter = {
  id: string;
  name: string;
  projects: Project[];
  pipeline: PipelineProject[];
  opex: OpexLine[];
  accent: AccentName;
  timeZone: string;
  timeZoneLabel: string;
  /** Optional — a chapter without CRM Collection simply omits it. */
  crm?: CrmCollection;
};

/**
 * CRM Collection — money collected per project, per month.
 *
 * Columns come from the chapter's own `projects`, so renaming a project
 * renames its column here too. `amounts` is keyed by project id then month;
 * leave a month out and the cell shows a dash.
 */
export type CrmCollection = {
  year: number;
  amounts: Record<string, Partial<Record<Month, number>>>;
};
