import { getCategories, getReferralsByCategory } from "@/lib/cms";
import { ReferralCard } from "@/components/ReferralCard";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ category: string }>;
};

// Next.js static generation
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({
    category: c.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `Best ${capitalized} Referral Codes & Sign Up Bonuses`,
    description: `Browse the best working referral codes, invite links, and sign-up bonuses for ${capitalized} apps and services.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const referrals = await getReferralsByCategory(category);

  if (referrals.length === 0) {
    notFound();
  }

  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{capitalized} Referral Codes</h1>
        <p className={styles.subtitle}>
          Earn rewards, free credits, and sign-up bonuses for the best {capitalized} products.
        </p>
      </div>

      <div className="bentoGrid">
        {referrals.map((ref) => (
          <ReferralCard key={ref.id} referral={ref} />
        ))}
      </div>
    </div>
  );
}
