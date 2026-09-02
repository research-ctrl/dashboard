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
import { header, pipelineColumns as col } from "@/data/columns";
import type { PipelineProject } from "@/data/types";
import type { Accent } from "@/lib/accents";
import { formatCurrency, formatNumber } from "@/lib/format";
import { statusStyle } from "@/lib/status";

export function PipelineTable({
  rows,
  accent,
}: {
  rows: PipelineProject[];
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
            <TableHead className={headCell}>{header(col.onward)}</TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.inventory)}
            </TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.ticketSize)}
            </TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.constructionCost)}
            </TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.planned)}
            </TableHead>
            <TableHead className={headCell}>{header(col.status)}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((project) => (
            <TableRow key={project.id}>
              <TableCell className={`${stickyCell} ${textCell} font-medium text-neutral-900`}>
                {project.name}
              </TableCell>

              <TableCell className={`${textCell} whitespace-nowrap text-neutral-700`}>
                {project.onward}
              </TableCell>

              <TableCell className={`${numCell} text-neutral-700`}>
                {formatNumber(project.inventory)}
              </TableCell>

              <TableCell className={`${numCell} text-neutral-900`}>
                {formatCurrency(project.ticketSize)}
              </TableCell>

              <TableCell className={`${numCell} font-medium text-neutral-900`}>
                {formatCurrency(project.constructionCost)}
              </TableCell>

              <TableCell className={`${numCell} text-neutral-700`}>
                {formatNumber(project.planned)}
              </TableCell>

              <TableCell className={`${textCell} whitespace-nowrap`}>
                <Badge variant="outline" className={statusStyle(project.status)}>
                  {project.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
