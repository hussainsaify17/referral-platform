import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getAllReferrals, getReferralBySlug } from "@/lib/cms";
import { RelatedLinks } from "@/components/RelatedLinks";
import { CopyCodeButton } from "@/components/CopyCodeButton";
import { ClaimOfferButton } from "@/components/ClaimOfferButton";
import { ShareButtons } from "@/components/ShareButtons";
import { CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdBanner } from "@/components/AdBanner";
import { InlineCopyBadge } from "@/components/InlineCopyBadge";
import styles from "./page.module.css";

function cleanStepText(text: string): string {
  if (!text) return "";
  let cleaned = text;
  
  // 1. Replace HTML links <a href='URL'>TEXT</a> with just the URL
  cleaned = cleaned.replace(/<a\s+href=['"]([^'"]+)['"]>[^<]*<\/a>/gi, "$1");
  
  // 2. Replace other raw HTML tags:
  // - <strong>text</strong> or <b>text</b> or <code>text</code> -> **text**
  cleaned = cleaned.replace(/<\/?(strong|b|code)>/gi, "**");
  
  // - Remove any other random HTML tags like <span>, </p>, etc.
  cleaned = cleaned.replace(/<\/?[a-z0-9]+[^>]*>/gi, "");
  
  // 3. Normalize multiple asterisks:
  // - ***text*** -> **text**
  cleaned = cleaned.replace(/\*\*\*+([^*]+)\*\*\*+/g, "**$1**");
  
  // 4. Remove backticks:
  // - `text` -> text
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");
  cleaned = cleaned.replace(/`/g, "");
  
  // 5. Clean up any double bold markup caused by replacements (e.g. ****text**** -> **text**)
  cleaned = cleaned.replace(/\*\*+/g, "**");
  
  return cleaned;
}

function parseStepText(
  text: string,
  referralCode?: string,
  brandName?: string,
  slug?: string
) {
  if (!text) return [];
  const cleanedText = cleanStepText(text);

  if (!referralCode) {
    const pattern = /(https?:\/\/[^\s,()]+)|\*\*([^*]+)\*\*/gi;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    while ((match = pattern.exec(cleanedText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleanedText.substring(lastIndex, match.index));
      }
      if (match[1]) {
        parts.push(
          <a
            key={match.index}
            href={match[1]}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.stepLink}
          >
            {match[1]}
          </a>
        );
      } else if (match[2]) {
        parts.push(<strong key={match.index} className={styles.stepBold}>{match[2]}</strong>);
      }
      lastIndex = pattern.lastIndex;
    }
    if (lastIndex < cleanedText.length) {
      parts.push(cleanedText.substring(lastIndex));
    }
    return parts.length > 0 ? parts : [cleanedText];
  }

  const escapedCode = referralCode.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const pattern = new RegExp(
    `(\\*\\*${escapedCode}\\*\\*)|\\b(${escapedCode})\\b|(https?:\\/\\/[^\\s,()]+)|\\*\\*([^*]+)\\*\\*`,
    "gi"
  );

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(cleanedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(cleanedText.substring(lastIndex, match.index));
    }

    if (match[1] || match[2]) {
      parts.push(
        <InlineCopyBadge
          key={match.index}
          code={referralCode}
          brandName={brandName || ""}
          slug={slug || ""}
        />
      );
    } else if (match[3]) {
      parts.push(
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.stepLink}
        >
          {match[3]}
        </a>
      );
    } else if (match[4]) {
      parts.push(<strong key={match.index} className={styles.stepBold}>{match[4]}</strong>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < cleanedText.length) {
    parts.push(cleanedText.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [cleanedText];
}

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

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const title = `${referral.name} Referral Code | Free Bonus (${currentMonth})`;
  const description = `Get the verified ${referral.name} referral code to claim your ${referral.benefit_user} sign-up bonus. Working and updated daily for ${currentMonth}.`;
  const url = `https://referbenefits.co.in/${slug}/`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "en-IN": url,
        "x-default": url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "ReferBenefits",
      images: [{ url: "https://referbenefits.co.in/logo.png", width: 512, height: 512, alt: `${referral.name} Referral Code` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://referbenefits.co.in/logo.png"],
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
    { label: referral.category, href: `/category/${referral.category.toLowerCase().replace(/\s+/g, '-')}` },
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

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: referral.name,
    applicationCategory: "WebApplication",
    operatingSystem: "Any",
    image: "https://referbenefits.co.in/favicon.ico",
    offers: offerSchema
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
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

          <AdBanner dataAdSlot="header_slot_123" />

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
              <CopyCodeButton
                code={referral.referral_code}
                brandName={referral.name}
                slug={referral.slug}
              />
            )}

            <ClaimOfferButton
              href={`/go/${referral.slug}`}
              brandName={referral.name}
              slug={referral.slug}
              category={referral.category}
            />
            <p className={styles.disclaimer}>
              By using our link/code, we may earn a commission: &quot;{referral.benefit_owner}&quot;. This helps keep ReferBenefits free!
            </p>

            <ShareButtons 
              url={`https://referbenefits.co.in/${referral.slug}`} 
              title={`${referral.name} Referral Code: ${referral.referral_code || 'Bonus Link'}`}
              text={referral.benefit_user}
            />
          </section>

          <section className={styles.stepsSection}>
            <h2>How to Claim Your Bonus</h2>
            <div className={styles.stepsList}>
              {referral.steps.map((step, index) => (
                <div key={index} className={styles.step}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <p className={styles.stepText}>
                    {parseStepText(step, referral.referral_code, referral.name, referral.slug)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {((referral.pros && referral.pros.length > 0) || (referral.cons && referral.cons.length > 0)) && (
            <section className={styles.prosConsSection}>
              <div className={styles.prosConsGrid}>
                {referral.pros && referral.pros.length > 0 && (
                  <div className={styles.prosBox}>
                    <h3>✅ Pros</h3>
                    <ul>
                      {referral.pros.map((pro, idx) => <li key={idx}>{pro}</li>)}
                    </ul>
                  </div>
                )}
                {referral.cons && referral.cons.length > 0 && (
                  <div className={styles.consBox}>
                    <h3>❌ Cons</h3>
                    <ul>
                      {referral.cons.map((con, idx) => <li key={idx}>{con}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          <AdBanner dataAdSlot="middle_slot_456" />

          {referral.detailed_review && (
            <section className={styles.reviewSection} style={{ margin: '40px 0', lineHeight: '1.8' }} aria-label="Detailed Review">
              <div dangerouslySetInnerHTML={{ __html: referral.detailed_review }} />
            </section>
          )}

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

          {/* ── Disclaimer ─────────────────────────────────────── */}
          <section className={styles.disclaimerBlock}>
            <p className={styles.disclaimerTitle}>⚠️ Disclaimer</p>
            <div className={styles.disclaimerText}>
              <p>Please independently verify all details and terms of service of the third-party apps or platforms before participating. <strong>ReferBenefits is not responsible for any direct or indirect financial outcomes, profits, or losses.</strong></p>
              <p>All referral links and promo codes are provided for informational and promotional purposes only. We aim to keep listings accurate, but we do not guarantee the availability or validity of third-party offers.</p>
              <p><strong>Engaging with external services and using these codes is done entirely at your own discretion and risk.</strong></p>
              <p>Please make financial decisions responsibly. 🙏</p>
            </div>
          </section>

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
                <span>Status: {referral.status === 'active' ? 'Active & Working' : 'Expired'}</span>
              </li>
            </ul>
          </div>
          
          <AdBanner dataAdSlot="sidebar_slot_789" />

          <RelatedLinks currentSlug={referral.slug} category={referral.category} />
        </aside>

      </div>
    </div>
  );
}
