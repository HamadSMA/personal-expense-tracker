import { Link, NavLink, Outlet } from "react-router";
import { useAuth } from "react-oidc-context";
import Breadcrumbs from "../components/Breadcrumbs";
import styles from "./AppLayout.module.css";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;
}

function AppLayout() {
  const auth = useAuth();
  const email = auth.user?.profile.email;
  const year = new Date().getFullYear();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              E
            </span>
            <span className={styles.brandName}>Expense Tracker</span>
          </Link>

          <nav aria-label="Main" className={styles.nav}>
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/expenses" className={navLinkClass}>
              Expenses
            </NavLink>
          </nav>

          <div className={styles.user}>
            {email && (
              <span className={styles.email} title={email}>
                {email}
              </span>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => void auth.signoutRedirect()}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Breadcrumbs />
        <div className="stack">
          <Outlet />
        </div>
      </main>

      <footer className={styles.footer}>
        <span>© {year} Expense Tracker</span>
        <a href="https://github.com/HamadSMA" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>
    </div>
  );
}

export default AppLayout;
