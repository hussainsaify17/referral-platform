import { getAllReferrals, getCategories } from "@/lib/cms";
import { ReferralCard } from "@/components/ReferralCard";
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
        <h1 className={styles.title}>
          Stop Leaving Money on the Table
        </h1>
        <p className={styles.subtitle}>
          Find the best referral codes, sign-up bonuses, and invite links. Updated daily.
        </p>
      </section>

      <section className={`container ${styles.mainSection}`}>
        <div className={styles.categories}>
          <h2 className={styles.sectionTitle}>Browse Categories</h2>
          <div className={styles.categoryTags}>
            {categories.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`} className={styles.catTag}>
                {cat}
              </Link>
            ))}
          </div>
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
