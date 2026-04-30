"use client";

import Link from "next/link";
import { Referral } from "@/lib/types";
import { ArrowRight, Gift } from "lucide-react";
import { trackCardClick } from "@/lib/analytics";
import styles from "./ReferralCard.module.css";

interface Props {
  referral: Referral;
  /** 0-based position of this card in the list, used for analytics */
  position?: number;
}

export function ReferralCard({ referral, position = 0 }: Props) {
  // Match either a Rupee amount or a Percentage, picking the first one it finds
  const match = referral.benefit_user.match(/(₹\d+|\d+%)/);
  const highlightAmount = match ? match[1] : null;

  const handleClick = () => {
    trackCardClick(referral.name, referral.slug, referral.category, position);
  };

  return (
    <Link href={`/${referral.slug}`} className={styles.card} onClick={handleClick}>
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

