import { describe, expect, it } from "vitest";
import { getPresetRange, isIsoDate, isRangePreset, toIsoDate } from "./dateRanges";

describe("getPresetRange", () => {
  it("returns Monday to Sunday for this week", () => {
    const friday = new Date(2026, 9, 30);
    expect(getPresetRange("this-week", friday)).toEqual({ from: "2026-10-26", to: "2026-11-01" });
  });

  it("treats Sunday as the last day of the week", () => {
    const sunday = new Date(2026, 10, 1);
    expect(getPresetRange("this-week", sunday)).toEqual({ from: "2026-10-26", to: "2026-11-01" });
  });

  it("treats Monday as the first day of the week", () => {
    const monday = new Date(2026, 9, 26);
    expect(getPresetRange("this-week", monday)).toEqual({ from: "2026-10-26", to: "2026-11-01" });
  });

  it("returns the whole current month, including leap days", () => {
    expect(getPresetRange("this-month", new Date(2028, 1, 15))).toEqual({
      from: "2028-02-01",
      to: "2028-02-29",
    });
  });

  it("returns the previous month across a year boundary", () => {
    expect(getPresetRange("last-month", new Date(2027, 0, 10))).toEqual({
      from: "2026-12-01",
      to: "2026-12-31",
    });
  });
});

describe("toIsoDate", () => {
  it("pads month and day", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("isIsoDate", () => {
  it.each(["2026-10-30", "2024-02-29"])("accepts %s", (value) => {
    expect(isIsoDate(value)).toBe(true);
  });

  it.each([null, "", "abc", "2026-1-5", "2026-13-01"])("rejects %s", (value) => {
    expect(isIsoDate(value)).toBe(false);
  });
});

describe("isRangePreset", () => {
  it("accepts known presets and rejects others", () => {
    expect(isRangePreset("last-month")).toBe(true);
    expect(isRangePreset("bogus")).toBe(false);
    expect(isRangePreset(null)).toBe(false);
  });
});