import { getAllReferrals, getReferralBySlug } from "@/lib/cms";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RelatedLinks } from "@/components/RelatedLinks";
import styles from "./page.module.css";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

// Next.js static generation
export async function generateStaticParams() {
  const referrals = await getAllReferrals();
  return referrals.map((r) => ({
    slug: r.slug,
  }));
}

// Dynamic SEO tags based on freshness signals
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const referral = await getReferralBySlug(slug);
  
  if (!referral) return {};
  
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return {
    title: `${referral.name} Referral Code | Free Bonus (${currentDate})`,
    description: `Use our ${referral.name} referral code to get ${referral.benefit_user}. Verified working as of ${currentDate}.`,
  };
}

export default async function ReferralPage({ params }: Props) {
  const { slug } = await params;
  const referral = await getReferralBySlug(slug);

  if (!referral) {
    notFound();
  }

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={`container ${styles.container}`}>
      {/* Breadcrumbs for SEO */}
      <nav className={styles.breadcrumbs}>
        <Link href="/">Home</Link>
        <span className={styles.separator}>/</span>
        <Link href={`/category/${referral.category.toLowerCase()}`}>{referral.category}</Link>
        <span className={styles.separator}>/</span>
        <span className={styles.current}>{referral.name}</span>
      </nav>

      <div className={styles.content}>
        {/* Main Trust Signal & CTA Area */}
        <section className={styles.heroCard}>
          <div className={styles.badge}>Working {currentDate}</div>
          <h1 className={styles.title}>{referral.name} Referral Code & Sign Up Bonus</h1>
          <p className={styles.benefit}>{referral.benefit_user}</p>
          
          <a 
            href={referral.referral_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width: '100%', fontSize: '1.125rem', padding: '1rem' }}
          >
            Claim {referral.name} Bonus
          </a>
          <p className={styles.disclaimer}>
            Disclosure: We may earn a small commission at no extra cost to you if you use our link.
          </p>
        </section>

        {/* Steps Section */}
        <section className={styles.section}>
          <h2>How to use the {referral.name} referral code</h2>
          <ol className={styles.stepsList}>
            {referral.steps.map((step, index) => (
              <li key={index} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <p className={styles.stepText}>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQs Section */}
        <section className={styles.section}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {referral.faq.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedLinks currentSlug={referral.slug} category={referral.category} />
      </div>
    </div>
  );
}
