import Link from "next/link";
import { getAllReferrals } from "@/lib/cms";
import { ArrowRight } from "lucide-react";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - ReferBenefits",
  description: "Read our latest guides, reviews, and tips on maximizing your referral rewards and sign-up bonuses in India.",
};

export default async function BlogIndexPage() {
  const referrals = await getAllReferrals();

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>The ReferBenefits Blog</h1>
        <p className={styles.subtitle}>
          Guides, tips, and deep-dives into maximizing your rewards with India's top apps.
        </p>
      </div>

      <div className={styles.grid}>
        {referrals.map((referral) => (
          <Link key={referral.id} href={`/blog/${referral.slug}`} className={styles.card}>
            <span className={styles.category}>{referral.category}</span>
            <h2 className={styles.postTitle}>
              How to maximize your {referral.name} rewards in {new Date().getFullYear()}
            </h2>
            <p className={styles.excerpt}>
              Discover the best ways to earn {referral.benefit_user} and make the most out of {referral.name}'s referral program.
            </p>
            <div className={styles.readMore}>
              Read full guide <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
