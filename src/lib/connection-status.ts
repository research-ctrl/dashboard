import {
  crmColumns,
  opexColumns,
  pipelineColumns,
  projectColumns,
} from "@/data/columns";
import { prisma } from "@/lib/prisma";
import { parseCsv, readProjects } from "@/lib/sheets";

/**
 * Live check of what each chapter's Google Sheet actually returns.
 *
 * A failed read falls back to built-in data, which looks identical to success
 * on the board — so without this the only symptom of a broken connection is
 * "my edits do nothing". This reads each tab for real and reports what came
 * back, so a wrong sheet id, an unshared sheet, a renamed tab, or a project
 * whose CRM column no longer matches its name is stated outright.
 */
export type TabStatus = {
  tab: string;
  ok: boolean;
  rows: number;
  problem?: string;
  /** Read succeeded, but something is drifting and worth tidying. */
  note?: string;
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

/** Owners live in brackets and change; compare on the label alone. */
function normalise(header: string) {
  return header.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

type TabRead =
  | { ok: true; headers: string[]; rows: number }
  | { ok: false; problem: string };

async function readTab(spreadsheetId: string, tab: string): Promise<TabRead> {
  try {
    const response = await fetch(csvUrl(spreadsheetId, tab), { cache: "no-store" });

    if (!response.ok) {
      return { ok: false, problem: `HTTP ${response.status}` };
    }

    const text = await response.text();

    if (text.trimStart().startsWith("<")) {
      return {
        ok: false,
        problem: "not shared — set the sheet to Anyone with the link",
      };
    }

    const rows = parseCsv(text).filter((row) =>
      row.some((cell) => cell.trim() !== ""),
    );

    if (rows.length < 2) {
      return { ok: false, problem: "tab is empty, or the tab name is wrong" };
    }

    return { ok: true, headers: rows[0], rows: rows.length - 1 };
  } catch (cause) {
    return {
      ok: false,
      problem: cause instanceof Error ? cause.message : "request failed",
    };
  }
}

async function checkTab(
  spreadsheetId: string,
  tab: string,
  expectedColumn: string,
): Promise<TabStatus> {
  const read = await readTab(spreadsheetId, tab);

  if (!read.ok) return { tab, ok: false, rows: 0, problem: read.problem };

  const found = read.headers.some((h) => normalise(h) === normalise(expectedColumn));

  return {
    tab,
    ok: found,
    rows: read.rows,
    problem: found
      ? undefined
      : `no "${expectedColumn}" column — first header is "${read.headers[0] ?? "?"}"`,
  };
}

/**
 * CRM columns are matched to projects by name, so a project renamed in Live
 * Projects but not in CRM Collection loses its money silently — the board
 * just shows an empty column. Name the mismatch instead.
 */
async function findProjectsWithoutCrmColumn(connection: {
  spreadsheetId: string;
  projectsTab: string;
  crmTab: string;
}): Promise<string[]> {
  const [projects, crm] = await Promise.all([
    readProjects(connection.spreadsheetId, connection.projectsTab, "check"),
    readTab(connection.spreadsheetId, connection.crmTab),
  ]);

  if (!projects || !crm.ok) return [];

  const columns = new Set(crm.headers.map(normalise));
  return projects
    .map((project) => project.name)
    .filter((name) => name !== "" && !columns.has(normalise(name)));
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

      // Renamed projects still get their money, by falling back to column
      // order — but the drift is worth saying out loud before the order
      // changes too and the pairing becomes wrong.
      const crm = tabs[3];
      if (crm.ok) {
        const missing = await findProjectsWithoutCrmColumn(connection);
        if (missing.length) {
          crm.note =
            `${missing.map((name) => `"${name}"`).join(", ")} ` +
            `${missing.length === 1 ? "has no CRM column of that name" : "have no CRM columns of those names"} — ` +
            "matched by position for now; rename the CRM header to match";
        }
      }

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
