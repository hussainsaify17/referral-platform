import { getCategories, getReferralsByCategory } from "@/lib/cms";
import { ReferralCard } from "@/components/ReferralCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { OfferExplorer } from "@/components/OfferExplorer";
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
    category: c.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const capitalized = category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const title = `Best ${capitalized} Referral Codes & Sign Up Bonuses`;
  const description = `Browse the best working referral codes, invite links, and sign-up bonuses for ${capitalized} apps and services.`;
  const url = `https://referbenefits.co.in/category/${category}/`;

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
      images: [{ url: "https://referbenefits.co.in/logo.png", width: 512, height: 512, alt: "ReferBenefits Logo" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://referbenefits.co.in/logo.png"],
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

  const capitalized = category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: capitalized, href: `/category/${category.toLowerCase().replace(/\s+/g, '-')}` },
  ];

  return (
    <div className={`container ${styles.container}`} id="offers">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className={styles.header}>
        <h1 className={styles.title}>{capitalized} Referral Codes</h1>
        <p className={styles.subtitle}>
          Earn rewards, free credits, and sign-up bonuses for the best {capitalized} products.
        </p>
      </div>

      <OfferExplorer 
        allReferrals={await import('@/lib/cms').then(m => m.getAllReferrals())} 
        initialReferrals={referrals} 
        categories={categories}
      />
    </div>
  );
}
