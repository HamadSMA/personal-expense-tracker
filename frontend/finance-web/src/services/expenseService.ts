import { apiRequest } from "./apiClient";
import type { PagedResult } from "../types/api";
import type { Expense, ExpenseQuery } from "../types/expense";

export function getExpenses(query: ExpenseQuery = {}, signal?: AbortSignal) {
  return apiRequest<PagedResult<Expense>>("/api/expenses", { query, signal });
}