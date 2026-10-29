import { Link, useNavigate, useParams } from "react-router";
import ExpenseForm from "../features/expenses/ExpenseForm";
import { useCreateExpense, useUpdateExpense } from "../features/expenses/useExpenseMutations";
import { useExpense } from "../features/expenses/useExpenses";
import { ApiError } from "../services/apiClient";

function CreateExpense() {
  const navigate = useNavigate();
  const createExpense = useCreateExpense();

  return (
    <>
      <h1>New expense</h1>
      <ExpenseForm
        submitLabel="Create expense"
        onSubmit={async (request) => {
          const created = await createExpense.mutateAsync(request);
          navigate(`/expenses/${created.id}`);
        }}
      />
      <Link to="/expenses">Cancel</Link>
    </>
  );
}

function EditExpense({ id }: { id: string }) {
  const navigate = useNavigate();
  const expense = useExpense(id);
  const updateExpense = useUpdateExpense(id);

  if (expense.isPending) {
    return <p>Loading…</p>;
  }

  if (expense.isError) {
    if (expense.error instanceof ApiError && expense.error.status === 404) {
      return (
        <>
          <h1>Expense not found</h1>
          <Link to="/expenses">Back to expenses</Link>
        </>
      );
    }
    return <p role="alert">Error: {expense.error.message}</p>;
  }

  const { data } = expense;

  return (
    <>
      <h1>Edit expense</h1>
      <ExpenseForm
        key={data.id}
        submitLabel="Save changes"
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
      <Link to={`/expenses/${id}`}>Cancel</Link>
    </>
  );
}

function ExpenseFormPage() {
  const { id } = useParams();
  return id === undefined ? <CreateExpense /> : <EditExpense id={id} />;
}

export default ExpenseFormPage;