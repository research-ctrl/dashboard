import { chapters as builtInChapters } from "@/data/chapters";
import type { Chapter } from "@/data/types";
import { prisma } from "@/lib/prisma";
import { readCrm, readOpex, readPipeline, readProjects } from "@/lib/sheets";

export type ChapterSource = "sheets" | "built-in";

export type LoadedChapter = Chapter & { source: ChapterSource };

/**
 * Chapter name, accent and time zone stay in code; the rows come from Google
 * Sheets once a chapter has been connected in /admin.
 *
 * A sheet that cannot be read falls back to the built-in rows rather than
 * blanking the board, and reports itself as "built-in" so the page can say so.
 */
export async function loadChapters(): Promise<LoadedChapter[]> {
  let connections: Awaited<
    ReturnType<typeof prisma.chapterConnection.findMany>
  > = [];

  try {
    connections = await prisma.chapterConnection.findMany();
  } catch {
    // No database reachable — the board still renders from built-in data.
  }

  const byId = new Map(connections.map((row) => [row.id, row]));

  return Promise.all(
    builtInChapters.map(async (chapter): Promise<LoadedChapter> => {
      const connection = byId.get(chapter.id);

      if (!connection?.spreadsheetId) {
        return { ...chapter, source: "built-in" };
      }

      const { spreadsheetId } = connection;

      const [projects, pipeline, opex] = await Promise.all([
        readProjects(spreadsheetId, connection.projectsTab, chapter.id),
        readPipeline(spreadsheetId, connection.pipelineTab, chapter.id),
        readOpex(spreadsheetId, connection.opexTab, chapter.id),
      ]);

      // Nothing readable at all: the sheet is probably not link-shared.
      if (!projects && !pipeline && !opex) {
        return { ...chapter, source: "built-in" };
      }

      const resolvedProjects = projects ?? chapter.projects;

      const crm = await readCrm(
        spreadsheetId,
        connection.crmTab,
        connection.crmYear,
        resolvedProjects,
      );

      return {
        ...chapter,
        projects: resolvedProjects,
        pipeline: pipeline ?? chapter.pipeline,
        opex: opex ?? chapter.opex,
        crm: crm ?? chapter.crm,
        source: "sheets",
      };
    }),
  );
}
