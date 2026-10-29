import type { ExpenseQuery, ExpenseSortBy, SortDirection } from "../../types/expense";

type ExpenseSortControlsProps = {
  sortBy: ExpenseSortBy | undefined;
  sortDirection: SortDirection | undefined;
  onChange: (changes: ExpenseQuery) => void;
};

const sortOptions: { value: ExpenseSortBy; label: string }[] = [
  { value: "expenseDate", label: "Expense date" },
  { value: "amount", label: "Amount" },
  { value: "createdAt", label: "Created date" },
];

const directionOptions: { value: SortDirection; label: string }[] = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

export default function ExpenseSortControls({
  sortBy,
  sortDirection,
  onChange,
}: ExpenseSortControlsProps) {
  return (
    <div>
      <label>
        Sort by
        <select
          value={sortBy ?? "expenseDate"}
          onChange={(event) => {
            const value = sortOptions.find((option) => option.value === event.target.value);
            onChange({ sortBy: value?.value });
          }}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Direction
        <select
          value={sortDirection ?? "desc"}
          onChange={(event) => {
            const value = directionOptions.find((option) => option.value === event.target.value);
            onChange({ sortDirection: value?.value });
          }}
        >
          {directionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}