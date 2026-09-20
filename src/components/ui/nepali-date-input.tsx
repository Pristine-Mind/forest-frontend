"use client";

import React, { useMemo } from "react";
import NepaliDate from "nepali-date-converter";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";

interface NepaliDateInputProps {
  value?: string; // AD ISO (YYYY-MM-DD), same as your API
  onChange?: (value: string) => void; // AD ISO (YYYY-MM-DD)
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
}

const pad = (n: number) => n.toString().padStart(2, "0");

/** AD ISO "2025-01-20" -> BS "2081-10-07" */
export function adToBs(iso?: string): string {
  if (!iso) return "";
  try {
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    if ([y, m, d].some(Number.isNaN)) return "";
    // Local-date constructor avoids UTC day-shift
    const bs = new NepaliDate(new Date(y, m - 1, d));
    return `${bs.getYear()}-${pad(bs.getMonth() + 1)}-${pad(bs.getDate())}`;
  } catch {
    return "";
  }
}

/** BS "2081-10-07" -> AD ISO "2025-01-20" */
export function bsToAd(bs?: string): string {
  if (!bs) return "";
  try {
    const [y, m, d] = bs.split("-").map(Number);
    if ([y, m, d].some(Number.isNaN)) return "";
    const ad = new NepaliDate(y, m - 1, d).toJsDate(); // month is 0-indexed
    return `${ad.getFullYear()}-${pad(ad.getMonth() + 1)}-${pad(ad.getDate())}`;
  } catch {
    return "";
  }
}

/**
 * Nepali (Bikram Sambat) date input.
 * Shows a BS calendar with Nepali numerals and month names,
 * but reads/writes AD ISO strings so the API and form state stay unchanged.
 *
 * @example
 * <NepaliDateInput
 *   value={form.getValues("date_field")}
 *   onChange={(value) => form.setValue("date_field", value)}
 * />
 */
export function NepaliDateInput({
  value = "",
  onChange,
  placeholder = "वर्ष-महिना-दिन",
  disabled = false,
  className = "",
  name,
}: NepaliDateInputProps) {
  const bsValue = useMemo(() => adToBs(value), [value]);

  return (
    <>
      <NepaliDatePicker
        value={bsValue}
        onChange={(bs: string) => onChange?.(bsToAd(bs))}
        placeholder={placeholder}
        disabled={disabled}
        inputClassName={`w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md ${className}`}
        className="w-full"
        options={{
          calenderLocale: "ne", // Nepali calendar UI (numerals + months)
          valueLocale: "en", // return English digits so we can parse it back
          closeOnSelect: true,
        }}
      />
      {name && <input type="hidden" name={name} value={value} />}
    </>
  );
}
