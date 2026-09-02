// Change these two constants to switch how money is displayed everywhere.
export const LOCALE = "en-IN";
export const CURRENCY = "INR";

const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  notation: "compact",
  maximumFractionDigits: 1,
});

const number = new Intl.NumberFormat(LOCALE);

export function formatCurrency(value: number) {
  return currency.format(value);
}

export function formatNumber(value: number) {
  return number.format(value);
}
