import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCategories } from "../services/categoryService";
import { getExpenses } from "../services/expenseService";
import { renderWithProviders } from "../test/renderWithProviders";
import { sarText } from "../test/sarText";
import type { PagedResult } from "../types/api";
import type { Expense } from "../types/expense";
import ExpensesPage from "./ExpensesPage";

vi.mock("../services/expenseService", () => ({
  getExpenses: vi.fn(),
  getExpense: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
}));

vi.mock("../services/categoryService", () => ({
  getCategories: vi.fn(),
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

function page(items: Expense[]): PagedResult<Expense> {
  return { items, page: 1, pageSize: 20, totalCount: items.length, totalPages: items.length ? 1 : 0 };
}

function renderPage(url = "/expenses") {
  return renderWithProviders(<ExpensesPage />, { path: "/expenses", url });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCategories).mockResolvedValue([{ id: 1, name: "Food" }]);
});

describe("ExpensesPage", () => {
  it("shows loading", () => {
    vi.mocked(getExpenses).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows an error", async () => {
    vi.mocked(getExpenses).mockRejectedValue(new Error("Server exploded"));
    renderPage();
    expect(await screen.findByText(/server exploded/i)).toBeInTheDocument();
  });

  it("shows the empty state without filters", async () => {
    vi.mocked(getExpenses).mockResolvedValue(page([]));
    renderPage();
    expect(await screen.findByText("No expenses yet.")).toBeInTheDocument();
  });

  it("shows the filtered empty state and sends the filter", async () => {
    vi.mocked(getExpenses).mockResolvedValue(page([]));
    renderPage("/expenses?search=coffee");

    expect(await screen.findByText("No expenses match these filters.")).toBeInTheDocument();
    expect(getExpenses).toHaveBeenCalledWith(expect.objectContaining({ search: "coffee" }), expect.anything());
  });

  it("renders rows with links and SAR amounts", async () => {
    vi.mocked(getExpenses).mockResolvedValue(page([expense]));
    renderPage();

    const link = await screen.findByRole("link", { name: "Lunch" });
    expect(link).toHaveAttribute("href", `/expenses/${expense.id}`);
    expect(screen.getByText(sarText(12.5))).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Food" })).toBeInTheDocument();
  });
});