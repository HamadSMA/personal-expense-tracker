const categoryColors: Record<string, string> = {
  Food: "#e07b39",
  Transport: "#3e74d6",
  Housing: "#8a63c9",
  Shopping: "#d4598c",
  Entertainment: "#d3a02a",
  Bills: "#3f9686",
  Healthcare: "#cf4b4b",
  Travel: "#3a9fc7",
  Other: "#8b8a86",
};

const fallbackColor = "#b5b3ad";

export function getCategoryColor(category: string): string {
  return categoryColors[category] ?? fallbackColor;
}
