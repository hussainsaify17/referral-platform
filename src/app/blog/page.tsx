import Link from "next/link";
import { getBlogPosts } from "@/lib/cms";
import styles from "./page.module.css";

export const dynamic = "force-static";

export const metadata = {
  title: "Blog",
  description: "Expert guides, savings strategies, and the latest news on referral rewards, sign-up bonuses, and invite codes in India.",
  alternates: {
    canonical: "https://referbenefits.co.in/blog/",
  },
  openGraph: {
    title: "Blog | ReferBenefits",
    description: "Expert guides, savings strategies, and the latest news on referral rewards in India.",
    url: "https://referbenefits.co.in/blog/",
    type: "website",
    siteName: "ReferBenefits",
    images: [{ url: "https://referbenefits.co.in/logo.png", width: 512, height: 512, alt: "ReferBenefits Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | ReferBenefits",
    description: "Expert guides, savings strategies, and the latest news on referral rewards in India.",
    images: ["https://referbenefits.co.in/logo.png"],
  },
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <div className={`container ${styles.container}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>ReferBenefits Blog</h1>
        <p className={styles.subtitle}>
          Expert guides, savings strategies, and the latest news on referral rewards in India.
        </p>
      </header>

      {posts.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--secondary-foreground)" }}>
          No articles published yet. Check back soon!
        </p>
      ) : (
        <div className={styles.grid}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <article className={styles.card}>
                <span className={styles.category}>{post.category}</span>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.excerpt}>{post.description}</p>
                <div className={styles.readMore}>
                  Read Article <span>→</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
