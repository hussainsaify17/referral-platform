import Link from "next/link";
import { getAllReferrals } from "@/lib/cms";
import styles from "./RelatedLinks.module.css";

export async function RelatedLinks({ currentSlug, category }: { currentSlug: string; category: string }) {
  const allReferrals = await getAllReferrals();
  
  // Find 3 related referrals (same category, not current one)
  const related = allReferrals
    .filter(r => r.category === category && r.slug !== currentSlug)
    .slice(0, 3);
    
  // Fallback to random referrals if we don't have enough in the category
  if (related.length < 3) {
    const fallback = allReferrals
      .filter(r => r.slug !== currentSlug && !related.find(req => req.slug === r.slug))
      .slice(0, 3 - related.length);
    related.push(...fallback);
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Related Offers You Might Like</h3>
      <div className={styles.links}>
        {related.map(r => (
          <Link key={r.id} href={`/${r.slug}`} className={styles.link}>
            {r.name} Referral Bonus
          </Link>
        ))}
      </div>
    </div>
  );
}
