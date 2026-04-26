import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getAllReferrals, getReferralBySlug } from "@/lib/cms";
import { RelatedLinks } from "@/components/RelatedLinks";
import { CopyCodeButton } from "@/components/CopyCodeButton";
import { CheckCircle2, AlertCircle, Calendar, ExternalLink } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import styles from "./page.module.css";

export async function generateStaticParams() {
  const referrals = await getAllReferrals();
  return referrals.map((ref) => ({
    slug: ref.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const referral = await getReferralBySlug(slug);

  if (!referral) return { title: "Not Found" };

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const title = `${referral.name} Referral Code | Free Bonus (${currentMonth})`;
  const description = `Use our verified ${referral.name} referral code to get ${referral.benefit_user}. Working as of ${currentMonth}.`;
  const url = `https://referbenefits.co.in/${slug}`;

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
      type: "article",
      siteName: "ReferBenefits",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

export default async function ReferralPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const referral = await getReferralBySlug(slug);

  if (!referral) {
    notFound();
  }

  const isExpired = new Date(referral.expiry) < new Date();
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: referral.category, href: `/category/${referral.category.toLowerCase()}` },
    { label: referral.name, href: `/${referral.slug}` },
  ];

  const faqSchema = referral.faq && referral.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: referral.faq.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  } : null;

  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: `${referral.name} Sign Up Bonus`,
    description: referral.benefit_user,
    url: `https://referbenefits.co.in/${referral.slug}`,
    price: "0",
    priceCurrency: "INR",
    availability: isExpired ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    validThrough: referral.expiry
  };

  return (
    <div className={`container ${styles.pageContainer}`}>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <Breadcrumbs items={breadcrumbItems} />
          
          <header className={styles.header}>
            <div className={styles.brandMeta}>
              <span className={styles.category}>{referral.category}</span>
              <span className={styles.verified}>
                <CheckCircle2 size={14} /> Verified for {currentMonth}
              </span>
            </div>
            <h1 className={styles.title}>{referral.name} Referral Code & Sign Up Bonus</h1>
            <p className={styles.subtitle}>
              Maximize your rewards when creating a new account.
            </p>
          </header>

          <section className={styles.offerBox}>
            <div className={styles.offerHeader}>
              <h2>Your Sign-Up Reward</h2>
              {isExpired && (
                <div className={styles.expiredBadge}>
                  <AlertCircle size={16} /> This offer may have expired.
                </div>
              )}
            </div>
            <div className={styles.rewardHighlight}>
              {referral.benefit_user}
            </div>

            {referral.referral_code && (
              <CopyCodeButton code={referral.referral_code} />
            )}

            <a 
              href={referral.referral_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.primaryCta}
            >
              Claim Offer via Link <ExternalLink size={18} />
            </a>
            <p className={styles.disclaimer}>
              By using our link/code, we may earn a commission: &quot;{referral.benefit_owner}&quot;. This helps keep ReferBenefits free!
            </p>
          </section>

          <section className={styles.stepsSection}>
            <h2>How to Claim Your Bonus</h2>
            <div className={styles.stepsList}>
              {referral.steps.map((step, index) => (
                <div key={index} className={styles.step}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <p className={styles.stepText}>{step}</p>
                </div>
              ))}
            </div>
          </section>

          {referral.faq && referral.faq.length > 0 && (
            <section className={styles.faqSection}>
              <h2>Frequently Asked Questions</h2>
              <div className={styles.faqList}>
                {referral.faq.map((item, index) => (
                  <div key={index} className={styles.faqItem}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        <aside className={styles.sidebar}>
          <div className={styles.metaCard}>
            <h3>Offer Details</h3>
            <ul className={styles.metaList}>
              <li>
                <Calendar size={16} />
                <span>Valid until: {new Date(referral.expiry).toLocaleDateString()}</span>
              </li>
              <li>
                <CheckCircle2 size={16} />
                <span>Status: {referral.status === 'active' ? 'Active & Working' : 'Inactive'}</span>
              </li>
            </ul>
          </div>
          
          <RelatedLinks currentSlug={referral.slug} category={referral.category} />
        </aside>

      </div>
    </div>
  );
}
