import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCategories } from "../../services/categoryService";
import { ApiError } from "../../services/apiClient";
import { renderWithProviders } from "../../test/renderWithProviders";
import type { ValidationProblemDetails } from "../../types/api";
import ExpenseForm from "./ExpenseForm";

vi.mock("../../services/categoryService", () => ({
  getCategories: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCategories).mockResolvedValue([
    { id: 1, name: "Food" },
    { id: 2, name: "Transport" },
  ]);
});

async function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  renderWithProviders(<ExpenseForm submitLabel="Save" onSubmit={onSubmit} />);
  await screen.findByRole("option", { name: "Food" });
  return onSubmit;
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText(/category/i), "1");
  await user.clear(screen.getByLabelText(/amount/i));
  await user.type(screen.getByLabelText(/amount/i), "12.50");
  await user.type(screen.getByLabelText(/description/i), "  Lunch  ");
  fireEvent.change(screen.getByLabelText(/date/i), { target: { value: "2026-10-01" } });
}

describe("ExpenseForm validation", () => {
  it("does not submit an empty form", async () => {
    const user = userEvent.setup();
    const onSubmit = await renderForm();

    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: "" } });
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByText(/required|select a category/i).length).toBeGreaterThan(0);
  });

  it("rejects an amount of zero", async () => {
    const user = userEvent.setup();
    const onSubmit = await renderForm();
    await fillValid(user);

    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), "0");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/greater than/i)).toBeInTheDocument();
  });

  it("rejects more than two decimals", async () => {
    const user = userEvent.setup();
    const onSubmit = await renderForm();
    await fillValid(user);

    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), "1.234");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/2 decimal|two decimal/i)).toBeInTheDocument();
  });

  it("rejects a future date", async () => {
    const user = userEvent.setup();
    const onSubmit = await renderForm();
    await fillValid(user);

    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: tomorrow } });
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/future|after today/i)).toBeInTheDocument();
  });

  it("submits a valid request", async () => {
    const user = userEvent.setup();
    const onSubmit = await renderForm();
    await fillValid(user);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({
      categoryId: 1,
      amount: 12.5,
      description: "Lunch",
      expenseDate: "2026-10-01",
    });
  });
});

describe("ExpenseForm server errors", () => {
  it("shows ValidationProblemDetails errors under fields and above the form", async () => {
    const user = userEvent.setup();
    const problem: ValidationProblemDetails = {
      title: "One or more validation errors occurred.",
      status: 400,
      errors: {
        CategoryId: ["Category is invalid."],
        Something: ["Something else is wrong."],
      },
    };
    const onSubmit = vi.fn().mockRejectedValue(new ApiError(400, problem));
    await renderForm(onSubmit);
    await fillValid(user);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Category is invalid.")).toBeInTheDocument();
    expect(screen.getByText("Something else is wrong.")).toBeInTheDocument();
  });

  it("shows a generic error message", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Network down"));
    await renderForm(onSubmit);
    await fillValid(user);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText(/network down/i)).toBeInTheDocument();
  });
});