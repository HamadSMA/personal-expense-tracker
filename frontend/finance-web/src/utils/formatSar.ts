const sar = new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR" });

export function formatSar(amount: number): string {
  return sar.format(amount);
}