import type { DateRange } from "../../types/dashboard";
import { formatSar } from "../../utils/formatSar";
import { useDashboardSummary } from "./useDashboard";

type SummaryCardsProps = {
  range: DateRange;
};

export default function SummaryCards({ range }: SummaryCardsProps) {
  const { data, isPending, isError, error } = useDashboardSummary(range);

  if (isPending) {
    return <p>Loading summary…</p>;
  }

  if (isError) {
    return <p role="alert">Could not load summary: {error.message}</p>;
  }

  if (data.expenseCount === 0) {
    return <p>No expenses in this range.</p>;
  }

  const cards = [
    { label: "Total spending", value: formatSar(data.totalSpending) },
    { label: "Number of expenses", value: data.expenseCount.toLocaleString() },
    { label: "Average expense", value: formatSar(data.averageExpense) },
    { label: "Largest expense", value: formatSar(data.largestExpense) },
  ];

  return (
    <section aria-label="Summary">
      {cards.map((card) => (
        <div key={card.label}>
          <h3>{card.label}</h3>
          <p>{card.value}</p>
        </div>
      ))}
    </section>
  );
}