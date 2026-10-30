import type { ReactNode } from "react";
import styles from "./StatusMessage.module.css";

type StatusVariant = "loading" | "empty" | "error";

type StatusMessageProps = {
  variant: StatusVariant;
  children: ReactNode;
};

const roles: Record<StatusVariant, string | undefined> = {
  loading: "status",
  empty: undefined,
  error: "alert",
};

export default function StatusMessage({ variant, children }: StatusMessageProps) {
  return (
    <p className={`${styles.message} ${styles[variant]}`} role={roles[variant]}>
      {children}
    </p>
  );
}
