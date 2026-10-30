import PageHeader from "../components/PageHeader";
import CategoryChart from "../features/dashboard/CategoryChart";
import DateRangePicker from "../features/dashboard/DateRangePicker";
import SpendingOverTimeChart from "../features/dashboard/SpendingOverTimeChart";
import SummaryCards from "../features/dashboard/SummaryCards";
import TopCategoriesChart from "../features/dashboard/TopCategoriesChart";
import TopExpensesList from "../features/dashboard/TopExpensesList";
import { useDashboardRange } from "../features/dashboard/useDashboardRange";
import { formatDate } from "../utils/formatDate";
import styles from "./DashboardPage.module.css";

function DashboardPage() {
  const { preset, range, setPreset, setCustomRange } = useDashboardRange();
  const from = range.from ? formatDate(range.from) : "Earliest";
  const to = range.to ? formatDate(range.to) : "Latest";

  return (
    <div className={`stack ${styles.page}`}>
      <PageHeader
        title="Dashboard"
        description={`${from} to ${to}`}
        actions={
          <DateRangePicker
            preset={preset}
            range={range}
            onPresetChange={setPreset}
            onCustomChange={setCustomRange}
          />
        }
      />
      <SummaryCards range={range} />
      <div className={styles.charts}>
        <div className={styles.wide}>
          <SpendingOverTimeChart range={range} />
        </div>
        <CategoryChart range={range} />
        <TopCategoriesChart range={range} />
        <div className={styles.wide}>
          <TopExpensesList range={range} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
