import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { ExpenseQuery, ExpenseSortBy, SortDirection } from "../../types/expense";

const sortByValues: readonly ExpenseSortBy[] = ["amount", "createdAt", "expenseDate"];
const sortDirectionValues: readonly SortDirection[] = ["asc", "desc"];

function toText(value: string | null): string | undefined {
  return value !== null && value.trim() !== "" ? value : undefined;
}

function toNumber(value: string | null): number | undefined {
  const text = toText(value);
  if (text === undefined) return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseQuery(params: URLSearchParams): ExpenseQuery {
  const sortBy = params.get("sortBy");
  const sortDirection = params.get("sortDirection");

  return {
    search: toText(params.get("search")),
    categoryId: toNumber(params.get("categoryId")),
    fromDate: toText(params.get("fromDate")),
    toDate: toText(params.get("toDate")),
    minAmount: toNumber(params.get("minAmount")),
    maxAmount: toNumber(params.get("maxAmount")),
    sortBy: sortByValues.find((value) => value === sortBy),
    sortDirection: sortDirectionValues.find((value) => value === sortDirection),
    page: toNumber(params.get("page")),
    pageSize: toNumber(params.get("pageSize")),
  };
}

function toSearchParams(query: ExpenseQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  return params;
}

export function useExpenseQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(() => parseQuery(searchParams), [searchParams]);

  const updateQuery = useCallback(
    (changes: ExpenseQuery) => {
      setSearchParams((current) =>
        toSearchParams({ ...parseQuery(current), page: undefined, ...changes }),
      );
    },
    [setSearchParams],
  );

  const resetQuery = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return { query, updateQuery, resetQuery };
}