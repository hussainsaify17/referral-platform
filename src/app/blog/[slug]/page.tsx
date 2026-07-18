import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/cms";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import styles from "./page.module.css";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: `${post.title} | Blog`,
    description: post.description,
    alternates: {
      canonical: `https://referbenefits.co.in/blog/${slug}/`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://referbenefits.co.in/blog/${slug}/`,
      type: "article",
      siteName: "ReferBenefits",
      images: [{ url: "https://referbenefits.co.in/logo.png", width: 512, height: 512, alt: "ReferBenefits Logo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["https://referbenefits.co.in/logo.png"],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog/" },
    { label: post.title, href: `/blog/${post.slug}/` },
  ];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "author": {
      "@type": "Person",
      "name": post.author,
    },
    "publisher": {
      "@id": "https://referbenefits.co.in/#organization"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://referbenefits.co.in/blog/${post.slug}/`,
    },
  };

  return (
    <article className={`container ${styles.container}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className={styles.breadcrumbArea}>
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className={styles.header}>
        <span className={styles.category}>{post.category}</span>
        <h1 className={styles.title}>{post.title}</h1>
        
        <div className={styles.meta}>
          <div className={styles.author}>
            <div className={styles.avatar}>
              {post.author.charAt(0)}
            </div>
            <span>By {post.author}</span>
          </div>
          <span>•</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>
      </header>

      <div style={{
        padding: "1rem 1.25rem",
        borderRadius: "8px",
        backgroundColor: "var(--card-bg)",
        borderLeft: "4px solid var(--accent)",
        fontSize: "14px",
        lineHeight: "1.6",
        color: "var(--secondary-foreground)",
        marginBottom: "2rem"
      }}>
        <p style={{ margin: 0 }}>
          <strong>💡 Disclaimer:</strong> Referral programs, card rewards, and fintech services terms change frequently. The information below is for educational and general informational purposes only and does not constitute formal financial advice. Always verify terms on the official banking or provider website before signing up or applying.
        </p>
      </div>

      <div className={styles.markdownWrapper}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid var(--card-border)" }}>
        <Link href="/blog/" style={{ color: "var(--accent)", fontWeight: "600", textDecoration: "none" }}>
          ← Back to Blog
        </Link>
      </div>
    </article>
  );
}
