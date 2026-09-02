import { ChapterClock } from "@/components/chapter-clock";
import { CrmCollectionTable } from "@/components/crm-collection-table";
import { OpexTable } from "@/components/opex-table";
import { PipelineTable } from "@/components/pipeline-table";
import { ProjectsTable } from "@/components/projects-table";
import type { Chapter } from "@/data/types";
import { ACCENTS } from "@/lib/accents";

const tableTitle =
  "mb-2 text-[11px] font-medium tracking-[0.15em] text-neutral-500 uppercase";

export function ChapterColumn({ chapter }: { chapter: Chapter }) {
  const accent = ACCENTS[chapter.accent];

  return (
    <section className="flex min-w-0 flex-col gap-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h2 className={`text-lg font-medium tracking-[0.2em] uppercase ${accent.title}`}>
            {chapter.name}
          </h2>
          <ChapterClock
            timeZone={chapter.timeZone}
            label={chapter.timeZoneLabel}
            accentClass={accent.title}
          />
        </div>
        <div className={`mt-3 h-1 w-full rounded-full ${accent.rule}`} />
      </div>

      <ProjectsTable rows={chapter.projects} accent={accent} />
      <PipelineTable rows={chapter.pipeline} accent={accent} />
      <OpexTable rows={chapter.opex} accent={accent} />

      {chapter.crm && (
        <div>
          <h3 className={tableTitle}>CRM Collection · {chapter.crm.year}</h3>
          <CrmCollectionTable
            projects={chapter.projects}
            collection={chapter.crm}
            accent={accent}
          />
        </div>
      )}
    </section>
  );
}
