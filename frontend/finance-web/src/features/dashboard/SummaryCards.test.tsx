import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSummary } from "../../services/dashboardService";
import { renderWithProviders } from "../../test/renderWithProviders";
import { sarText } from "../../test/sarText";
import SummaryCards from "./SummaryCards";

vi.mock("../../services/dashboardService", () => ({
  getSummary: vi.fn(),
  getByCategory: vi.fn(),
  getByDay: vi.fn(),
  getTopExpenses: vi.fn(),
}));

const range = { from: "2026-10-01", to: "2026-10-31" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SummaryCards", () => {
  it("shows the four values", async () => {
    vi.mocked(getSummary).mockResolvedValue({
      totalSpending: 1284.5,
      expenseCount: 47,
      averageExpense: 27.33,
      largestExpense: 185,
    });
    renderWithProviders(<SummaryCards range={range} />);

    expect(await screen.findByText(sarText(1284.5))).toBeInTheDocument();
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText(sarText(27.33))).toBeInTheDocument();
    expect(screen.getByText(sarText(185))).toBeInTheDocument();
    expect(getSummary).toHaveBeenCalledWith(range, expect.anything());
  });

  it("shows the empty state", async () => {
    vi.mocked(getSummary).mockResolvedValue({
      totalSpending: 0,
      expenseCount: 0,
      averageExpense: 0,
      largestExpense: 0,
    });
    renderWithProviders(<SummaryCards range={range} />);

    expect(await screen.findByText("No expenses in this range.")).toBeInTheDocument();
  });

  it("shows an error", async () => {
    vi.mocked(getSummary).mockRejectedValue(new Error("Down"));
    renderWithProviders(<SummaryCards range={range} />);

    expect(await screen.findByText(/could not load summary/i)).toHaveTextContent("Down");
  });
});