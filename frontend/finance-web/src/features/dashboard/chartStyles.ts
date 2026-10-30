import type { CSSProperties } from "react";

export const chartPrimaryColor = "#2f5fd0";

export const axisTick = { fill: "#9c9b97", fontSize: 11 };

export const tooltipContentStyle: CSSProperties = {
  padding: "6px 10px",
  background: "var(--color-surface)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  boxShadow: "var(--shadow-popover)",
  color: "var(--color-text)",
  fontSize: "var(--font-size-sm)",
};

export const tooltipLabelStyle: CSSProperties = {
  marginBottom: 2,
  color: "var(--color-text-muted)",
  fontWeight: 500,
};

export const tooltipItemStyle: CSSProperties = {
  padding: 0,
  color: "var(--color-text)",
  fontVariantNumeric: "tabular-nums",
};
