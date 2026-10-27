import type { Category } from "../types/category";
import { apiRequest } from "./apiClient";

export function getCategories(signal?: AbortSignal): Promise<Category[]> {
  return apiRequest<Category[]>("/api/categories", { signal });
}