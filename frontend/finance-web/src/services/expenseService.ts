import { apiRequest } from "./apiClient";
import type { PagedResult } from "../types/api";
import type { Expense, ExpenseQuery, SaveExpenseRequest } from "../types/expense";

export function getExpenses(query: ExpenseQuery = {}, signal?: AbortSignal) {
  return apiRequest<PagedResult<Expense>>("/api/expenses", { query, signal });
}

export function getExpense(id: string, signal?: AbortSignal) {
  return apiRequest<Expense>(`/api/expenses/${encodeURIComponent(id)}`, { signal });
}

export function createExpense(request: SaveExpenseRequest) {
  return apiRequest<Expense>("/api/expenses", { method: "POST", body: request });
}

export function updateExpense(id: string, request: SaveExpenseRequest) {
  return apiRequest<void>(`/api/expenses/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: request,
  });
}

export function deleteExpense(id: string) {
  return apiRequest<void>(`/api/expenses/${encodeURIComponent(id)}`, { method: "DELETE" });
}