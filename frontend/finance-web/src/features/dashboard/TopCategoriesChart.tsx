import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DateRange } from "../../types/dashboard";
import { formatSar } from "../../utils/formatSar";
import { useSpendingByCategory } from "./useDashboard";

const maxCategories = 5;

type TopCategoriesChartProps = {
  range: DateRange;
};

export default function TopCategoriesChart({ range }: TopCategoriesChartProps) {
  const { data, isPending, isError, error } = useSpendingByCategory(range);

  function renderContent() {
    if (isPending) {
      return <p>Loading…</p>;
    }

    if (isError) {
      return <p role="alert">Could not load top categories: {error.message}</p>;
    }

    if (data.length === 0) {
      return <p>No spending in this range.</p>;
    }

    const top = data.slice(0, maxCategories);

    return (
      <ResponsiveContainer width="100%" height={top.length * 50 + 40}>
        <BarChart data={top} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => Number(value).toLocaleString("en-US", { notation: "compact" })}
          />
          <YAxis type="category" dataKey="category" width={100} />
          <Tooltip formatter={(value) => (typeof value === "number" ? formatSar(value) : value)} />
          <Bar dataKey="amount" name="Spending" fill="#4e79a7" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <section>
      <h2>Top categories</h2>
      {renderContent()}
    </section>
  );
}