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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SheetTable } from "@/lib/sheets";
import type { Accent } from "@/lib/accents";
import { completionStyle, statusStyle } from "@/lib/status";

/**
 * Renders a sheet tab exactly as it comes: the sheet's own headers, its own
 * rows, its own values. Nothing is computed, dropped or reordered here, so a
 * column added in Sheets simply appears.
 *
 * Styling is the only thing applied on top, and only where a cell's shape
 * makes it unambiguous — money and counts align right, a percentage takes its
 * band colour, a known status becomes a pill.
 */
const dash = <span className="text-neutral-300">—</span>;

/** Money, counts, percentages — anything that should align right. */
function isNumeric(value: string) {
  return /^[-+]?[₹$€£]?\s*[\d,.]+\s*%?$/.test(value.trim());
}

function isPercent(value: string) {
  return /^\d{1,3}\s*%$/.test(value.trim());
}

function Cell({ value }: { value: string }) {
  const text = value.trim();

  if (text === "") return dash;

  if (isPercent(text)) {
    const percent = Number(text.replace("%", ""));
    return (
      <span className={`font-medium ${completionStyle(percent)}`}>{text}</span>
    );
  }

  const status = statusStyle(text);
  if (status.startsWith("border-") && !status.includes("neutral")) {
    return (
      <Badge variant="outline" className={status}>
        {text}
      </Badge>
    );
  }

  return <>{text}</>;
}

export function SheetTable({
  table,
  accent,
}: {
  table: SheetTable;
  accent: Accent;
}) {
  const alignRight = table.headers.map((_, column) => {
    const values = table.rows
      .map((row) => (row[column] ?? "").trim())
      .filter((value) => value !== "");
    return values.length > 0 && values.every(isNumeric);
  });

  return (
    <div className={`${tableCard} ${accent.card}`}>
      <Table className={tableBase}>
        <TableHeader>
          <TableRow className={accent.headRow}>
            {table.headers.map((header, column) => (
              <TableHead
                key={`${header}-${column}`}
                className={[
                  headCell,
                  column === 0 ? `${stickyBase} ${accent.headSticky}` : "",
                  alignRight[column] ? "text-right" : "",
                ].join(" ")}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {table.rows.map((row, index) => (
            <TableRow key={index}>
              {table.headers.map((_, column) => {
                const value = row[column] ?? "";

                if (column === 0) {
                  return (
                    <TableCell
                      key={column}
                      className={`${stickyCell} ${textCell} font-medium text-neutral-900`}
                    >
                      {value.trim() === "" ? dash : value}
                    </TableCell>
                  );
                }

                return (
                  <TableCell
                    key={column}
                    className={
                      alignRight[column]
                        ? `${numCell} text-neutral-800`
                        : `${textCell} whitespace-normal text-neutral-600`
                    }
                  >
                    <Cell value={value} />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>

        {table.totalRow && (
          <TableFooter className={`border-t ${accent.footRow}`}>
            <TableRow className={accent.footRow}>
              {table.headers.map((_, column) => {
                const value = (table.totalRow?.[column] ?? "").trim();

                if (column === 0) {
                  return (
                    <TableCell
                      key={column}
                      className={`${stickyBase} ${accent.footSticky} ${textCell} font-medium ${accent.strong}`}
                    >
                      {value === "" ? "Total" : value}
                    </TableCell>
                  );
                }

                return (
                  <TableCell
                    key={column}
                    className={`${alignRight[column] ? numCell : textCell} font-medium ${accent.strong}`}
                  >
                    {value === "" ? dash : value}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
