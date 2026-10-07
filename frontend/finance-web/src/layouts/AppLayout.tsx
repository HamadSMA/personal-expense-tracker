import { NavLink, Outlet } from "react-router";

function AppLayout() {
  return (
    <div>
      <header>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>{" "}
          <NavLink to="/expenses">Expenses</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;