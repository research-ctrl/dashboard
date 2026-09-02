/**
 * Reads a Google Sheet tab and returns it as-is.
 *
 * No mapping onto typed models, and deliberately no cross-referencing between
 * tabs: what the sheet holds is what the dashboard shows. Add a column in
 * Sheets and it appears; rename one and the header changes with it. Nothing
 * here needs to know what the columns mean.
 *
 * The gviz endpoint returns CSV without any API key. Nothing is cached, so the
 * board can never show a row the sheet no longer has — reads follow page
 * loads, and page loads follow the Realtime push, so an idle board is free.
 */
export const SHEET_TAG = "sheets";

/** Internal join key we add to the workbooks; never worth showing. */
const HIDDEN_COLUMNS = ["id (do not edit)", "id"];

export type SheetTable = {
  headers: string[];
  rows: string[][];
  /** A trailing summary row, shown as a footer rather than a normal row. */
  totalRow: string[] | null;
};

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

function normalise(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * A trailing row with an empty first cell, or one labelled "Total", is the
 * sheet's own summary line — the workbooks generate it as =SUM(). It is shown
 * as a footer, with the sheet's numbers, not recomputed.
 */
function isTotalRow(row: string[]) {
  const first = normalise(row[0] ?? "");
  const hasValues = row.slice(1).some((cell) => cell.trim() !== "");
  return hasValues && (first === "" || first === "total");
}

export type ReadResult =
  | { ok: true; table: SheetTable }
  | { ok: false; problem: string };

export async function readTable(
  spreadsheetId: string,
  tab: string,
): Promise<ReadResult> {
  if (!spreadsheetId) return { ok: false, problem: "no sheet linked" };

  try {
    const response = await fetch(csvUrl(spreadsheetId, tab), {
      cache: "no-store",
      next: { tags: [SHEET_TAG] },
    });

    if (!response.ok) return { ok: false, problem: `HTTP ${response.status}` };

    const text = await response.text();

    // A sheet that is not link-shared answers with a sign-in HTML page.
    if (text.trimStart().startsWith("<")) {
      return {
        ok: false,
        problem: "not shared — set the sheet to Anyone with the link",
      };
    }

    const all = parseCsv(text).filter((row) =>
      row.some((cell) => cell.trim() !== ""),
    );

    if (all.length < 1) {
      return { ok: false, problem: `"${tab}" is empty, or the tab name is wrong` };
    }

    const [rawHeaders, ...rawRows] = all;

    // Drop the internal id column, and any column with no header at all.
    const keep = rawHeaders
      .map((header, index) => ({ header, index }))
      .filter(
        ({ header }) =>
          header.trim() !== "" && !HIDDEN_COLUMNS.includes(normalise(header)),
      );

    const headers = keep.map(({ header }) => header.trim());
    const pick = (row: string[]) =>
      keep.map(({ index }) => (row[index] ?? "").trim());

    const body = rawRows.map(pick);

    const last = body[body.length - 1];
    const totalRow = last && isTotalRow(last) ? last : null;
    const rows = totalRow ? body.slice(0, -1) : body;

    return { ok: true, table: { headers, rows, totalRow } };
  } catch (cause) {
    return {
      ok: false,
      problem: cause instanceof Error ? cause.message : "request failed",
    };
  }
}
