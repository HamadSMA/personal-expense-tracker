import { Link, useNavigate, useParams } from "react-router";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import ExpenseForm from "../features/expenses/ExpenseForm";
import { useCreateExpense, useUpdateExpense } from "../features/expenses/useExpenseMutations";
import { useExpense } from "../features/expenses/useExpenses";
import { ApiError } from "../services/apiClient";
import styles from "./ExpenseFormPage.module.css";

function CreateExpense() {
  const navigate = useNavigate();
  const createExpense = useCreateExpense();

  return (
    <>
      <PageHeader title="New expense" />
      <Card className={styles.card}>
        <ExpenseForm
          submitLabel="Create expense"
          cancelTo="/expenses"
          onSubmit={async (request) => {
            const created = await createExpense.mutateAsync(request);
            navigate(`/expenses/${created.id}`);
          }}
        />
      </Card>
    </>
  );
}

function EditExpense({ id }: { id: string }) {
  const navigate = useNavigate();
  const expense = useExpense(id);
  const updateExpense = useUpdateExpense(id);

  if (expense.isPending) {
    return <StatusMessage variant="loading">Loading…</StatusMessage>;
  }

  if (expense.isError) {
    if (expense.error instanceof ApiError && expense.error.status === 404) {
      return (
        <PageHeader
          title="Expense not found"
          actions={
            <Link to="/expenses" className="btn">
              Back to expenses
            </Link>
          }
        />
      );
    }
    return <StatusMessage variant="error">Error: {expense.error.message}</StatusMessage>;
  }

  const { data } = expense;

  return (
    <>
      <PageHeader title="Edit expense" />
      <Card className={styles.card}>
        <ExpenseForm
          key={data.id}
          submitLabel="Save changes"
          cancelTo={`/expenses/${id}`}
          initialValues={{
            categoryId: data.categoryId,
            amount: data.amount,
            description: data.description,
            expenseDate: data.expenseDate,
          }}
          onSubmit={async (request) => {
            await updateExpense.mutateAsync(request);
            navigate(`/expenses/${id}`);
          }}
        />
      </Card>
    </>
  );
}

function ExpenseFormPage() {
  const { id } = useParams();
  return id === undefined ? <CreateExpense /> : <EditExpense id={id} />;
}

export default ExpenseFormPage;
