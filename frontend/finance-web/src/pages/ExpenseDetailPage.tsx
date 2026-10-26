import { useParams } from "react-router";

function ExpenseDetailPage() {
  const { id } = useParams();

  return <h1>Expense {id}</h1>;
}

export default ExpenseDetailPage;