import { createBrowserRouter } from "react-router";
import { RequireAuth } from "./auth/RequireAuth";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import ExpenseDetailPage from "./pages/ExpenseDetailPage";
import ExpenseFormPage from "./pages/ExpenseFormPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        handle: { crumb: "Dashboard" },
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: "expenses",
            handle: { crumb: "Expenses" },
            children: [
              { index: true, element: <ExpensesPage /> },
              { path: "new", element: <ExpenseFormPage />, handle: { crumb: "New expense" } },
              {
                path: ":id",
                handle: { crumb: "Expense" },
                children: [
                  { index: true, element: <ExpenseDetailPage /> },
                  { path: "edit", element: <ExpenseFormPage />, handle: { crumb: "Edit" } },
                ],
              },
            ],
          },
          { path: "*", element: <NotFoundPage />, handle: { crumb: "Not found" } },
        ],
      },
    ],
  },
]);
