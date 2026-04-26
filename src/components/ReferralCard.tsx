import Link from "next/link";
import { Referral } from "@/lib/types";
import { ArrowRight, Gift } from "lucide-react";
import styles from "./ReferralCard.module.css";

interface Props {
  referral: Referral;
}

export function ReferralCard({ referral }: Props) {
  // Try to extract the monetary value from benefit_user (e.g. ₹500, ₹100, etc.) for a premium highlight
  const match = referral.benefit_user.match(/(₹\d+)/);
  const highlightAmount = match ? match[1] : null;

  return (
    <Link href={`/${referral.slug}`} className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.category}>{referral.category}</span>
          <h3 className={styles.name}>{referral.name}</h3>
        </div>
        {highlightAmount && (
          <div className={styles.bonusPill}>
            {highlightAmount} Bonus
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <div className={styles.benefitBox}>
          <Gift size={16} className={styles.benefitIcon} />
          <p className={styles.benefit}>{referral.benefit_user}</p>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.cta}>
          View Offer Details <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
