import { Link } from "react-router";
import styles from "./NotFoundPage.module.css";

function NotFoundPage() {
  return (
    <div className={styles.content}>
      <p className={styles.code}>404</p>
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn">
        Back to dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
