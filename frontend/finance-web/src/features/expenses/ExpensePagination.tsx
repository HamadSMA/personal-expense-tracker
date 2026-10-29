import type { ExpenseQuery } from "../../types/expense";

type ExpensePaginationProps = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onChange: (changes: ExpenseQuery) => void;
};

const pageSizeOptions = [10, 20, 50, 100];

export default function ExpensePagination({
  page,
  pageSize,
  totalPages,
  totalCount,
  onChange,
}: ExpensePaginationProps) {
  const lastPage = Math.max(totalPages, 1);

  return (
    <div>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange({ page: page - 1 })}
      >
        Previous
      </button>

      <span>
        Page {page} of {lastPage} ({totalCount} expenses)
      </span>

      <button
        type="button"
        disabled={page >= lastPage}
        onClick={() => onChange({ page: page + 1 })}
      >
        Next
      </button>

      <label>
        Per page
        <select
          value={pageSize}
          onChange={(event) => onChange({ pageSize: Number(event.target.value) })}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}