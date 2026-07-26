import Link from "next/link";
import { getActiveReferrals } from "@/lib/cms";
import styles from "./RelatedLinks.module.css";

export async function RelatedLinks({ currentSlug, category }: { currentSlug: string; category: string }) {
  const allReferrals = await getActiveReferrals();
  
  // Find up to 4 related referrals in the same category (excluding current)
  const related = allReferrals
    .filter(r => r.category === category && r.slug !== currentSlug)
    .slice(0, 4);
    
  // Priority high-value offers to ensure link equity reaches unindexed core finance offers
  const prioritySlugs = ["cred-referral-code", "jupiter-money-invite", "google-pay-referral", "upstox-referral-code", "slice-invite", "zerodha-referral-code", "zomato-promo-code", "ajio-invite-code"];

  // Add priority offers first if not already present
  for (const prioritySlug of prioritySlugs) {
    if (related.length >= 6) break;
    if (prioritySlug !== currentSlug && !related.some(r => r.slug === prioritySlug)) {
      const match = allReferrals.find(r => r.slug === prioritySlug);
      if (match) related.push(match);
    }
  }

  // Fallback to remaining referrals if still under 6
  if (related.length < 6) {
    const fallback = allReferrals
      .filter(r => r.slug !== currentSlug && !related.some(req => req.slug === r.slug))
      .slice(0, 6 - related.length);
    related.push(...fallback);
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Top Verified Offers & Invite Links</h3>
      <div className={styles.links}>
        {related.map(r => (
          <Link key={r.id} href={`/${r.slug}/`} className={styles.link}>
            {r.name} Referral Bonus ({r.bonus_amount ? `Get ${r.bonus_amount}` : "Verified Code"})
          </Link>
        ))}
      </div>
    </div>
  );
}
