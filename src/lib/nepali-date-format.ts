/**
 * Nepali Date Formatting Utility
 * Provides consistent date formatting in Nepali (नेपाली) throughout the application
 */

const NEPALI_MONTHS = [
  "जनवरी",
  "फेब्रुअरी",
  "मार्च",
  "अप्रिल",
  "मे",
  "जुन",
  "जुलाई",
  "अगस्ट",
  "सेप्टेम्बर",
  "अक्टोबर",
  "नोभेम्बर",
  "डिसेम्बर",
];

const NEPALI_DAYS = [
  "आइतबार",
  "सोमबार",
  "मङ्गलबार",
  "बुधबार",
  "बिहीबार",
  "शुक्रबार",
  "शनिबार",
];

/**
 * Convert English numerals to Nepali numerals (Devanagari)
 * @example convertToNepaliNumerals(2025) => "२०२५"
 */
export function convertToNepaliNumerals(num: number | string): string {
  const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(num)
    .split("")
    .map((digit) => {
      const d = parseInt(digit, 10);
      return isNaN(d) ? digit : nepaliDigits[d];
    })
    .join("");
}

import NepaliDate from "nepali-date-converter";


const pad = (n: number) => n.toString().padStart(2, "0");

/**
 * Format an AD date as a Bikram Sambat (BS) date
 * @param value - ISO date string (AD)
 * @param format - 'short' | 'long' | 'datetime' (default: 'short')
 * @param useNepaliNumerals - Convert to Nepali numerals (default: true)
 * @example formatDateNepali('2025-01-20') => "२०८१-१०-०७"
 * @example formatDateNepali('2025-01-20', 'long') => "०७ माघ २०८१"
 * @example formatDateNepali('2025-01-20T14:30:00', 'datetime') => "२०८१-१०-०७ १४:३०:००"
 */
export function formatDateNepali(
  value?: string | null,
  format: "short" | "long" | "datetime" = "short",
  useNepaliNumerals: boolean = true
): string {
  if (!value) return "..................";

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    const bs = new NepaliDate(date);
    const year = bs.getYear();
    const month = bs.getMonth(); // 0-indexed (0 = बैशाख)
    const day = bs.getDate();

    let formatted: string;

    switch (format) {
      case "long":
        formatted = `${pad(day)} ${NEPALI_MONTHS[month]} ${year}`;
        break;
      case "datetime": {
        const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        formatted = `${year}-${pad(month + 1)}-${pad(day)} ${time}`;
        break;
      }
      case "short":
      default:
        formatted = `${year}-${pad(month + 1)}-${pad(day)}`;
    }

    return useNepaliNumerals ? convertToNepaliNumerals(formatted) : formatted;
  } catch {
    return value; // out-of-range or invalid date
  }
}


/**
 * Format date with day name in Nepali
 * @example formatDateWithDayNepali('2025-01-20') => "सोमबार, २० जनवरी २०२५"
 */
export function formatDateWithDayNepali(
  value?: string | null,
  useNepaliNumerals: boolean = true
): string {
  if (!value) return "..................";

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    const dayName = NEPALI_DAYS[date.getDay()];
    const day = date.getDate().toString().padStart(2, "0");
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    let formatted = `${dayName}, ${day} ${NEPALI_MONTHS[monthIndex]} ${year}`;

    if (useNepaliNumerals) {
      formatted = convertToNepaliNumerals(formatted);
    }

    return formatted;
  } catch (error) {
    return value;
  }
}

/**
 * Format time in 24-hour format in Nepali
 * @example formatTimeNepali('2025-01-20T14:30:00') => "१४:३०"
 */
export function formatTimeNepali(
  value?: string | null,
  useNepaliNumerals: boolean = true
): string {
  if (!value) return "..................";

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    let formatted = `${hours}:${minutes}`;

    if (useNepaliNumerals) {
      formatted = convertToNepaliNumerals(formatted);
    }

    return formatted;
  } catch (error) {
    return value;
  }
}

/**
 * Parse date in ISO format and return it with Nepali date format
 * Useful for API responses
 * @example formatDateISO('2025-01-20') => "२०२५-०१-२०"
 */
export function formatDateISO(
  value?: string | null,
  useNepaliNumerals: boolean = true
): string {
  if (!value) return "..................";

  try {
    // Assume ISO format (YYYY-MM-DD)
    const [year, month, day] = value.split("T")[0].split("-");
    let formatted = `${year}-${month}-${day}`;

    if (useNepaliNumerals) {
      formatted = convertToNepaliNumerals(formatted);
    }

    return formatted;
  } catch (error) {
    return value;
  }
}

/**
 * Get today's date in Nepali format
 * @example getTodayNepali() => "२०२५-०१-२०"
 */
export function getTodayNepali(
  format: "short" | "long" | "datetime" = "short",
  useNepaliNumerals: boolean = true
): string {
  return formatDateNepali(new Date().toISOString(), format, useNepaliNumerals);
}

/**
 * Format a date range in Nepali
 * @example formatDateRangeNepali('2025-01-01', '2025-01-20') => "२०२५-०१-०१ देखि २०२५-०१-२०"
 */
export function formatDateRangeNepali(
  startDate?: string | null,
  endDate?: string | null,
  useNepaliNumerals: boolean = true
): string {
  const start = formatDateNepali(startDate, "short", useNepaliNumerals);
  const end = formatDateNepali(endDate, "short", useNepaliNumerals);
  return `${start} देखि ${end}`;
}
