import { useEffect } from "react";
import { Outlet } from "react-router";
import { hasAuthParams, useAuth } from "react-oidc-context";
import StatusMessage from "../components/StatusMessage";
import styles from "./RequireAuth.module.css";

export function RequireAuth() {
  const auth = useAuth();
  const { isAuthenticated, isLoading, activeNavigator, error, signinRedirect } = auth;

  useEffect(() => {
    if (!hasAuthParams() && !isAuthenticated && !isLoading && !activeNavigator && !error) {
      const { pathname, search, hash } = window.location;
      void signinRedirect({ state: { returnTo: pathname + search + hash } });
    }
  }, [isAuthenticated, isLoading, activeNavigator, error, signinRedirect]);

  if (error) {
    return (
      <div className={styles.screen}>
        <div className={styles.panel}>
          <p className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              E
            </span>
            Expense Tracker
          </p>
          <StatusMessage variant="error">Sign-in failed: {error.message}</StatusMessage>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.screen}>
        <div className={styles.panel}>
          <p className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              E
            </span>
            Expense Tracker
          </p>
          <StatusMessage variant="loading">Signing in…</StatusMessage>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
