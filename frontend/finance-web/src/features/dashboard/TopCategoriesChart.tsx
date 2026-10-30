import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/Card";
import StatusMessage from "../../components/StatusMessage";
import type { DateRange } from "../../types/dashboard";
import { getCategoryColor } from "../../utils/categoryColors";
import { formatSar } from "../../utils/formatSar";
import { axisTick, tooltipContentStyle, tooltipItemStyle, tooltipLabelStyle } from "./chartStyles";
import { useSpendingByCategory } from "./useDashboard";

const maxCategories = 5;

type TopCategoriesChartProps = {
  range: DateRange;
};

export default function TopCategoriesChart({ range }: TopCategoriesChartProps) {
  const { data, isPending, isError, error } = useSpendingByCategory(range);

  function renderContent() {
    if (isPending) {
      return <StatusMessage variant="loading">Loading…</StatusMessage>;
    }

    if (isError) {
      return <StatusMessage variant="error">Could not load top categories: {error.message}</StatusMessage>;
    }

    if (data.length === 0) {
      return <StatusMessage variant="empty">No spending in this range.</StatusMessage>;
    }

    const top = data.slice(0, maxCategories);

    return (
      <ResponsiveContainer width="100%" height={top.length * 36 + 28}>
        <BarChart data={top} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            tickFormatter={(value) => Number(value).toLocaleString("en-US", { notation: "compact" })}
          />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ ...axisTick, fill: "#6e6d69", fontSize: 12 }}
            width={96}
          />
          <Tooltip
            cursor={{ fill: "var(--color-surface-muted)" }}
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            formatter={(value) => (typeof value === "number" ? formatSar(value) : value)}
          />
          <Bar dataKey="amount" name="Spending" radius={[0, 3, 3, 0]} barSize={14} isAnimationActive={false}>
            {top.map((item) => (
              <Cell key={item.category} fill={getCategoryColor(item.category)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return <Card title="Top categories">{renderContent()}</Card>;
}
