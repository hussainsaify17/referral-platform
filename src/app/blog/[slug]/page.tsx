import { getReferralBySlug, getAllReferrals } from "@/lib/cms";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";
import styles from "./page.module.css";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

// Simple pseudo-random hash function for consistent layout picking
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

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

  // Generate varied meta titles too
  const seed = hashString(slug);
  const titles = [
    `How to maximize your ${referral.name} rewards - ReferBenefits Blog`,
    `The Ultimate ${referral.name} Referral Guide for ${new Date().getFullYear()}`,
    `${referral.name} Sign Up Bonus: Everything You Need to Know`,
  ];
  
  const descriptions = [
    `Read our comprehensive guide on how to get ${referral.benefit_user} using our exclusive ${referral.name} referral code.`,
    `Don't leave money on the table. Discover how to claim your ${referral.name} sign-up bonus of ${referral.benefit_user} today.`,
    `Verified ${referral.name} invite code and step-by-step guide to unlock ${referral.benefit_user} instantly.`
  ];

  return {
    title: titles[seed % 3],
    description: descriptions[seed % 3],
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const referral = await getReferralBySlug(slug);

  if (!referral) {
    notFound();
  }

  const seed = hashString(slug);
  const layoutType = seed % 3;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: referral.name },
  ];

  // Varied Headers
  const h1Variations = [
    `How to maximize your ${referral.name} rewards in ${new Date().getFullYear()}`,
    `The Complete ${referral.name} Referral Guide: Claim ${referral.benefit_user}`,
    `Why everyone is using ${referral.name} for ${referral.category.toLowerCase()} (Plus a bonus!)`
  ];

  const authorVariations = [
    "ReferBenefits Editorial",
    "Rewards Team",
    "Fintech Insider"
  ];

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbArea}>
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className={styles.header}>
        <span className={styles.category}>{referral.category}</span>
        <h1 className={styles.title}>
          {h1Variations[seed % 3]}
        </h1>
        <div className={styles.meta}>
          <div className={styles.author}>
            <div className={styles.avatar}>{authorVariations[seed % 3].charAt(0)}</div>
            <span>{authorVariations[seed % 3]}</span>
          </div>
          <span>•</span>
          <span>Updated Monthly</span>
          <span>•</span>
          <span>{4 + (seed % 3)} min read</span>
        </div>
      </header>

      <article className={styles.content}>
        
        {/* Intro Blocks based on Layout Type */}
        {layoutType === 0 && (
          <>
            <p>
              If you are looking for the best {referral.category.toLowerCase()} apps in India, <strong>{referral.name}</strong> should definitely be on your radar. 
              But before you sign up directly from the app store, wait! You are leaving money on the table.
            </p>
            <p>
              In this comprehensive guide, we&apos;ll show you exactly how to claim your exclusive sign-up bonus and maximize your long-term rewards using our verified {referral.name} invite system.
            </p>
          </>
        )}
        
        {layoutType === 1 && (
          <>
            <p>
              Have you heard the hype around <strong>{referral.name}</strong> lately? It&apos;s quickly becoming one of the most popular platforms in the {referral.category.toLowerCase()} category, and for good reason.
            </p>
            <p>
              What many new users don&apos;t realize is that signing up without a referral link means missing out on free rewards. Let&apos;s dive into how you can secure <strong>{referral.benefit_user}</strong> right from day one.
            </p>
          </>
        )}

        {layoutType === 2 && (
          <>
            <p>
              Let&apos;s face it: testing out new {referral.category.toLowerCase()} tools can be overwhelming. But <strong>{referral.name}</strong> has simplified the process significantly, offering a sleek experience tailored for the modern user.
            </p>
            <p>
              To sweeten the deal, they currently have one of the most generous sign-up programs available. Today, we&apos;ll walk you through exactly how to activate your <strong>{referral.benefit_user}</strong> bonus safely and instantly.
            </p>
          </>
        )}

        {/* Dynamic Highlight Box */}
        <div className={`${styles.highlightBox} ${layoutType === 1 ? styles.highlightBoxAlt : ''}`}>
          <div className={styles.highlightTitle}>
            {layoutType === 0 ? "Exclusive Sign-up Bonus" : layoutType === 1 ? "Your Welcome Reward" : "Unlock Your Bonus"}
          </div>
          <div className={styles.highlightValue}>{referral.benefit_user}</div>
          <p style={{ margin: 0, marginBottom: "1.5rem" }}>
            {layoutType === 2 ? "Don't sign up empty-handed. Use our verified referral code to lock in this offer." : "By using our verified referral link or code below, you lock in this exclusive bonus instantly."}
          </p>
          <a href={`/${referral.slug}`} className={styles.ctaButton}>
            Claim {referral.name} Bonus <ArrowRight size={18} />
          </a>
        </div>

        {/* Content Body Variations */}
        {layoutType !== 1 ? (
          <>
            <h2>Step-by-Step: Getting Started</h2>
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
          </>
        ) : (
          <>
            <h2>Why {referral.name} is a Game Changer</h2>
            <p>
              When evaluating {referral.category.toLowerCase()} apps, we look at usability, rewards, and reliability. {referral.name} scores high on all three fronts. Here is what makes it unique:
            </p>
            <ul className={styles.featureList}>
              <li><Star size={16} color="var(--accent)" /> <strong>Generous Rewards:</strong> The {referral.benefit_user} sign-up bonus is just the beginning.</li>
              <li><ShieldCheck size={16} color="var(--success)" /> <strong>Trusted Platform:</strong> Millions of users trust {referral.name} for their daily needs.</li>
              <li><Zap size={16} color="#f59e0b" /> <strong>Fast Processing:</strong> Rewards and bonuses are credited swiftly to your account.</li>
            </ul>

            <h2>How to Activate the Offer</h2>
            <p>Claiming your bonus is straightforward. Simply use our promotional link above to navigate to the official {referral.name} site. During the registration process, ensure the referral code is applied. Once you complete your initial setup or first transaction, the {referral.benefit_user} will automatically be credited to your account dashboard.</p>
          </>
        )}

        <h2>Frequently Asked Questions</h2>
        {referral.faq && referral.faq.length > 0 ? (
          referral.faq.map((item, index) => (
            <div key={index} className={styles.faqItem}>
              <div className={styles.faqQuestion}>{item.question}</div>
              <div>{item.answer}</div>
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
