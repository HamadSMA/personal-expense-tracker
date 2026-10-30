import { Link, useNavigate, useParams } from "react-router";
import CategoryLabel from "../components/CategoryLabel";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import { useDeleteExpense } from "../features/expenses/useExpenseMutations";
import { useExpense } from "../features/expenses/useExpenses";
import { ApiError } from "../services/apiClient";
import { formatDate, formatDateTime } from "../utils/formatDate";
import { formatSar } from "../utils/formatSar";
import styles from "./ExpenseDetailPage.module.css";

function ExpenseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const expense = useExpense(id);
  const deleteExpense = useDeleteExpense();

  if (expense.isPending) {
    return <StatusMessage variant="loading">Loading…</StatusMessage>;
  }

  if (expense.isError) {
    if (expense.error instanceof ApiError && expense.error.status === 404) {
      return (
        <PageHeader
          title="Expense not found"
          description="It may have been deleted."
          actions={
            <Link to="/expenses" className="btn">
              Back to expenses
            </Link>
          }
        />
      );
    }
    return <StatusMessage variant="error">Error: {expense.error.message}</StatusMessage>;
  }

  const { data } = expense;

  return (
    <>
      <PageHeader
        title={data.description}
        actions={
          <>
            <Link to={`/expenses/${data.id}/edit`} className="btn">
              Edit
            </Link>
            <button
              type="button"
              className="btn btn-danger"
              disabled={deleteExpense.isPending}
              onClick={() => {
                if (!window.confirm(`Delete "${data.description}"?`)) return;
                deleteExpense.mutate(data.id, {
                  onSuccess: () => navigate("/expenses", { replace: true }),
                });
              }}
            >
              {deleteExpense.isPending ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      />

      {deleteExpense.isError && (
        <StatusMessage variant="error">Could not delete: {deleteExpense.error.message}</StatusMessage>
      )}

      <div className={styles.sheet}>
        <p className={styles.amount}>{formatSar(data.amount)}</p>
        <dl className={styles.properties}>
          <div className={styles.row}>
            <dt>Category</dt>
            <dd>
              <CategoryLabel name={data.categoryName} />
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Date</dt>
            <dd>{formatDate(data.expenseDate)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Created</dt>
            <dd className={styles.meta}>{formatDateTime(data.createdAt)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Updated</dt>
            <dd className={styles.meta}>{formatDateTime(data.updatedAt)}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}

export default ExpenseDetailPage;
