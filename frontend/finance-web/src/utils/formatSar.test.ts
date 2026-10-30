import { describe, expect, it } from "vitest";
import { formatSar } from "./formatSar";

describe("formatSar", () => {
  it("formats with thousands separator and two decimals", () => {
    expect(formatSar(1234.5)).toContain("1,234.50");
  });

  it("includes the SAR currency", () => {
    expect(formatSar(5)).toMatch(/SAR|ر\.س/);
  });
});