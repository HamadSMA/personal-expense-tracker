import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Card from "../../components/Card";
import StatusMessage from "../../components/StatusMessage";
import type { DateRange } from "../../types/dashboard";
import { getCategoryColor } from "../../utils/categoryColors";
import { formatSar } from "../../utils/formatSar";
import { tooltipContentStyle, tooltipItemStyle, tooltipLabelStyle } from "./chartStyles";
import { useSpendingByCategory } from "./useDashboard";
import styles from "./CategoryChart.module.css";

type CategoryChartProps = {
  range: DateRange;
};

export default function CategoryChart({ range }: CategoryChartProps) {
  const { data, isPending, isError, error } = useSpendingByCategory(range);

  function renderContent() {
    if (isPending) {
      return <StatusMessage variant="loading">Loading…</StatusMessage>;
    }

    if (isError) {
      return <StatusMessage variant="error">Could not load categories: {error.message}</StatusMessage>;
    }

    if (data.length === 0) {
      return <StatusMessage variant="empty">No spending in this range.</StatusMessage>;
    }

    return (
      <div className={styles.layout}>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                innerRadius={54}
                outerRadius={76}
                paddingAngle={1.5}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((item) => (
                  <Cell key={item.category} fill={getCategoryColor(item.category)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                formatter={(value) => (typeof value === "number" ? formatSar(value) : value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className={styles.legend}>
          {data.map((item) => (
            <li key={item.category} className={styles.item}>
              <span
                className={styles.swatch}
                style={{ background: getCategoryColor(item.category) }}
                aria-hidden="true"
              />
              <span className={styles.name}>{item.category}</span>
              <span className={styles.percentage}>{item.percentage}%</span>
              <span className={styles.amount}>{formatSar(item.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <Card title="Spending by category">{renderContent()}</Card>;
}
