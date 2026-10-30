import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearStoredUser, getAccessToken } from "../auth/getAccessToken";
import { ApiError, apiRequest } from "./apiClient";

vi.mock("../auth/getAccessToken", () => ({
  getAccessToken: vi.fn(),
  clearStoredUser: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(getAccessToken).mockReturnValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("apiRequest", () => {
  it("calls the API base URL and skips empty query values", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await apiRequest("/api/expenses", { query: { page: 2, search: "", categoryId: undefined } });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url.startsWith("http://localhost:5048/api/expenses")).toBe(true);
    expect(url).toContain("page=2");
    expect(url).not.toContain("search");
    expect(url).not.toContain("categoryId");
  });

  it("sends a bearer token when one exists", async () => {
    vi.mocked(getAccessToken).mockReturnValue("token-123");
    fetchMock.mockResolvedValue(jsonResponse([]));

    await apiRequest("/api/expenses");

    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("sends JSON with Content-Type when there is a body", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "1" }, 201));

    await apiRequest("/api/expenses", { method: "POST", body: { amount: 10 } });

    const init = fetchMock.mock.calls[0][1];
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(init?.body).toBe(JSON.stringify({ amount: 10 }));
  });

  it("returns undefined for 204", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiRequest("/api/expenses/1", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("throws ApiError with ProblemDetails for non-2xx", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: "Not Found", status: 404 }, 404));

    const error = await apiRequest("/api/expenses/1").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, problem: { title: "Not Found" } });
  });

  it("clears the stored user on 401", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    void apiRequest("/api/expenses").catch(() => undefined);

    await vi.waitFor(() => expect(clearStoredUser).toHaveBeenCalled());
  });
});