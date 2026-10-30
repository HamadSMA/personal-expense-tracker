import { Link } from "react-router";
import CategoryLabel from "../components/CategoryLabel";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import { useDeleteExpense } from "../features/expenses/useExpenseMutations";
import { useExpenses } from "../features/expenses/useExpenses";
import { useExpenseQueryParams } from "../features/expenses/useExpenseQueryParams";
import ExpenseFilters from "../features/expenses/ExpenseFilters";
import ExpenseSortControls from "../features/expenses/ExpenseSortControls";
import ExpensePagination from "../features/expenses/ExpensePagination";
import { formatDate } from "../utils/formatDate";
import { formatSar } from "../utils/formatSar";
import styles from "./ExpensesPage.module.css";

function ExpensesPage() {
  const { query, updateQuery, resetQuery } = useExpenseQueryParams();
  const { data, isPending, isError, error, isFetching } = useExpenses(query);
  const deleteExpense = useDeleteExpense();

  const hasFilters =
    query.search !== undefined ||
    query.categoryId !== undefined ||
    query.fromDate !== undefined ||
    query.toDate !== undefined ||
    query.minAmount !== undefined ||
    query.maxAmount !== undefined;

  function renderResults() {
    if (isPending) {
      return (
        <div className={styles.state}>
          <StatusMessage variant="loading">Loading…</StatusMessage>
        </div>
      );
    }

    if (isError) {
      return (
        <div className={styles.state}>
          <StatusMessage variant="error">Error: {error.message}</StatusMessage>
        </div>
      );
    }

    if (data.items.length === 0) {
      return (
        <StatusMessage variant="empty">
          {hasFilters ? "No expenses match these filters." : "No expenses yet."}
        </StatusMessage>
      );
    }

    return (
      <>
        {deleteExpense.isError && (
          <div className={styles.state}>
            <StatusMessage variant="error">Could not delete: {deleteExpense.error.message}</StatusMessage>
          </div>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="num">Amount</th>
                <th>
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((expense) => (
                <tr key={expense.id}>
                  <td className={styles.date}>{formatDate(expense.expenseDate)}</td>
                  <td className={styles.description}>
                    <Link to={`/expenses/${expense.id}`}>{expense.description}</Link>
                  </td>
                  <td>
                    <CategoryLabel name={expense.categoryName} />
                  </td>
                  <td className={`num ${styles.amount}`}>{formatSar(expense.amount)}</td>
                  <td className={styles.actions}>
                    <Link
                      to={`/expenses/${expense.id}/edit`}
                      className={`btn ${styles.action}`}
                      aria-label={`Edit ${expense.description}`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className={`btn btn-danger ${styles.action}`}
                      aria-label={`Delete ${expense.description}`}
                      disabled={deleteExpense.isPending && deleteExpense.variables === expense.id}
                      onClick={() => {
                        if (!window.confirm(`Delete "${expense.description}"?`)) return;
                        deleteExpense.mutate(expense.id);
                      }}
                    >
                      {deleteExpense.isPending && deleteExpense.variables === expense.id
                        ? "Deleting…"
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ExpensePagination
          page={data.page}
          pageSize={data.pageSize}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          onChange={updateQuery}
        />
      </>
    );
  }

  return (
    <div className="stack">
      <PageHeader
        title="Expenses"
        actions={
          <Link to="/expenses/new" className="btn btn-accent">
            <Icon name="plus" />
            New expense
          </Link>
        }
      />

      <section className={styles.panel} aria-label="Expense list">
        <div className={styles.filters}>
          <ExpenseFilters query={query} onApply={updateQuery} onReset={resetQuery} />
        </div>
        <div className={styles.toolbar}>
          <ExpenseSortControls
            sortBy={query.sortBy}
            sortDirection={query.sortDirection}
            onChange={updateQuery}
          />
          {isFetching && !isPending && (
            <p className={styles.updating} role="status">
              Updating…
            </p>
          )}
        </div>
        {renderResults()}
      </section>
    </div>
  );
}

export default ExpensesPage;
