import Link from "next/link";
import styles from "./Footer.module.css";

import { getCategories } from "@/lib/cms";

export async function Footer() {
  const categories = await getCategories();
  
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.info}>
          <div className={styles.logo}>
            Referral<span className={styles.accent}>Buddy</span>
          </div>
          <p className={styles.description}>
            Find the best referral codes, sign-up bonuses, and invite links. Updated daily for maximum rewards.
          </p>
        </div>
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Categories</h3>
            {categories.slice(0, 4).map(cat => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`} className={styles.link}>
                {cat}
              </Link>
            ))}
          </div>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Legal</h3>
            <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
            <Link href="/terms" className={styles.link}>Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p className={styles.copyright}>© {new Date().getFullYear()} ReferBenefits. All rights reserved.</p>
      </div>
    </footer>
  );
}
