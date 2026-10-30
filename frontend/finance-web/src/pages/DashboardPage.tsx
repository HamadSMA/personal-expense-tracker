import CategoryChart from "../features/dashboard/CategoryChart";
import DateRangePicker from "../features/dashboard/DateRangePicker";
import SpendingOverTimeChart from "../features/dashboard/SpendingOverTimeChart";
import SummaryCards from "../features/dashboard/SummaryCards";
import TopCategoriesChart from "../features/dashboard/TopCategoriesChart";
import TopExpensesList from "../features/dashboard/TopExpensesList";
import { useDashboardRange } from "../features/dashboard/useDashboardRange";

function DashboardPage() {
  const { preset, range, setPreset, setCustomRange } = useDashboardRange();

  return (
    <div>
      <h1>Dashboard</h1>
      <DateRangePicker
        preset={preset}
        range={range}
        onPresetChange={setPreset}
        onCustomChange={setCustomRange}
      />
      <p>
        {range.from ?? "Earliest"} – {range.to ?? "Latest"}
      </p>
      <SummaryCards range={range} />
      <CategoryChart range={range} />
      <SpendingOverTimeChart range={range} />
      <TopCategoriesChart range={range} />
      <TopExpensesList range={range} />
    </div>
  );
}

export default DashboardPage;