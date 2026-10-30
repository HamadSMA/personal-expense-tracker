import { Link, useMatches } from "react-router";
import styles from "./Breadcrumbs.module.css";

type CrumbHandle = { crumb: string };

function hasCrumb(handle: unknown): handle is CrumbHandle {
  return (
    typeof handle === "object" &&
    handle !== null &&
    "crumb" in handle &&
    typeof handle.crumb === "string"
  );
}

export default function Breadcrumbs() {
  const matches = useMatches();

  const crumbs = matches.flatMap((match) =>
    hasCrumb(match.handle) ? [{ id: match.id, label: match.handle.crumb, to: match.pathname }] : [],
  );

  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.list}>
        {crumbs.map((crumb, index) => (
          <li key={crumb.id} className={styles.item}>
            {index === crumbs.length - 1 ? (
              <span className={styles.current} aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.to}>{crumb.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
