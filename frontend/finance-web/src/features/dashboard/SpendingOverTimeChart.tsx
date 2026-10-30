import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../components/Card";
import StatusMessage from "../../components/StatusMessage";
import type { DailySpending, DateRange } from "../../types/dashboard";
import { formatSar } from "../../utils/formatSar";
import {
  axisTick,
  chartPrimaryColor,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "./chartStyles";
import { useSpendingOverTime } from "./useDashboard";

type Granularity = "daily" | "weekly" | "monthly";

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function getGranularity(range: DateRange, points: DailySpending[]): Granularity {
  const from = range.from ?? points[0].date;
  const to = range.to ?? points[points.length - 1].date;
  const days = (parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000 + 1;
  if (days <= 31) return "daily";
  if (days <= 120) return "weekly";
  return "monthly";
}

function formatBucket(date: string, granularity: Granularity): string {
  const parsed = parseDate(date);
  if (granularity === "monthly") return monthFormat.format(parsed);
  if (granularity === "weekly") return `Week of ${dayFormat.format(parsed)}`;
  return dayFormat.format(parsed);
}

type SpendingOverTimeChartProps = {
  range: DateRange;
};

export default function SpendingOverTimeChart({ range }: SpendingOverTimeChartProps) {
  const { data, isPending, isError, error } = useSpendingOverTime(range);

  function renderContent() {
    if (isPending) {
      return <StatusMessage variant="loading">Loading…</StatusMessage>;
    }

    if (isError) {
      return (
        <StatusMessage variant="error">Could not load spending over time: {error.message}</StatusMessage>
      );
    }

    if (data.length === 0) {
      return <StatusMessage variant="empty">No spending in this range.</StatusMessage>;
    }

    const points = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const granularity = getGranularity(range, points);

    return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(value) => formatBucket(String(value), granularity)}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            width={48}
            tickFormatter={(value) => Number(value).toLocaleString("en-US", { notation: "compact" })}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-border-strong)" }}
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            labelFormatter={(label) => formatBucket(String(label), granularity)}
            formatter={(value) => (typeof value === "number" ? formatSar(value) : value)}
          />
          <Line
            type="monotone"
            dataKey="amount"
            name="Spending"
            stroke={chartPrimaryColor}
            strokeWidth={1.75}
            dot={points.length <= 31 ? { r: 2, strokeWidth: 0, fill: chartPrimaryColor } : false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return <Card title="Spending over time">{renderContent()}</Card>;
}
