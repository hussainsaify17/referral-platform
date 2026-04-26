import Link from "next/link";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          Referral<span className={styles.accent}>Hub</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/category/fintech" className={styles.navLink}>Fintech</Link>
          <Link href="/category/travel" className={styles.navLink}>Travel</Link>
          <Link href="/category/shopping" className={styles.navLink}>Shopping</Link>
        </nav>
      </div>
    </header>
  );
}
