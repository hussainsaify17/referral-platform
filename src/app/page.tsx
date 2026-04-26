import { getAllReferrals, getCategories } from "@/lib/cms";
import { ReferralCard } from "@/components/ReferralCard";
import { CategoryNav } from "@/components/CategoryNav";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "ReferBenefits | India's Best Sign Up Bonuses & Referral Codes",
  description: "Find verified referral codes, invite links, and sign-up bonuses to earn extra cash.",
};

export default async function Home() {
  const referrals = await getAllReferrals();
  const categories = await getCategories();

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
      </section>

      <section className={`container ${styles.mainSection}`}>
        <div className={styles.categories}>
          <CategoryNav categories={categories} />
        </div>

        <div>
          <h2 className={styles.sectionTitle}>Latest Offers</h2>
          <div className="bentoGrid">
            {referrals.slice(0, 6).map((ref) => (
              <ReferralCard key={ref.id} referral={ref} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
