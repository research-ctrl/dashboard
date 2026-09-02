import { crmColumns, opexColumns, pipelineColumns, projectColumns } from "@/data/columns";
import { MONTHS } from "@/data/months";
import { prisma } from "@/lib/prisma";

/**
 * Live check of what each chapter's Google Sheet actually returns.
 *
 * A failed read falls back to built-in data, which looks identical to success
 * on the board — so without this the only symptom of a broken connection is
 * "my edits do nothing". This reads each tab for real and reports what came
 * back, so a wrong sheet id, an unshared sheet or a renamed tab is obvious.
 */
export type TabStatus = {
  tab: string;
  ok: boolean;
  rows: number;
  problem?: string;
};

export type ChapterStatus = {
  id: string;
  name: string;
  spreadsheetId: string;
  live: boolean;
  tabs: TabStatus[];
};

function csvUrl(spreadsheetId: string, tab: string) {
  const base = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`;
  return `${base}?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
}

function normalise(header: string) {
  return header.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

async function checkTab(
  spreadsheetId: string,
  tab: string,
  expectedFirstColumn: string,
): Promise<TabStatus> {
  try {
    const response = await fetch(csvUrl(spreadsheetId, tab), { cache: "no-store" });

    if (!response.ok) {
      return { tab, ok: false, rows: 0, problem: `HTTP ${response.status}` };
    }

    const text = await response.text();

    if (text.trimStart().startsWith("<")) {
      return {
        tab,
        ok: false,
        rows: 0,
        problem: "Not shared — set the sheet to Anyone with the link",
      };
    }

    const lines = text.split("\n").filter((line) => line.trim() !== "");
    if (lines.length < 2) {
      return { tab, ok: false, rows: 0, problem: "Tab is empty or the name is wrong" };
    }

    const headers = (lines[0].match(/("([^"]|"")*"|[^,]*)/g) ?? [])
      .filter((_, i) => i % 2 === 0)
      .map((h) => h.replace(/^"|"$/g, ""));

    const found = headers.some((h) => normalise(h) === normalise(expectedFirstColumn));

    return {
      tab,
      ok: found,
      rows: lines.length - 1,
      problem: found
        ? undefined
        : `No "${expectedFirstColumn}" column — first header is "${headers[0] ?? "?"}"`,
    };
  } catch (cause) {
    return {
      tab,
      ok: false,
      rows: 0,
      problem: cause instanceof Error ? cause.message : "Request failed",
    };
  }
}

export async function readConnectionStatus(): Promise<ChapterStatus[]> {
  const connections = await prisma.chapterConnection.findMany({
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(
    connections.map(async (connection): Promise<ChapterStatus> => {
      if (!connection.spreadsheetId) {
        return {
          id: connection.id,
          name: connection.name,
          spreadsheetId: "",
          live: false,
          tabs: [],
        };
      }

      const tabs = await Promise.all([
        checkTab(connection.spreadsheetId, connection.projectsTab, projectColumns.name.label),
        checkTab(connection.spreadsheetId, connection.pipelineTab, pipelineColumns.name.label),
        checkTab(connection.spreadsheetId, connection.opexTab, opexColumns.name.label),
        checkTab(connection.spreadsheetId, connection.crmTab, crmColumns.month.label),
      ]);

      return {
        id: connection.id,
        name: connection.name,
        spreadsheetId: connection.spreadsheetId,
        live: tabs.every((tab) => tab.ok),
        tabs,
      };
    }),
  );
}

/** Months are fixed; exported so the CRM row count can be sanity-checked. */
export const EXPECTED_CRM_ROWS = MONTHS.length;
