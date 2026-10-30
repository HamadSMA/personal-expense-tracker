import { formatSar } from "../utils/formatSar";

export function sarText(amount: number): string {
  return formatSar(amount).replace(/\s/g, " ");
}