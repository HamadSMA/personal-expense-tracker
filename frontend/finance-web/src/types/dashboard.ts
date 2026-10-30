export type DashboardSummary = {
  totalSpending: number;
  expenseCount: number;
  averageExpense: number;
  largestExpense: number;
};

export type CategorySpending = {
  category: string;
  amount: number;
  percentage: number;
};

export type DailySpending = {
  date: string;
  amount: number;
};

export type TopExpense = {
  id: string;
  category: string;
  amount: number;
  description: string;
  expenseDate: string;
};

export type DateRange = {
  from?: string;
  to?: string;
};