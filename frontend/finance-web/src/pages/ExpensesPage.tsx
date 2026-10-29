import { Link } from "react-router";
import { useExpenses } from "../features/expenses/useExpenses";
import { useExpenseQueryParams } from "../features/expenses/useExpenseQueryParams";
import ExpenseFilters from "../features/expenses/ExpenseFilters";
import ExpenseSortControls from "../features/expenses/ExpenseSortControls";
import ExpensePagination from "../features/expenses/ExpensePagination";

const sar = new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR" });

function ExpensesPage() {
  const { query, updateQuery, resetQuery } = useExpenseQueryParams();
  const { data, isPending, isError, error, isFetching } = useExpenses(query);

  const hasFilters =
    query.search !== undefined ||
    query.categoryId !== undefined ||
    query.fromDate !== undefined ||
    query.toDate !== undefined ||
    query.minAmount !== undefined ||
    query.maxAmount !== undefined;

  function renderResults() {
    if (isPending) {
      return <p>Loading…</p>;
    }

    if (isError) {
      return <p>Error: {error.message}</p>;
    }

    if (data.items.length === 0) {
      return <p>{hasFilters ? "No expenses match these filters." : "No expenses yet."}</p>;
    }

    return (
      <>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.expenseDate}</td>
                <td>
                  <Link to={`/expenses/${expense.id}`}>{expense.description}</Link>
                </td>
                <td>{expense.categoryName}</td>
                <td>{sar.format(expense.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div>
      <h1>Expenses</h1>
      <Link to="/expenses/new">New expense</Link>
      <ExpenseFilters query={query} onApply={updateQuery} onReset={resetQuery} />
      <ExpenseSortControls
        sortBy={query.sortBy}
        sortDirection={query.sortDirection}
        onChange={updateQuery}
      />
      {isFetching && !isPending && <p>Updating…</p>}
      {renderResults()}
    </div>
  );
}

export default ExpensesPage;