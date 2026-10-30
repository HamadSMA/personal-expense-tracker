import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getByCategory, getByDay, getSummary, getTopExpenses } from "../services/dashboardService";
import { renderWithProviders } from "../test/renderWithProviders";
import DashboardPage from "./DashboardPage";

vi.mock("../services/dashboardService", () => ({
  getSummary: vi.fn(),
  getByCategory: vi.fn(),
  getByDay: vi.fn(),
  getTopExpenses: vi.fn(),
}));

function mockEmpty() {
  vi.mocked(getSummary).mockResolvedValue({
    totalSpending: 0,
    expenseCount: 0,
    averageExpense: 0,
    largestExpense: 0,
  });
  vi.mocked(getByCategory).mockResolvedValue([]);
  vi.mocked(getByDay).mockResolvedValue([]);
  vi.mocked(getTopExpenses).mockResolvedValue([]);
}

function mockData() {
  vi.mocked(getSummary).mockResolvedValue({
    totalSpending: 185,
    expenseCount: 1,
    averageExpense: 185,
    largestExpense: 185,
  });
  vi.mocked(getByCategory).mockResolvedValue([{ category: "Food", amount: 185, percentage: 100 }]);
  vi.mocked(getByDay).mockResolvedValue([{ date: "2026-09-10", amount: 185 }]);
  vi.mocked(getTopExpenses).mockResolvedValue([
    {
      id: "11111111-1111-1111-1111-111111111111",
      category: "Food",
      amount: 185,
      description: "Dinner",
      expenseDate: "2026-09-10",
    },
  ]);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("DashboardPage", () => {
  it("uses this month by default", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 30, 12));
    mockEmpty();
    renderWithProviders(<DashboardPage />);

    await screen.findAllByText("No spending in this range.");
    expect(getSummary).toHaveBeenCalledWith({ from: "2026-10-01", to: "2026-10-31" }, expect.anything());
  });

  it("passes a custom range from the URL to every endpoint", async () => {
    mockData();
    renderWithProviders(<DashboardPage />, { url: "/?range=custom&from=2026-09-01&to=2026-09-30" });

    await screen.findByRole("link", { name: "Dinner" });
    const range = { from: "2026-09-01", to: "2026-09-30" };
    expect(getSummary).toHaveBeenCalledWith(range, expect.anything());
    expect(getByCategory).toHaveBeenCalledWith(range, expect.anything());
    expect(getByDay).toHaveBeenCalledWith(range, expect.anything());
    expect(getTopExpenses).toHaveBeenCalledWith(range, expect.anything());
    expect(getByCategory).toHaveBeenCalledTimes(1);
  });

  it("renders every section with data", async () => {
    mockData();
    renderWithProviders(<DashboardPage />, { url: "/?range=custom&from=2026-09-01&to=2026-09-30" });

    expect(await screen.findByRole("link", { name: "Dinner" })).toHaveAttribute(
      "href",
      "/expenses/11111111-1111-1111-1111-111111111111",
    );
    expect(screen.getByRole("heading", { name: "Spending by category" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Spending over time" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Top categories" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Top expenses" })).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("shows empty states for a range with no expenses", async () => {
    mockEmpty();
    renderWithProviders(<DashboardPage />, { url: "/?range=custom&from=2020-01-01&to=2020-01-31" });

    await waitFor(() => expect(screen.getAllByText("No spending in this range.")).toHaveLength(3));
    expect(screen.getAllByText("No expenses in this range.")).toHaveLength(2);
  });
});