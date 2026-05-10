import { getAllReferrals, getReferralBySlug } from "@/lib/cms";
import { notFound } from "next/navigation";
import RedirectClient from "./RedirectClient";
import styles from "./page.module.css";
import { Metadata } from "next";
import { Suspense } from "react";

export async function generateStaticParams() {
  const referrals = await getAllReferrals();
  return referrals.map((ref) => ({
    slug: ref.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const referral = await getReferralBySlug(slug);

  if (!referral) return { title: "Not Found" };

  return {
    title: `Redirecting to ${referral.name}...`,
    robots: {
      index: false,
      follow: false,
    }
  };
}

export default async function GoPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const referral = await getReferralBySlug(slug);

  if (!referral) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.loader}></div>
      <h1 className={styles.text}>Taking you to {referral.name}...</h1>
      <p className={styles.subtext}>Securely redirecting you to your offer.</p>
      <Suspense fallback={null}>
        <RedirectClient 
          url={referral.referral_link} 
          brandName={referral.name} 
          slug={referral.slug} 
          category={referral.category} 
        />
      </Suspense>
    </div>
  );
}
