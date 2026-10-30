import Icon from "../../components/Icon";
import type { ExpenseQuery } from "../../types/expense";
import { useCategories } from "./useCategories";
import styles from "./ExpenseFilters.module.css";

type ExpenseFiltersProps = {
  query: ExpenseQuery;
  onApply: (changes: ExpenseQuery) => void;
  onReset: () => void;
};

function readText(data: FormData, name: string): string | undefined {
  const value = data.get(name);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function readNumber(data: FormData, name: string): number | undefined {
  const text = readText(data, name);
  if (text === undefined) return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function ExpenseFilters({ query, onApply, onReset }: ExpenseFiltersProps) {
  const categories = useCategories();

  const formKey = [
    query.search,
    query.categoryId,
    query.fromDate,
    query.toDate,
    query.minAmount,
    query.maxAmount,
  ].join("|");

  return (
    <form
      key={formKey}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onApply({
          search: readText(data, "search"),
          categoryId: readNumber(data, "categoryId"),
          fromDate: readText(data, "fromDate"),
          toDate: readText(data, "toDate"),
          minAmount: readNumber(data, "minAmount"),
          maxAmount: readNumber(data, "maxAmount"),
        });
      }}
    >
      <label className={`${styles.field} ${styles.search}`}>
        Search
        <span className={styles.searchInput}>
          <Icon name="search" />
          <input
            type="search"
            name="search"
            placeholder="Description"
            defaultValue={query.search ?? ""}
          />
        </span>
      </label>

      <label className={styles.field}>
        Category
        <select name="categoryId" defaultValue={query.categoryId?.toString() ?? ""}>
          <option value="">All categories</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        From
        <input type="date" name="fromDate" defaultValue={query.fromDate ?? ""} />
      </label>

      <label className={styles.field}>
        To
        <input type="date" name="toDate" defaultValue={query.toDate ?? ""} />
      </label>

      <label className={`${styles.field} ${styles.amount}`}>
        Min (SAR)
        <input
          type="number"
          name="minAmount"
          min="0"
          step="0.01"
          defaultValue={query.minAmount?.toString() ?? ""}
        />
      </label>

      <label className={`${styles.field} ${styles.amount}`}>
        Max (SAR)
        <input
          type="number"
          name="maxAmount"
          min="0"
          step="0.01"
          defaultValue={query.maxAmount?.toString() ?? ""}
        />
      </label>

      <div className={styles.actions}>
        <button type="button" className="btn btn-ghost" onClick={onReset}>
          Clear
        </button>
        <button type="submit" className="btn">
          Apply
        </button>
      </div>
    </form>
  );
}
