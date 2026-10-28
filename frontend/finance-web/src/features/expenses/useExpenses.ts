import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getExpenses } from "../../services/expenseService";
import type { ExpenseQuery } from "../../types/expense";

export const expenseKeys = {
  all: ["expenses"] as const,
  list: (query: ExpenseQuery) => [...expenseKeys.all, "list", query] as const,
};

export function useExpenses(query: ExpenseQuery = {}) {
  return useQuery({
    queryKey: expenseKeys.list(query),
    queryFn: ({ signal }) => getExpenses(query, signal),
    placeholderData: keepPreviousData,
  });
}