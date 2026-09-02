import {
  crmColumns,
  opexColumns,
  pipelineColumns,
  projectColumns,
} from "@/data/columns";
import { MONTHS, type Month } from "@/data/months";
import type {
  CrmCollection,
  OpexLine,
  PipelineProject,
  Project,
} from "@/data/types";

/**
 * Reads a Google Sheet that is shared "anyone with the link".
 *
 * The gviz endpoint returns CSV without any API key, which keeps deployment to
 * a single environment variable-free path.
 *
 * Nothing here is cached, so the board can never show a row the sheet no
 * longer has. Reads are driven by page loads, and page loads are driven by
 * the Realtime push in /api/sheets/changed — so an idle board costs nothing.
 */
const SHEET_TAG = "sheets";

function csvUrl(spreadsheetId: string, tab: string) {
  const base = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`;
  return `${base}?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
}

/** Minimal RFC 4180 parser — handles quotes, embedded commas and newlines. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') inQuotes = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Headers carry an owner in brackets — "Inventory (Lincoln)" — and owners
 * change. Match on the label alone so renaming an owner never breaks a read.
 */
function normalise(header: string) {
  return header.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function indexOfColumn(headers: string[], label: string) {
  const target = normalise(label);
  return headers.findIndex((header) => normalise(header) === target);
}

function cell(row: string[], index: number) {
  return index >= 0 ? (row[index] ?? "").trim() : "";
}

/** Strips currency symbols, thousands separators and a trailing % sign. */
export function toNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fetchTab(
  spreadsheetId: string,
  tab: string,
): Promise<string[][] | null> {
  try {
    const response = await fetch(csvUrl(spreadsheetId, tab), {
      // Never cached. Next 16 does not cache fetch by default, and opting in
      // only bought a window where the board could show rows the sheet no
      // longer had. Requests happen when somebody loads the board, not on a
      // timer, so this costs nothing while nothing is being looked at.
      cache: "no-store",
      next: { tags: [SHEET_TAG] },
    });

    if (!response.ok) return null;

    const text = await response.text();
    // A sheet that is not link-shared answers with a sign-in HTML page.
    if (text.trimStart().startsWith("<")) return null;

    const rows = parseCsv(text);
    return rows.length > 1 ? rows : null;
  } catch {
    return null;
  }
}

function rowId(prefix: string, row: string[], headers: string[], index: number) {
  const explicit = cell(row, indexOfColumn(headers, "id"));
  return explicit || `${prefix}-${index + 1}`;
}

export async function readProjects(
  spreadsheetId: string,
  tab: string,
  prefix: string,
): Promise<Project[] | null> {
  const rows = await fetchTab(spreadsheetId, tab);
  if (!rows) return null;

  const [headers, ...body] = rows;
  const at = (label: string) => indexOfColumn(headers, label);

  const nameAt = at(projectColumns.name.label);
  if (nameAt < 0) return null;

  return body
    .filter((row) => cell(row, nameAt) !== "")
    .map((row, index) => ({
      id: rowId(`${prefix}-p`, row, headers, index),
      name: cell(row, nameAt),
      completion: toNumber(cell(row, at(projectColumns.completion.label))),
      soldAssets: toNumber(cell(row, at(projectColumns.soldAssets.label))),
      inventory: toNumber(cell(row, at(projectColumns.inventory.label))),
      expectedOutcome: toNumber(
        cell(row, at(projectColumns.expectedOutcome.label)),
      ),
      expectedHandover: cell(row, at(projectColumns.expectedHandover.label)),
      repaidToFirstProject: toNumber(
        cell(row, at(projectColumns.repaidToFirstProject.label)),
      ),
      yearStarted: toNumber(cell(row, at(projectColumns.yearStarted.label))),
      comments: cell(row, at(projectColumns.comments.label)),
    }));
}

export async function readPipeline(
  spreadsheetId: string,
  tab: string,
  prefix: string,
): Promise<PipelineProject[] | null> {
  const rows = await fetchTab(spreadsheetId, tab);
  if (!rows) return null;

  const [headers, ...body] = rows;
  const at = (label: string) => indexOfColumn(headers, label);

  const nameAt = at(pipelineColumns.name.label);
  if (nameAt < 0) return null;

  return body
    .filter((row) => cell(row, nameAt) !== "")
    .map((row, index) => ({
      id: rowId(`${prefix}-pl`, row, headers, index),
      name: cell(row, nameAt),
      onward: cell(row, at(pipelineColumns.onward.label)),
      inventory: toNumber(cell(row, at(pipelineColumns.inventory.label))),
      ticketSize: toNumber(cell(row, at(pipelineColumns.ticketSize.label))),
      constructionCost: toNumber(
        cell(row, at(pipelineColumns.constructionCost.label)),
      ),
      planned: toNumber(cell(row, at(pipelineColumns.planned.label))),
      status: cell(row, at(pipelineColumns.status.label)),
    }));
}

export async function readOpex(
  spreadsheetId: string,
  tab: string,
  prefix: string,
): Promise<OpexLine[] | null> {
  const rows = await fetchTab(spreadsheetId, tab);
  if (!rows) return null;

  const [headers, ...body] = rows;
  const at = (label: string) => indexOfColumn(headers, label);

  const nameAt = at(opexColumns.name.label);
  if (nameAt < 0) return null;

  return body
    .filter((row) => cell(row, nameAt) !== "")
    .map((row, index) => ({
      id: rowId(`${prefix}-o`, row, headers, index),
      name: cell(row, nameAt),
      amount: toNumber(cell(row, at(opexColumns.amount.label))),
      extra: toNumber(cell(row, at(opexColumns.extra.label))),
      remark: cell(row, at(opexColumns.remark.label)),
    }));
}

/**
 * The CRM tab is a matrix: a Month column, then one column per project, keyed
 * by the project's name. Names are matched back to project ids so a renamed
 * project keeps its column.
 */
export async function readCrm(
  spreadsheetId: string,
  tab: string,
  year: number,
  projects: Project[],
): Promise<CrmCollection | null> {
  const rows = await fetchTab(spreadsheetId, tab);
  if (!rows) return null;

  const [headers, ...body] = rows;
  const monthAt = indexOfColumn(headers, crmColumns.month.label);
  if (monthAt < 0) return null;

  const byName = new Map(
    projects.map((project) => [normalise(project.name), project.id]),
  );

  const amounts: CrmCollection["amounts"] = {};

  for (const row of body) {
    const monthLabel = cell(row, monthAt);
    const month = MONTHS.find(
      (candidate) => candidate.toLowerCase() === monthLabel.slice(0, 3).toLowerCase(),
    );
    if (!month) continue; // skips the Total row and any blanks

    headers.forEach((headerText, column) => {
      if (column === monthAt) return;

      const projectId = byName.get(normalise(headerText));
      if (!projectId) return;

      const raw = cell(row, column);
      if (raw === "") return;

      const value = toNumber(raw);
      if (value === 0) return;

      amounts[projectId] = {
        ...(amounts[projectId] ?? {}),
        [month as Month]: value,
      };
    });
  }

  return { year, amounts };
}
