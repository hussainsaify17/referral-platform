import Link from "next/link";
import { Home, Compass } from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.glitchWrapper}>
        <h1 className={styles.errorCode}>404</h1>
      </div>
      <h2 className={styles.title}>Offer Not Found</h2>
      <p className={styles.description}>
        Looks like this referral code has expired or moved. Don't worry, there are plenty of other rewards waiting for you.
      </p>
      
      <div className={styles.buttonGroup}>
        <Link href="/" className={styles.primaryButton}>
          <Home size={18} />
          Back to Homepage
        </Link>
        <Link href="/category/fintech" className={styles.secondaryButton}>
          <Compass size={18} />
          Explore Top Offers
        </Link>
      </div>
    </div>
  );
}
