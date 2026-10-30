import { Link } from "react-router";
import Card from "../../components/Card";
import CategoryLabel from "../../components/CategoryLabel";
import StatusMessage from "../../components/StatusMessage";
import type { DateRange } from "../../types/dashboard";
import { formatDate } from "../../utils/formatDate";
import { formatSar } from "../../utils/formatSar";
import { useTopExpenses } from "./useDashboard";
import styles from "./TopExpensesList.module.css";

type TopExpensesListProps = {
  range: DateRange;
};

export default function TopExpensesList({ range }: TopExpensesListProps) {
  const { data, isPending, isError, error } = useTopExpenses(range);

  function renderContent() {
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
          <StatusMessage variant="error">Could not load top expenses: {error.message}</StatusMessage>
        </div>
      );
    }

    if (data.length === 0) {
      return <StatusMessage variant="empty">No expenses in this range.</StatusMessage>;
    }

    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((expense) => (
              <tr key={expense.id}>
                <td className={styles.date}>{formatDate(expense.expenseDate)}</td>
                <td>
                  <Link to={`/expenses/${expense.id}`}>{expense.description}</Link>
                </td>
                <td>
                  <CategoryLabel name={expense.category} />
                </td>
                <td className={`num ${styles.amount}`}>{formatSar(expense.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Card title="Top expenses" flush>
      {renderContent()}
    </Card>
  );
}
