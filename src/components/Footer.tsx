import Link from "next/link";
import styles from "./Footer.module.css";
import { getCategories, getAllReferrals } from "@/lib/cms";

export async function Footer() {
  const categories = await getCategories();
  const allReferrals = await getAllReferrals();
  // Get 4 top offers (just using the first 4 for simplicity)
  const topOffers = allReferrals.slice(0, 4);
  
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.info}>
          <div className={styles.logo}>
            Refer<span className={styles.accent}>Benefits</span>
          </div>
          <p className={styles.description}>
            Find the best referral codes, sign-up bonuses, and invite links for top Indian apps. Maximize your rewards with our verified codes.
          </p>
        </div>
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Categories</h3>
            {categories.slice(0, 5).map(cat => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`} className={styles.link}>
                {cat}
              </Link>
            ))}
          </div>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Top Offers</h3>
            {topOffers.map(offer => (
              <Link key={offer.id} href={`/${offer.slug}`} className={styles.link}>
                {offer.name}
              </Link>
            ))}
          </div>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Company</h3>
            <Link href="/blog" className={styles.link}>Blog</Link>
            <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
            <Link href="/terms" className={styles.link}>Terms of Service</Link>
            <Link href="mailto:hello@referbenefits.co.in" className={styles.link}>Contact Us</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p className={styles.copyright}>© {new Date().getFullYear()} ReferBenefits. All rights reserved.</p>
      </div>
    </footer>
  );
}
