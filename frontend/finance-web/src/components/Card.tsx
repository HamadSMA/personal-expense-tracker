import type { ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = {
  title?: string;
  actions?: ReactNode;
  flush?: boolean;
  className?: string;
  children: ReactNode;
};

export default function Card({ title, actions, flush = false, className, children }: CardProps) {
  const classes = [styles.card, flush && styles.flush, className].filter(Boolean).join(" ");

  return (
    <section className={classes}>
      {(title || actions) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {actions}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
