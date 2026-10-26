import { createBrowserRouter } from "react-router";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import ExpenseDetailPage from "./pages/ExpenseDetailPage";
import ExpenseFormPage from "./pages/ExpenseFormPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "expenses", element: <ExpensesPage /> },
      { path: "expenses/new", element: <ExpenseFormPage /> },
      { path: "expenses/:id", element: <ExpenseDetailPage /> },
      { path: "expenses/:id/edit", element: <ExpenseFormPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);