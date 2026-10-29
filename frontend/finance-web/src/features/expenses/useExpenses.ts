import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { ApiError } from "../../services/apiClient";
import { getExpense, getExpenses } from "../../services/expenseService";
import type { ExpenseQuery } from "../../types/expense";

export const expenseKeys = {
  all: ["expenses"] as const,
  list: (query: ExpenseQuery) => [...expenseKeys.all, "list", query] as const,
  detail: (id: string) => [...expenseKeys.all, "detail", id] as const,
};

export function useExpenses(query: ExpenseQuery = {}) {
  return useQuery({
    queryKey: expenseKeys.list(query),
    queryFn: ({ signal }) => getExpenses(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function useExpense(id: string | undefined) {
  return useQuery({
    queryKey: expenseKeys.detail(id ?? ""),
    queryFn: id ? ({ signal }) => getExpense(id, signal) : skipToken,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 1,
  });
}