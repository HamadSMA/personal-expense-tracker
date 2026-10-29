import type { ExpenseQuery } from "../../types/expense";
import { useCategories } from "./useCategories";

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
      <label>
        Search
        <input type="search" name="search" defaultValue={query.search ?? ""} />
      </label>

      <label>
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

      <label>
        From
        <input type="date" name="fromDate" defaultValue={query.fromDate ?? ""} />
      </label>

      <label>
        To
        <input type="date" name="toDate" defaultValue={query.toDate ?? ""} />
      </label>

      <label>
        Min (SAR)
        <input
          type="number"
          name="minAmount"
          min="0"
          step="0.01"
          defaultValue={query.minAmount?.toString() ?? ""}
        />
      </label>

      <label>
        Max (SAR)
        <input
          type="number"
          name="maxAmount"
          min="0"
          step="0.01"
          defaultValue={query.maxAmount?.toString() ?? ""}
        />
      </label>

      <button type="submit">Apply</button>
      <button type="button" onClick={onReset}>
        Clear
      </button>
    </form>
  );
}