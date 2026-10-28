import { NavLink, Outlet } from "react-router";
import { useAuth } from "react-oidc-context";

function AppLayout() {
  const auth = useAuth();

  return (
    <div>
      <header>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>{" "}
          <NavLink to="/expenses">Expenses</NavLink>
        </nav>
        <div>
          <span>{auth.user?.profile.email}</span>{" "}
          <button type="button" onClick={() => void auth.signoutRedirect()}>
            Log out
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;