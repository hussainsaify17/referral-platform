"use client";

import { ExternalLink } from "lucide-react";
import { trackClaimOffer } from "@/lib/analytics";
import styles from "@/app/[slug]/page.module.css";

interface Props {
  href: string;
  brandName: string;
  slug: string;
  category: string;
}

/**
 * The primary "Claim Offer via Link" CTA on the referral detail page.
 * Fires a GA4 `claim_referral_offer` event before navigating — this is
 * the main conversion we care about.
 */
export function ClaimOfferButton({ href, brandName, slug, category }: Props) {
  const handleClick = () => {
    trackClaimOffer(brandName, slug, category);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.primaryCta}
      onClick={handleClick}
    >
      Claim Offer via Link <ExternalLink size={18} />
    </a>
  );
}
