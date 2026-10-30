import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getByCategory,
  getByDay,
  getSummary,
  getTopExpenses,
} from "../../services/dashboardService";
import type { DateRange } from "../../types/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (range: DateRange) => [...dashboardKeys.all, "summary", range] as const,
  byCategory: (range: DateRange) => [...dashboardKeys.all, "by-category", range] as const,
  byDay: (range: DateRange) => [...dashboardKeys.all, "by-day", range] as const,
  topExpenses: (range: DateRange) => [...dashboardKeys.all, "top-expenses", range] as const,
};

export function useDashboardSummary(range: DateRange) {
  return useQuery({
    queryKey: dashboardKeys.summary(range),
    queryFn: ({ signal }) => getSummary(range, signal),
    placeholderData: keepPreviousData,
  });
}

export function useSpendingByCategory(range: DateRange) {
  return useQuery({
    queryKey: dashboardKeys.byCategory(range),
    queryFn: ({ signal }) => getByCategory(range, signal),
    placeholderData: keepPreviousData,
  });
}

export function useSpendingOverTime(range: DateRange) {
  return useQuery({
    queryKey: dashboardKeys.byDay(range),
    queryFn: ({ signal }) => getByDay(range, signal),
    placeholderData: keepPreviousData,
  });
}

export function useTopExpenses(range: DateRange) {
  return useQuery({
    queryKey: dashboardKeys.topExpenses(range),
    queryFn: ({ signal }) => getTopExpenses(range, signal),
    placeholderData: keepPreviousData,
  });
}