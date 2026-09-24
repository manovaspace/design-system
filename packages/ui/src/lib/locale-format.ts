export interface FormatTomanOptions {
  showUnit?: boolean;
  locale?: string;
}

export interface FormatPersianDateOptions {
  format?: "short" | "medium" | "long";
  timeZone?: string;
}

/**
 * Formats integers using Persian digits when locale === "fa", standard digits otherwise.
 */
export function formatLocaleInteger(
  value: number,
  locale: string = "fa",
): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "";
  }
  const resolvedLocale =
    locale === "fa" || locale === "fa-IR" ? "fa-IR" : locale;
  return new Intl.NumberFormat(resolvedLocale, {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats financial Toman amounts with grouping and Persian numerals.
 * If showUnit is true, appends " تومان" for fa or " Toman" for other locales.
 */
export function formatToman(
  amount: number,
  options?: FormatTomanOptions,
): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "";
  }
  const { showUnit = false, locale = "fa" } = options ?? {};
  const isFa = locale === "fa" || locale === "fa-IR";
  const numLocale = isFa ? "fa-IR" : locale || "en-US";
  const formatted = new Intl.NumberFormat(numLocale).format(amount);
  if (showUnit) {
    return isFa ? `${formatted} تومان` : `${formatted} Toman`;
  }
  return formatted;
}

/**
 * Formats relative times using Intl.RelativeTimeFormat(locale, { numeric: "auto" }).
 * e.g. "۵ دقیقه پیش", "now", "yesterday", "5 minutes ago".
 */
export function formatLocaleRelativeTime(
  dateOrIso: string | Date,
  locale: string = "fa",
  now?: Date,
): string {
  const target =
    typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  if (!target || !(target instanceof Date) || Number.isNaN(target.getTime())) {
    return "";
  }
  const baseNow = now ?? new Date();
  if (!(baseNow instanceof Date) || Number.isNaN(baseNow.getTime())) {
    return "";
  }

  const diffSec = Math.round((target.getTime() - baseNow.getTime()) / 1000);
  const rtfLocale = locale === "fa" || locale === "fa-IR" ? "fa-IR" : locale;
  const rtf = new Intl.RelativeTimeFormat(rtfLocale, { numeric: "auto" });

  const absSec = Math.abs(diffSec);
  if (absSec < 60) {
    return rtf.format(diffSec, "second");
  }
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, "minute");
  }
  const diffHour = Math.round(diffSec / 3600);
  if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, "hour");
  }
  const diffDay = Math.round(diffSec / 86400);
  if (Math.abs(diffDay) < 30) {
    return rtf.format(diffDay, "day");
  }
  const diffMonth = Math.round(diffSec / (86400 * 30));
  if (Math.abs(diffMonth) < 12) {
    return rtf.format(diffMonth, "month");
  }
  const diffYear = Math.round(diffSec / (86400 * 365));
  return rtf.format(diffYear, "year");
}

/**
 * Formats dates into the Persian (Solar Hijri / Shamsi) calendar using
 * Intl.DateTimeFormat("fa-IR-u-ca-persian", ...).
 */
export function formatPersianDate(
  dateOrIso: string | Date,
  options?: FormatPersianDateOptions,
): string {
  const target =
    typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  if (!target || !(target instanceof Date) || Number.isNaN(target.getTime())) {
    return "";
  }
  const dateStyle = options?.format ?? "medium";
  const dtfOptions: Intl.DateTimeFormatOptions = {
    dateStyle,
    ...(options?.timeZone ? { timeZone: options.timeZone } : {}),
  };
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", dtfOptions).format(
    target,
  );
}
