import { useState } from "react";
import { ApiError } from "../../services/apiClient";
import type { ValidationProblemDetails } from "../../types/api";
import type { SaveExpenseRequest } from "../../types/expense";
import { useCategories } from "./useCategories";

type Field = "categoryId" | "amount" | "description" | "expenseDate";
type FieldErrors = Partial<Record<Field, string>>;
type FormValues = Record<Field, string>;

interface ExpenseFormProps {
  initialValues?: SaveExpenseRequest;
  submitLabel: string;
  onSubmit: (request: SaveExpenseRequest) => Promise<unknown>;
}

const fields: Field[] = ["categoryId", "amount", "description", "expenseDate"];
const maxDescriptionLength = 500;

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.categoryId) {
    errors.categoryId = "Category is required.";
  }

  if (!values.amount) {
    errors.amount = "Amount is required.";
  } else if (!/^\d+(\.\d{1,2})?$/.test(values.amount)) {
    errors.amount = "Amount must be a number with at most 2 decimal places.";
  } else if (Number(values.amount) <= 0) {
    errors.amount = "Amount must be greater than zero.";
  }

  const description = values.description.trim();
  if (!description) {
    errors.description = "Description is required.";
  } else if (description.length > maxDescriptionLength) {
    errors.description = `Description must be at most ${maxDescriptionLength} characters.`;
  }

  if (!values.expenseDate) {
    errors.expenseDate = "Date is required.";
  } else if (values.expenseDate > todayUtc()) {
    errors.expenseDate = "Date cannot be in the future.";
  }

  return errors;
}

function isValidationProblem(problem: unknown): problem is ValidationProblemDetails {
  return typeof problem === "object" && problem !== null && "errors" in problem;
}

function mapServerErrors(problem: ValidationProblemDetails) {
  const fieldErrors: FieldErrors = {};
  const otherErrors: string[] = [];

  for (const [key, messages] of Object.entries(problem.errors)) {
    const name = key.charAt(0).toLowerCase() + key.slice(1);
    const field = fields.find((f) => f === name);
    if (field) {
      fieldErrors[field] = messages.join(" ");
    } else {
      otherErrors.push(...messages);
    }
  }

  return { fieldErrors, otherErrors };
}

export default function ExpenseForm({ initialValues, submitLabel, onSubmit }: ExpenseFormProps) {
  const categories = useCategories();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const values: FormValues = {
          categoryId: String(data.get("categoryId") ?? ""),
          amount: String(data.get("amount") ?? "").trim(),
          description: String(data.get("description") ?? ""),
          expenseDate: String(data.get("expenseDate") ?? ""),
        };

        const errors = validate(values);
        setFieldErrors(errors);
        setFormErrors([]);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        try {
          await onSubmit({
            categoryId: Number(values.categoryId),
            amount: Number(values.amount),
            description: values.description.trim(),
            expenseDate: values.expenseDate,
          });
        } catch (error) {
          if (error instanceof ApiError && error.status === 400 && isValidationProblem(error.problem)) {
            const mapped = mapServerErrors(error.problem);
            setFieldErrors(mapped.fieldErrors);
            setFormErrors(mapped.otherErrors);
          } else {
            setFormErrors([error instanceof Error ? error.message : "Something went wrong."]);
          }
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      {formErrors.length > 0 && (
        <ul role="alert">
          {formErrors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div>
        <label htmlFor="categoryId">Category</label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={initialValues?.categoryId ?? ""}
          disabled={categories.isPending}
          aria-invalid={fieldErrors.categoryId ? true : undefined}
        >
          <option value="">
            {categories.isPending ? "Loading categories…" : "Select a category"}
          </option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {categories.isError && <p role="alert">Could not load categories.</p>}
        {fieldErrors.categoryId && <p role="alert">{fieldErrors.categoryId}</p>}
      </div>

      <div>
        <label htmlFor="amount">Amount (SAR)</label>
        <input
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          defaultValue={initialValues ? initialValues.amount.toFixed(2) : ""}
          aria-invalid={fieldErrors.amount ? true : undefined}
        />
        {fieldErrors.amount && <p role="alert">{fieldErrors.amount}</p>}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          maxLength={maxDescriptionLength}
          defaultValue={initialValues?.description ?? ""}
          aria-invalid={fieldErrors.description ? true : undefined}
        />
        {fieldErrors.description && <p role="alert">{fieldErrors.description}</p>}
      </div>

      <div>
        <label htmlFor="expenseDate">Date</label>
        <input
          id="expenseDate"
          name="expenseDate"
          type="date"
          max={todayUtc()}
          defaultValue={initialValues?.expenseDate ?? todayUtc()}
          aria-invalid={fieldErrors.expenseDate ? true : undefined}
        />
        {fieldErrors.expenseDate && <p role="alert">{fieldErrors.expenseDate}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}