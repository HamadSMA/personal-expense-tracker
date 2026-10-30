import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DateRange } from "../../types/dashboard";
import { formatSar } from "../../utils/formatSar";
import { useSpendingByCategory } from "./useDashboard";

const categoryColors: Record<string, string> = {
  Food: "#4e79a7",
  Transport: "#f28e2b",
  Housing: "#e15759",
  Shopping: "#76b7b2",
  Entertainment: "#59a14f",
  Bills: "#edc948",
  Healthcare: "#b07aa1",
  Travel: "#ff9da7",
  Other: "#9c755f",
};

type CategoryChartProps = {
  range: DateRange;
};

export default function CategoryChart({ range }: CategoryChartProps) {
  const { data, isPending, isError, error } = useSpendingByCategory(range);

  return (
    <section>
      <h2>Spending by category</h2>
      {isPending ? (
        <p>Loading…</p>
      ) : isError ? (
        <p role="alert">Could not load categories: {error.message}</p>
      ) : data.length === 0 ? (
        <p>No spending in this range.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                innerRadius={60}
                outerRadius={100}
              >
                {data.map((item) => (
                  <Cell key={item.category} fill={categoryColors[item.category] ?? "#bab0ac"} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => (typeof value === "number" ? formatSar(value) : value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <ul>
            {data.map((item) => (
              <li key={item.category}>
                {item.category}: {formatSar(item.amount)} ({item.percentage}%)
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}