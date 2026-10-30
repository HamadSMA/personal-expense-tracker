import type { DateRange } from "../types/dashboard";

export type RangePreset = "this-week" | "this-month" | "last-month" | "custom";

export const rangePresets: { value: RangePreset; label: string }[] = [
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "custom", label: "Custom range" },
];

export function isRangePreset(value: string | null): value is RangePreset {
  return rangePresets.some((preset) => preset.value === value);
}

export function isIsoDate(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPresetRange(preset: Exclude<RangePreset, "custom">, today = new Date()): DateRange {
  const year = today.getFullYear();
  const month = today.getMonth();

  switch (preset) {
    case "this-week": {
      const daysSinceMonday = (today.getDay() + 6) % 7;
      const monday = new Date(year, month, today.getDate() - daysSinceMonday);
      const sunday = new Date(year, month, monday.getDate() + 6);
      return { from: toIsoDate(monday), to: toIsoDate(sunday) };
    }
    case "this-month":
      return { from: toIsoDate(new Date(year, month, 1)), to: toIsoDate(new Date(year, month + 1, 0)) };
    case "last-month":
      return { from: toIsoDate(new Date(year, month - 1, 1)), to: toIsoDate(new Date(year, month, 0)) };
  }
}