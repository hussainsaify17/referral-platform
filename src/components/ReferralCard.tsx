import Link from "next/link";
import { Referral } from "@/lib/types";
import styles from "./ReferralCard.module.css";

export function ReferralCard({ referral }: { referral: Referral }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.badge}>{referral.category}</div>
      </div>
      <h3 className={styles.title}>{referral.name}</h3>
      <p className={styles.benefit}>{referral.benefit_user}</p>
      
      <div className={styles.footer}>
        <Link href={`/${referral.slug}`} className={styles.button}>
          View Code & Steps
        </Link>
      </div>
    </div>
  );
}
