import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { getCategories } from "@/lib/cms";
import styles from "./Header.module.css";

export async function Header() {
  const categories = await getCategories();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          Refer<span className={styles.accent}>Benefits</span>
        </Link>
        <div className={styles.navContainer}>
          <nav className={styles.nav}>
            {categories.slice(0, 4).map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`} className={styles.navLink}>
                {cat}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
