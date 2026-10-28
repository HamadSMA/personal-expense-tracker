export type Expense = {
  id: string;
  categoryId: number;
  categoryName: string;
  amount: number;
  description: string;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseSortBy = "amount" | "expenseDate" | "createdAt";

export type SortDirection = "asc" | "desc";

export type ExpenseQuery = {
  categoryId?: number;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
  sortBy?: ExpenseSortBy;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
};

export type SaveExpenseRequest = {
  categoryId: number;
  amount: number;
  description: string;
  expenseDate: string;
};