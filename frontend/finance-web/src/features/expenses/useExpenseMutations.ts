import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "../../services/expenseService";
import type { SaveExpenseRequest } from "../../types/expense";
import { dashboardKeys } from "../dashboard/useDashboard";
import { expenseKeys } from "./useExpenses";

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SaveExpenseRequest) => createExpense(request),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]),
  });
}

export function useUpdateExpense(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SaveExpenseRequest) => updateExpense(id, request),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: expenseKeys.detail(id) });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: [...expenseKeys.all, "list"] }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
  });
}