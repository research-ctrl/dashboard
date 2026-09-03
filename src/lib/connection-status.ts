import { tabNames } from "@/data/tabs";
import { prisma } from "@/lib/prisma";
import { readTable } from "@/lib/sheets";

/**
 * Live check of what each chapter's Google Sheet actually returns.
 *
 * Reads every tab for real on each load, so a wrong sheet id, an unshared
 * sheet or a renamed tab is stated outright instead of showing up later as
 * "my edits do nothing".
 */
export type TabStatus = {
  tab: string;
  ok: boolean;
  rows: number;
  columns: number;
  problem?: string;
};

export type ChapterStatus = {
  id: string;
  name: string;
  spreadsheetId: string;
  live: boolean;
  tabs: TabStatus[];
};

export async function readConnectionStatus(): Promise<ChapterStatus[]> {
  const connections = await prisma.chapterConnection.findMany({
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(
    connections.map(async (connection): Promise<ChapterStatus> => {
      const tabs = tabNames(connection);

      const results = await Promise.all(
        tabs.map(async (tab): Promise<TabStatus> => {
          const read = await readTable(connection.spreadsheetId, tab);

          if (!read.ok) {
            return { tab, ok: false, rows: 0, columns: 0, problem: read.problem };
          }

          return {
            tab,
            ok: true,
            rows: read.table.rows.length,
            columns: read.table.headers.length,
          };
        }),
      );

      return {
        id: connection.id,
        name: connection.name,
        spreadsheetId: connection.spreadsheetId,
        live: results.every((tab) => tab.ok),
        tabs: results,
      };
    }),
  );
}
