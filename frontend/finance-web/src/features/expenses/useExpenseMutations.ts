import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense, deleteExpense, updateExpense } from "../../services/expenseService";
import type { SaveExpenseRequest } from "../../types/expense";
import { expenseKeys } from "./useExpenses";

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SaveExpenseRequest) => createExpense(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useUpdateExpense(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SaveExpenseRequest) => updateExpense(id, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: expenseKeys.detail(id) });
      return queryClient.invalidateQueries({ queryKey: [...expenseKeys.all, "list"] });
    },
  });
}