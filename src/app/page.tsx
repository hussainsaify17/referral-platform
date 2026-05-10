import { getAllReferrals, getCategories } from "@/lib/cms";
import { ReferralCard } from "@/components/ReferralCard";
import { CategoryNav } from "@/components/CategoryNav";
import { OfferExplorer } from "@/components/OfferExplorer";
import { Sparkles, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "ReferBenefits | India's Best Sign Up Bonuses & Referral Codes",
  description: "Find verified referral codes, invite links, and sign-up bonuses to earn extra cash.",
};

export default async function Home() {
  const referrals = await getAllReferrals();
  const categories = await getCategories();

  const sortedReferrals = [...referrals].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  // Featured = first item (now properly sorted to favor is_featured: true)
  const featured = sortedReferrals[0];
  const restReferrals = sortedReferrals.slice(1, 7);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ReferBenefits",
    url: "https://referbenefits.co.in",
    description: "Find the latest and verified referral codes, sign-up bonuses, and invite links for top Indian apps.",
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles size={16} className={styles.badgeIcon} />
          <span>Updated today with {referrals.length} active offers</span>
        </div>
        <h1 className={styles.title}>
          Stop Leaving Money on the Table
        </h1>
        <p className={styles.subtitle}>
          Find the best referral codes, sign-up bonuses, and invite links for top Indian apps. Earn rewards instantly.
        </p>
        <div className={styles.trustRow}>
          <span className={styles.trustItem}><ShieldCheck size={14} /> Verified Codes</span>
          <span className={styles.trustItem}><Zap size={14} /> Updated Daily</span>
          <span className={styles.trustItem}><TrendingUp size={14} /> Real Cashback</span>
        </div>
      </section>

      <section className={`container ${styles.mainSection}`} id="offers">
        <OfferExplorer 
          allReferrals={referrals} 
          initialReferrals={restReferrals} 
          categories={categories}
          featuredNode={
            featured && (
              <div className={styles.featuredSection}>
                <div className={styles.featuredLabel}>
                  <Sparkles size={14} />
                  Featured Offer
                </div>
                <Link href={`/${featured.slug}`} className={styles.featuredCard}>
                  <div className={styles.featuredLeft}>
                    <span className={styles.featuredCategory}>{featured.category}</span>
                    <h2 className={styles.featuredName}>{featured.name}</h2>
                    <p className={styles.featuredBenefit}>{featured.benefit_user}</p>
                  </div>
                  <div className={styles.featuredRight}>
                    <span className={styles.featuredCta}>
                      Claim Bonus →
                    </span>
                  </div>
                </Link>
              </div>
            )
          }
        />
        
        {referrals.length > 7 && (
          <div className={styles.viewAllWrapper}>
            <Link href="/category/fintech" className={styles.viewAll}>
              View all {referrals.length} offers →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
