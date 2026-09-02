import { Badge } from "@/components/ui/badge";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { header, projectColumns as col } from "@/data/columns";
import type { Project } from "@/data/types";
import type { Accent } from "@/lib/accents";
import { formatCurrency, formatNumber } from "@/lib/format";
import { completionStyle, moneyIn, statusStyle } from "@/lib/status";

const dash = <span className="text-neutral-300">—</span>;

export function ProjectsTable({
  rows,
  accent,
}: {
  rows: Project[];
  accent: Accent;
}) {
  return (
    <div className={`${tableCard} ${accent.card}`}>
      <Table className={tableBase}>
        <TableHeader>
          <TableRow className={accent.headRow}>
            <TableHead className={`${headCell} ${stickyBase} ${accent.headSticky}`}>
              {header(col.name)}
            </TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.completion)}
            </TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.soldAssets)}
            </TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.inventory)}
            </TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.expectedOutcome)}
            </TableHead>
            <TableHead className={headCell}>
              {header(col.expectedHandover)}
            </TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.repaidToFirstProject)}
            </TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.yearStarted)}
            </TableHead>
            <TableHead className={headCell}>{header(col.comments)}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((project) => (
            <TableRow key={project.id}>
              <TableCell className={`${stickyCell} ${textCell} font-medium text-neutral-900`}>
                {project.name}
              </TableCell>

              <TableCell className={`${numCell} font-medium ${completionStyle(project.completion)}`}>
                {project.completion}%
              </TableCell>

              <TableCell className={`${numCell} text-neutral-700`}>
                {formatNumber(project.soldAssets)}
              </TableCell>

              <TableCell className={`${numCell} text-neutral-700`}>
                {project.inventory === 0 ? dash : formatNumber(project.inventory)}
              </TableCell>

              <TableCell className={`${numCell} font-medium text-neutral-900`}>
                {formatCurrency(project.expectedOutcome)}
              </TableCell>

              <TableCell className={`${textCell} whitespace-nowrap`}>
                {project.expectedHandover === "Delivered" ? (
                  <Badge variant="outline" className={statusStyle("delivered")}>
                    Delivered
                  </Badge>
                ) : (
                  <span className="text-neutral-700">
                    {project.expectedHandover}
                  </span>
                )}
              </TableCell>

              <TableCell className={`${numCell} ${project.repaidToFirstProject === 0 ? "" : moneyIn}`}>
                {project.repaidToFirstProject === 0
                  ? dash
                  : formatCurrency(project.repaidToFirstProject)}
              </TableCell>

              <TableCell className={`${numCell} text-neutral-500`}>
                {project.yearStarted}
              </TableCell>

              <TableCell className={`${textCell} whitespace-normal text-neutral-500`}>
                {project.comments}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
