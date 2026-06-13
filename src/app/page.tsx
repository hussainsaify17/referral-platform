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

  // Strip heavy markdown fields from the payload before passing to Client Components
  const stripPayload = (ref: any) => ({
    id: ref.id,
    name: ref.name,
    slug: ref.slug,
    category: ref.category,
    benefit_user: ref.benefit_user,
    bonus_amount: ref.bonus_amount || null,
    is_featured: ref.is_featured || false,
  });

  const lightweightReferrals = sortedReferrals.map(stripPayload);

  // Featured = first item (now properly sorted to favor is_featured: true)
  const featured = lightweightReferrals[0];
  const restReferrals = lightweightReferrals.slice(1, 7);

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
          allReferrals={lightweightReferrals} 
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
        
        {lightweightReferrals.length > 7 && (
          <div className={styles.viewAllWrapper}>
            <Link href="/category/fintech" className={styles.viewAll}>
              View all {lightweightReferrals.length} offers →
            </Link>
          </div>
        )}

        {/* SEO Trust Section */}
        <div className={styles.seoTrustBox}>
          <h2>Why Trust ReferBenefits?</h2>
          <p>
            ReferBenefits is India's most trusted platform for discovering verified sign-up bonuses, referral codes, and invite links. We manually verify and update every single offer daily to ensure you never get an expired code. 
          </p>
          <p>
            Whether you are looking for fintech apps like CRED and Groww, or food delivery apps like Swiggy and Zomato, using our referral codes ensures you get the maximum possible cash bonus when creating a new account. Stop leaving money on the table!
          </p>
        </div>
      </section>
    </div>
  );
}
