import { chapters as chapterMeta } from "@/data/chapters";
import type { ChapterMeta } from "@/data/types";
import { prisma } from "@/lib/prisma";
import { readTable, type ReadResult } from "@/lib/sheets";

export type LoadedTable = {
  /** The tab name in the workbook, shown as the table's heading. */
  tab: string;
  result: ReadResult;
};

export type LoadedChapter = ChapterMeta & {
  spreadsheetId: string;
  tables: LoadedTable[];
};

/**
 * Chapter name, accent and time zone stay in code; every table comes straight
 * from that chapter's Google Sheet.
 *
 * There is deliberately no built-in fallback any more. A silent fallback looks
 * exactly like a successful read, which cost hours of "my edits do nothing" —
 * a tab that cannot be read now says so, in place.
 */
export async function loadChapters(): Promise<LoadedChapter[]> {
  let connections: Awaited<
    ReturnType<typeof prisma.chapterConnection.findMany>
  > = [];

  try {
    connections = await prisma.chapterConnection.findMany();
  } catch {
    // No database reachable — every chapter reports it rather than inventing data.
  }

  const byId = new Map(connections.map((row) => [row.id, row]));

  return Promise.all(
    chapterMeta.map(async (chapter): Promise<LoadedChapter> => {
      const connection = byId.get(chapter.id);
      const spreadsheetId = connection?.spreadsheetId ?? "";

      const tabs = [
        connection?.projectsTab ?? "Live Projects",
        connection?.pipelineTab ?? "Pipeline",
        connection?.opexTab ?? "Opex",
        connection?.crmTab ?? "CRM Collection",
      ];

      const tables = await Promise.all(
        tabs.map(async (tab) => ({
          tab,
          result: await readTable(spreadsheetId, tab),
        })),
      );

      return { ...chapter, spreadsheetId, tables };
    }),
  );
}
