import {
  headCell,
  numCell,
  stickyBase,
  stickyCell,
  tableBase,
  tableCard,
  textCell,
} from "@/components/table-styles";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { crmColumns as col, header } from "@/data/columns";
import { MONTHS } from "@/data/months";
import type { CrmCollection, Project } from "@/data/types";
import type { Accent } from "@/lib/accents";
import { formatCurrency } from "@/lib/format";

const dash = <span className="text-neutral-300">—</span>;

export function CrmCollectionTable({
  projects,
  collection,
  accent,
}: {
  /** One column per project — the chapter's own list, so names stay in sync. */
  projects: Project[];
  collection: CrmCollection;
  accent: Accent;
}) {
  const totals = projects.map((project) =>
    MONTHS.reduce(
      (sum, month) => sum + (collection.amounts[project.id]?.[month] ?? 0),
      0,
    ),
  );

  return (
    <div className={`${tableCard} ${accent.card}`}>
      <Table className={tableBase}>
        <TableHeader>
          <TableRow className={accent.headRow}>
            <TableHead className={`${headCell} ${stickyBase} ${accent.headSticky}`}>
              {header(col.month)}
            </TableHead>
            {projects.map((project) => (
              <TableHead key={project.id} className={`${headCell} text-right`}>
                {project.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {MONTHS.map((month) => (
            <TableRow key={month}>
              <TableCell className={`${stickyCell} ${textCell} font-medium text-neutral-900`}>
                {month}
              </TableCell>
              {projects.map((project) => {
                const amount = collection.amounts[project.id]?.[month];
                return (
                  <TableCell
                    key={project.id}
                    className={`${numCell} text-neutral-700`}
                  >
                    {amount ? formatCurrency(amount) : dash}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>

        <TableFooter className={`border-t ${accent.footRow}`}>
          <TableRow className={accent.footRow}>
            <TableCell className={`${stickyBase} ${accent.footSticky} ${textCell} font-medium ${accent.strong}`}>
              Total
            </TableCell>
            {projects.map((project, i) => (
              <TableCell
                key={project.id}
                className={`${numCell} font-medium ${accent.strong}`}
              >
                {formatCurrency(totals[i])}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
