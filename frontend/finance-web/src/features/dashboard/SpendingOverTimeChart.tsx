import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailySpending, DateRange } from "../../types/dashboard";
import { formatSar } from "../../utils/formatSar";
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
      return <p>Loading…</p>;
    }

    if (isError) {
      return <p role="alert">Could not load spending over time: {error.message}</p>;
    }

    if (data.length === 0) {
      return <p>No spending in this range.</p>;
    }

    const points = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const granularity = getGranularity(range, points);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={points}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(value) => formatBucket(String(value), granularity)} />
          <YAxis
            tickFormatter={(value) =>
              Number(value).toLocaleString("en-US", { notation: "compact" })
            }
          />
          <Tooltip
            labelFormatter={(label) => formatBucket(String(label), granularity)}
            formatter={(value) => (typeof value === "number" ? formatSar(value) : value)}
          />
          <Line type="monotone" dataKey="amount" name="Spending" stroke="#4e79a7" dot={points.length < 40} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <section>
      <h2>Spending over time</h2>
      {renderContent()}
    </section>
  );
}