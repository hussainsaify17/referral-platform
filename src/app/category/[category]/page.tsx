import { getCategories, getReferralsByCategory } from "@/lib/cms";
import { ReferralCard } from "@/components/ReferralCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryNav } from "@/components/CategoryNav";
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

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  const title = `Best ${capitalized} Referral Codes & Sign Up Bonuses`;
  const description = `Browse the best working referral codes, invite links, and sign-up bonuses for ${capitalized} apps and services.`;
  const url = `https://referbenefits.co.in/category/${category}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "ReferBenefits",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const referrals = await getReferralsByCategory(category);
  const categories = await getCategories();

  if (referrals.length === 0) {
    notFound();
  }

  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: capitalized, href: `/category/${category.toLowerCase()}` },
  ];

  return (
    <div className={`container ${styles.container}`} id="offers">
      <Breadcrumbs items={breadcrumbItems} />
      <CategoryNav categories={categories} />
      
      <div className={styles.header}>
        <h1 className={styles.title}>{capitalized} Referral Codes</h1>
        <p className={styles.subtitle}>
          Earn rewards, free credits, and sign-up bonuses for the best {capitalized} products.
        </p>
      </div>

      <div className="bentoGrid">
        {referrals.map((ref, index) => (
          <ReferralCard key={ref.id} referral={ref} position={index} />
        ))}
      </div>
    </div>
  );
}
