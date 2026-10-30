import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/apiClient";
import { deleteExpense, getExpense } from "../services/expenseService";
import { renderWithProviders } from "../test/renderWithProviders";
import type { Expense } from "../types/expense";
import ExpenseDetailPage from "./ExpenseDetailPage";

vi.mock("../services/expenseService", () => ({
  getExpenses: vi.fn(),
  getExpense: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
}));

const expense: Expense = {
  id: "11111111-1111-1111-1111-111111111111",
  categoryId: 1,
  categoryName: "Food",
  amount: 12.5,
  description: "Lunch",
  expenseDate: "2026-10-01",
  createdAt: "2026-10-01T10:00:00Z",
  updatedAt: "2026-10-01T10:00:00Z",
};

function renderPage(id = expense.id) {
  return renderWithProviders(<ExpenseDetailPage />, { path: "/expenses/:id", url: `/expenses/${id}` });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ExpenseDetailPage", () => {
  it("shows not found on 404 without retrying", async () => {
    vi.mocked(getExpense).mockRejectedValue(new ApiError(404, { title: "Not Found", status: 404 }));
    renderPage("abc");

    expect(await screen.findByText("Expense not found")).toBeInTheDocument();
    expect(getExpense).toHaveBeenCalledTimes(1);
  });

  it("deletes after confirmation and returns to the list", async () => {
    const user = userEvent.setup();
    vi.mocked(getExpense).mockResolvedValue(expense);
    vi.mocked(deleteExpense).mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { router } = renderPage();

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/expenses"));
    expect(deleteExpense).toHaveBeenCalledWith(expense.id);
  });

  it("does not delete when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    vi.mocked(getExpense).mockResolvedValue(expense);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderPage();

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(deleteExpense).not.toHaveBeenCalled();
  });
});