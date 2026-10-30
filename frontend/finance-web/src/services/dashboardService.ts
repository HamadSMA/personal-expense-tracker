import { apiRequest } from "./apiClient";
import type {
  CategorySpending,
  DailySpending,
  DashboardSummary,
  DateRange,
  TopExpense,
} from "../types/dashboard";

export function getSummary(range: DateRange = {}, signal?: AbortSignal) {
  return apiRequest<DashboardSummary>("/api/dashboard/summary", { query: range, signal });
}

export function getByCategory(range: DateRange = {}, signal?: AbortSignal) {
  return apiRequest<CategorySpending[]>("/api/dashboard/by-category", { query: range, signal });
}

export function getByDay(range: DateRange = {}, signal?: AbortSignal) {
  return apiRequest<DailySpending[]>("/api/dashboard/by-day", { query: range, signal });
}

export function getTopExpenses(range: DateRange = {}, signal?: AbortSignal) {
  return apiRequest<TopExpense[]>("/api/dashboard/top-expenses", { query: range, signal });
}