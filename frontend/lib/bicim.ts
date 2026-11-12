/** Number and date formatting, always in the tr-TR locale. */

const LOCALE = "tr-TR";

export function formatNumber(
  value: number,
  maximumFractionDigits = 0,
  minimumFractionDigits = 0,
): string {
  return new Intl.NumberFormat(LOCALE, { minimumFractionDigits, maximumFractionDigits }).format(
    value,
  );
}

/** 12000 -> "12.000 USD". The currency is spelled out: the data set is in US dollars. */
export function formatUsd(value: number): string {
  return `${formatNumber(value)} USD`;
}

/** 0.444 -> "%44". Turkish puts the percent sign first. */
export function formatPercent(ratio: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits }).format(ratio);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}
