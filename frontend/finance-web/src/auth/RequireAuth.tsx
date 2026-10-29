import { useEffect } from "react";
import { Outlet } from "react-router";
import { hasAuthParams, useAuth } from "react-oidc-context";

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
    return <p>Sign-in failed: {error.message}</p>;
  }

  if (!isAuthenticated) {
    return <p>Signing in…</p>;
  }

  return <Outlet />;
}