import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          Referral<span className={styles.accent}>Buddy</span>
        </Link>
        <div className={styles.navContainer}>
          <nav className={styles.nav}>
            <Link href="/category/fintech" className={styles.navLink}>Fintech</Link>
            <Link href="/category/investing" className={styles.navLink}>Investing</Link>
            <Link href="/category/food" className={styles.navLink}>Food</Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
