import { render, screen, waitFor } from "@testing-library/react";
import { useAuth } from "react-oidc-context";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RequireAuth } from "./RequireAuth";

vi.mock("react-oidc-context", () => ({
  useAuth: vi.fn(),
  hasAuthParams: vi.fn(() => false),
}));

type AuthState = ReturnType<typeof useAuth>;

function mockAuth(state: Partial<AuthState>) {
  const signinRedirect = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    activeNavigator: undefined,
    error: undefined,
    signinRedirect,
    ...state,
  } as unknown as AuthState);
  return signinRedirect;
}

function renderProtected() {
  const router = createMemoryRouter(
    [{ element: <RequireAuth />, children: [{ path: "/expenses", element: <p>Protected</p> }] }],
    { initialEntries: ["/expenses"] },
  );
  render(<RouterProvider router={router} />);
}

afterEach(() => {
  vi.clearAllMocks();
  window.history.pushState({}, "", "/");
});

describe("RequireAuth", () => {
  it("renders the child route when authenticated", () => {
    mockAuth({ isAuthenticated: true });
    renderProtected();
    expect(screen.getByText("Protected")).toBeInTheDocument();
  });

  it("shows signing in while loading and does not redirect", () => {
    const signinRedirect = mockAuth({ isLoading: true });
    renderProtected();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
    expect(signinRedirect).not.toHaveBeenCalled();
  });

  it("redirects to sign-in with the current URL as returnTo", async () => {
    window.history.pushState({}, "", "/expenses?page=2#top");
    const signinRedirect = mockAuth({});
    renderProtected();

    await waitFor(() =>
      expect(signinRedirect).toHaveBeenCalledWith({ state: { returnTo: "/expenses?page=2#top" } }),
    );
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("shows the sign-in error", () => {
    mockAuth({ error: new Error("boom") as AuthState["error"] });
    renderProtected();
    expect(screen.getByText(/sign-in failed/i)).toHaveTextContent("boom");
  });
});