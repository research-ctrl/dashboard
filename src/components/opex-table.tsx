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
import { header, opexColumns as col } from "@/data/columns";
import type { OpexLine } from "@/data/types";
import type { Accent } from "@/lib/accents";
import { formatCurrency } from "@/lib/format";
import { moneyExtra } from "@/lib/status";

const dash = <span className="text-neutral-300">—</span>;

export function OpexTable({
  rows,
  accent,
}: {
  rows: OpexLine[];
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
              {header(col.amount)}
            </TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.extra)}
            </TableHead>
            <TableHead className={headCell}>{header(col.remark)}</TableHead>
            <TableHead className={`${headCell} text-right`}>
              {header(col.allocated)}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((line) => (
            <TableRow key={line.id}>
              <TableCell className={`${stickyCell} ${textCell} font-medium text-neutral-900`}>
                {line.name}
              </TableCell>

              <TableCell className={`${numCell} text-neutral-900`}>
                {formatCurrency(line.amount)}
              </TableCell>

              <TableCell className={`${numCell} ${moneyExtra}`}>
                {line.extra === 0 ? dash : formatCurrency(line.extra)}
              </TableCell>

              <TableCell className={`${textCell} whitespace-normal text-neutral-500`}>
                {line.remark || dash}
              </TableCell>

              {/* Calculated, never entered: Amount opex + Extra. */}
              <TableCell className={`${numCell} font-medium ${accent.strong}`}>
                {formatCurrency(line.amount + line.extra)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
