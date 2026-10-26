import { useParams } from "react-router";

function ExpenseFormPage() {
  const { id } = useParams();
  const isEdit = id !== undefined;

  return <h1>{isEdit ? `Edit expense ${id}` : "New expense"}</h1>;
}

export default ExpenseFormPage;