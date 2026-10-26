import { Link } from "react-router";

function NotFoundPage() {
  return (
    <div>
      <h1>Page not found</h1>
      <Link to="/">Back to dashboard</Link>
    </div>
  );
}

export default NotFoundPage;