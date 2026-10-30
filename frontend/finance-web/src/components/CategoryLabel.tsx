import { getCategoryColor } from "../utils/categoryColors";
import styles from "./CategoryLabel.module.css";

type CategoryLabelProps = {
  name: string;
};

export default function CategoryLabel({ name }: CategoryLabelProps) {
  return (
    <span className={styles.label}>
      <span className={styles.dot} style={{ background: getCategoryColor(name) }} aria-hidden="true" />
      {name}
    </span>
  );
}
