import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";

type RenderOptions = {
  path?: string;
  url?: string;
};

export function renderWithProviders(element: ReactElement, { path = "/", url = "/" }: RenderOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const router = createMemoryRouter(
    [
      { path, element },
      { path: "*", element: <p>Other page</p> },
    ],
    { initialEntries: [url] },
  );

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { ...result, router, queryClient };
}