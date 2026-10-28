import type { ProblemDetails } from "../types/api";
import { clearStoredUser, getAccessToken } from "../auth/getAccessToken";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Thrown for any non-2xx response; carries the status and ProblemDetails body.
export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails | null;

  constructor(status: number, problem: ProblemDetails | null) {
    super(problem?.title ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

// Options for a single request. Empty query values are skipped.
type QueryValue = string | number | null | undefined;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

// Sends a JSON request to the API and returns the parsed response.
export async function apiRequest<T>(
  path: string,
  { method = "GET", body, query, signal }: RequestOptions = {},
): Promise<T> {
  const url = new URL(path, baseUrl);

  // Build the query string, skipping empty values.
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined && value !== "") {
        url.searchParams.append(key, String(value));
      }
    }
  }

  // Only send Content-Type when there is a body.
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  // Attach the access token when signed in.
  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  // Session no longer valid: clear it and reload so RequireAuth signs in again.
  if (response.status === 401) {
    clearStoredUser();
    window.location.reload();
  }

  // Turn error responses into ApiError, reading ProblemDetails if the body is JSON.
  if (!response.ok) {
    let problem: ProblemDetails | null = null;
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("json")) {
      problem = (await response.json()) as ProblemDetails;
    }
    throw new ApiError(response.status, problem);
  }

  // 204 No Content has no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}