import { getReferralBySlug, getAllReferrals } from "@/lib/cms";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButtons } from "@/components/ShareButtons";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import fs from 'fs/promises';
import path from 'path';
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
    title: `${referral.name} Referral Code & Sign Up Bonus Guide`,
    description: `Comprehensive guide to claiming your ${referral.name} sign-up bonus of ${referral.benefit_user}.`,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const referral = await getReferralBySlug(slug);

  if (!referral) {
    notFound();
  }

  let markdownContent = "";
  try {
    const filePath = path.join(process.cwd(), 'src/content/blogs', `${slug}.md`);
    markdownContent = await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    // Fallback if markdown hasn't been generated yet
    markdownContent = `We are currently generating the ultimate guide for ${referral.name}. Check back later!`;
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: referral.name },
  ];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${referral.name} Referral Guide`,
    author: {
      "@type": "Person",
      name: "ReferBenefits Editorial"
    },
    datePublished: new Date().toISOString().split('T')[0], // Approximated
    url: `https://referbenefits.co.in/blog/${referral.slug}`,
    publisher: {
      "@type": "Organization",
      name: "ReferBenefits"
    }
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
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
        <div className={styles.markdownWrapper}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        </div>

        <ShareButtons 
          url={`https://referbenefits.co.in/blog/${referral.slug}`} 
          title={`${referral.name} Referral Guide`}
        />

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
            <div>Usually, sign-up bonuses are credited within 24-48 hours of completing the required action.</div>
          </div>
        )}
      </article>
    </div>
  );
}
