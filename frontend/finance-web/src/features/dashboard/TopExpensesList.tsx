import { Link } from "react-router";
import type { DateRange } from "../../types/dashboard";
import { formatSar } from "../../utils/formatSar";
import { useTopExpenses } from "./useDashboard";

type TopExpensesListProps = {
  range: DateRange;
};

export default function TopExpensesList({ range }: TopExpensesListProps) {
  const { data, isPending, isError, error } = useTopExpenses(range);

  function renderContent() {
    if (isPending) {
      return <p>Loading…</p>;
    }

    if (isError) {
      return <p role="alert">Could not load top expenses: {error.message}</p>;
    }

    if (data.length === 0) {
      return <p>No expenses in this range.</p>;
    }

    return (
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
          {data.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.expenseDate}</td>
              <td>
                <Link to={`/expenses/${expense.id}`}>{expense.description}</Link>
              </td>
              <td>{expense.category}</td>
              <td>{formatSar(expense.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <section>
      <h2>Top expenses</h2>
      {renderContent()}
    </section>
  );
}