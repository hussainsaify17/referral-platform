import { getReferralBySlug, getAllReferrals } from "@/lib/cms";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArrowRight } from "lucide-react";
import styles from "./page.module.css";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate static params for all blog posts
export async function generateStaticParams() {
  const referrals = await getAllReferrals();
  return referrals.map((r) => ({
    slug: r.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params;
  const referral = await getReferralBySlug(slug);

  if (!referral) {
    return { title: "Blog Post Not Found" };
  }

  return {
    title: `How to maximize your ${referral.name} rewards - ReferBenefits Blog`,
    description: `Read our comprehensive guide on how to get ${referral.benefit_user} using our exclusive ${referral.name} referral code.`,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const referral = await getReferralBySlug(slug);

  if (!referral) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: referral.name },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbArea}>
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className={styles.header}>
        <span className={styles.category}>{referral.category}</span>
        <h1 className={styles.title}>
          How to maximize your {referral.name} rewards in {new Date().getFullYear()}
        </h1>
        <div className={styles.meta}>
          <div className={styles.author}>
            <div className={styles.avatar}>R</div>
            <span>ReferBenefits Editorial</span>
          </div>
          <span>•</span>
          <span>Updated Monthly</span>
          <span>•</span>
          <span>5 min read</span>
        </div>
      </header>

      <article className={styles.content}>
        <p>
          If you are looking for the best {referral.category.toLowerCase()} apps in India, <strong>{referral.name}</strong> should definitely be on your radar. 
          But before you sign up directly from the app store, wait! You are leaving money on the table.
        </p>
        
        <p>
          In this comprehensive guide, we&apos;ll show you exactly how to claim your exclusive sign-up bonus and maximize your long-term rewards using our verified {referral.name} invite system.
        </p>

        <div className={styles.highlightBox}>
          <div className={styles.highlightTitle}>Exclusive Sign-up Bonus</div>
          <div className={styles.highlightValue}>{referral.benefit_user}</div>
          <p style={{ margin: 0 }}>
            By using our verified referral link or code below, you lock in this exclusive bonus instantly upon completing the sign-up requirements.
          </p>
          <a href={`/${referral.slug}`} className={styles.ctaButton}>
            Claim {referral.name} Bonus <ArrowRight size={18} />
          </a>
        </div>

        <h2>Step-by-Step Guide: How to claim your bonus</h2>
        <p>
          Follow these exact steps to ensure your {referral.name} reward is credited without any issues:
        </p>
        
        {referral.steps && referral.steps.length > 0 ? (
          <ul>
            {referral.steps.map((step, index) => (
              <li key={index}><strong>Step {index + 1}:</strong> {step}</li>
            ))}
          </ul>
        ) : (
          <ul>
            <li><strong>Step 1:</strong> Click the claim button above to visit {referral.name}.</li>
            <li><strong>Step 2:</strong> Download the app or create your account on the website.</li>
            <li><strong>Step 3:</strong> Enter our verified referral code if prompted during registration.</li>
            <li><strong>Step 4:</strong> Complete your first transaction or profile setup to unlock the bonus.</li>
          </ul>
        )}

        <h2>Why we love {referral.name}</h2>
        <p>
          The {referral.category.toLowerCase()} space is incredibly competitive right now, but {referral.name} stands out because of its robust reward ecosystem. Not only do you get <strong>{referral.benefit_user}</strong> just for joining, but the platform continuously rewards active users.
        </p>

        <h2>Frequently Asked Questions</h2>
        {referral.faq && referral.faq.length > 0 ? (
          referral.faq.map((item, index) => (
            <div key={index} className={styles.faqItem}>
              <div className={styles.faqQuestion}>{item.q}</div>
              <div>{item.a}</div>
            </div>
          ))
        ) : (
          <div className={styles.faqItem}>
            <div className={styles.faqQuestion}>When will my {referral.name} bonus reflect?</div>
            <div>Usually, sign-up bonuses are credited within 24-48 hours of completing the required action (like KYC completion or first transaction).</div>
          </div>
        )}

      </article>
    </div>
  );
}
