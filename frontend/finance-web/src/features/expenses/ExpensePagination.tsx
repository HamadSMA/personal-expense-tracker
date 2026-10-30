import type { ExpenseQuery } from "../../types/expense";
import styles from "./ExpensePagination.module.css";

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
  const first = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalCount);

  return (
    <div className={styles.pagination}>
      <span className={styles.summary}>
        {first}-{last} of {totalCount} expenses
      </span>

      <div className={styles.controls}>
        <label className={styles.size}>
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

        <div className={styles.pages}>
          <button
            type="button"
            className="btn"
            disabled={page <= 1}
            onClick={() => onChange({ page: page - 1 })}
          >
            Previous
          </button>

          <span className={styles.status}>
            Page {page} of {lastPage}
          </span>

          <button
            type="button"
            className="btn"
            disabled={page >= lastPage}
            onClick={() => onChange({ page: page + 1 })}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
