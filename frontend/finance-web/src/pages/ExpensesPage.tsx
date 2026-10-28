import { Link } from "react-router";
import { useExpenses } from "../features/expenses/useExpenses";

const sar = new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR" });

function ExpensesPage() {
  const { data, isPending, isError, error } = useExpenses();

  if (isPending) {
    return <p>Loading…</p>;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
  }

  if (data.items.length === 0) {
    return <p>No expenses yet.</p>;
  }

  return (
    <div>
      <h1>Expenses</h1>
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
      <p>
        Page {data.page} of {data.totalPages} ({data.totalCount} expenses)
      </p>
    </div>
  );
}

export default ExpensesPage;