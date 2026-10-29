import { Link, useNavigate, useParams } from "react-router";
import { useDeleteExpense } from "../features/expenses/useExpenseMutations";
import { useExpense } from "../features/expenses/useExpenses";
import { ApiError } from "../services/apiClient";

const sar = new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR" });

function ExpenseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const expense = useExpense(id);
  const deleteExpense = useDeleteExpense();

  if (expense.isPending) {
    return <p>Loading…</p>;
  }

  if (expense.isError) {
    if (expense.error instanceof ApiError && expense.error.status === 404) {
      return (
        <>
          <h1>Expense not found</h1>
          <Link to="/expenses">Back to expenses</Link>
        </>
      );
    }
    return <p role="alert">Error: {expense.error.message}</p>;
  }

  const { data } = expense;

  return (
    <>
      <h1>{data.description}</h1>

      <dl>
        <dt>Amount</dt>
        <dd>{sar.format(data.amount)}</dd>
        <dt>Category</dt>
        <dd>{data.categoryName}</dd>
        <dt>Date</dt>
        <dd>{data.expenseDate}</dd>
        <dt>Created</dt>
        <dd>{new Date(data.createdAt).toLocaleString()}</dd>
        <dt>Updated</dt>
        <dd>{new Date(data.updatedAt).toLocaleString()}</dd>
      </dl>

      {deleteExpense.isError && (
        <p role="alert">Could not delete: {deleteExpense.error.message}</p>
      )}

      <Link to={`/expenses/${data.id}/edit`}>Edit</Link>{" "}
      <button
        type="button"
        disabled={deleteExpense.isPending}
        onClick={() => {
          if (!window.confirm(`Delete "${data.description}"?`)) return;
          deleteExpense.mutate(data.id, {
            onSuccess: () => navigate("/expenses", { replace: true }),
          });
        }}
      >
        {deleteExpense.isPending ? "Deleting…" : "Delete"}
      </button>{" "}
      <Link to="/expenses">Back to expenses</Link>
    </>
  );
}

export default ExpenseDetailPage;