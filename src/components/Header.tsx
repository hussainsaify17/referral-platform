import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { getCategories } from "@/lib/cms";
import { MobileMenu } from "./MobileMenu";
import styles from "./Header.module.css";

export async function Header() {
  const categories = await getCategories();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.png" alt="ReferBenefits Logo" width={32} height={32} className={styles.logoImage} />
          Refer<span className={styles.accent}>Benefits</span>
        </Link>
        <div className={styles.navContainer}>
          <nav className={styles.nav}>
            {categories.slice(0, 4).map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`} className={styles.navLink}>
                {cat}
              </Link>
            ))}
            <Link href="mailto:submit@referbenefits.co.in" className={styles.submitBtnDesktop}>
              Submit a Code
            </Link>
          </nav>
          <ThemeToggle />
          <MobileMenu categories={categories} />
        </div>
      </div>
    </header>
  );
}
