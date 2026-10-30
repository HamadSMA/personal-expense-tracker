import type { ReactNode } from "react";
import StatusMessage from "../../components/StatusMessage";
import type { DateRange } from "../../types/dashboard";
import { formatSar } from "../../utils/formatSar";
import { useDashboardSummary } from "./useDashboard";
import styles from "./SummaryCards.module.css";

type SummaryCardsProps = {
  range: DateRange;
};

function Strip({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Summary" className={styles.strip}>
      {children}
    </section>
  );
}

export default function SummaryCards({ range }: SummaryCardsProps) {
  const { data, isPending, isError, error } = useDashboardSummary(range);

  if (isPending) {
    return (
      <Strip>
        <div className={styles.state}>
          <StatusMessage variant="loading">Loading summary…</StatusMessage>
        </div>
      </Strip>
    );
  }

  if (isError) {
    return (
      <Strip>
        <div className={styles.state}>
          <StatusMessage variant="error">Could not load summary: {error.message}</StatusMessage>
        </div>
      </Strip>
    );
  }

  if (data.expenseCount === 0) {
    return (
      <Strip>
        <StatusMessage variant="empty">No expenses in this range.</StatusMessage>
      </Strip>
    );
  }

  const stats = [
    { label: "Total spending", value: formatSar(data.totalSpending) },
    { label: "Expenses", value: data.expenseCount.toLocaleString() },
    { label: "Average expense", value: formatSar(data.averageExpense) },
    { label: "Largest expense", value: formatSar(data.largestExpense) },
  ];

  return (
    <Strip>
      <dl className={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <dt className={styles.label}>{stat.label}</dt>
            <dd className={styles.value}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </Strip>
  );
}
