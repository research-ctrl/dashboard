"""
Recalculate the generated workbooks with Excel itself and report any formula
errors. openpyxl writes formulas with no cached values, so until this runs the
formula cells read back as empty to anything that reads cached values.

Run:  python scripts/recalc_excel.py
"""

import sys
from pathlib import Path

import win32com.client as win32

ERROR_TEXTS = ("#REF!", "#VALUE!", "#NAME?", "#DIV/0!", "#N/A", "#NULL!", "#NUM!")

OUT = Path(__file__).resolve().parent.parent / "excel"


def recalc(path: Path):
    excel = win32.gencache.EnsureDispatch("Excel.Application")
    excel.Visible = False
    excel.DisplayAlerts = False

    formulas = 0
    errors = []
    try:
        wb = excel.Workbooks.Open(str(path))
        excel.CalculateFullRebuild()

        for ws in wb.Worksheets:
            used = ws.UsedRange
            for row in used.Rows:
                for cell in row.Cells:
                    formula = cell.Formula
                    if isinstance(formula, str) and formula.startswith("="):
                        formulas += 1
                        value = cell.Text
                        if any(err in str(value) for err in ERROR_TEXTS):
                            errors.append(
                                "{0}!{1} {2} -> {3}".format(
                                    ws.Name, cell.Address(False, False), formula, value
                                )
                            )
        wb.Save()
        wb.Close(SaveChanges=True)
    finally:
        excel.Quit()

    return formulas, errors


def main():
    paths = sorted(OUT.glob("*.xlsx"))
    if not paths:
        print("no workbooks in", OUT)
        return 1

    failed = False
    for path in paths:
        formulas, errors = recalc(path)
        status = "errors_found" if errors else "success"
        print("{0}: {1} — {2} formulas, {3} errors".format(
            path.name, status, formulas, len(errors)))
        for err in errors:
            print("   ", err)
        if errors:
            failed = True

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
