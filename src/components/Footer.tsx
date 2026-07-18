import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";
import { getCategories, getActiveReferrals } from "@/lib/cms";
import { NewsletterForm } from "./NewsletterForm";
import { FeedbackForm } from "./FeedbackForm";

export async function Footer() {
  const categories = await getCategories();
  const allReferrals = await getActiveReferrals();
  const topOffers = allReferrals.slice(0, 5);

  return (
    <>
      {/* ── Revenue Band: Newsletter Capture ─────────────────────── */}
      <section className={styles.newsletterBand}>
        <div className={styles.newsletterInner}>
          <p className={styles.newsletterLabel}>
            <span>🔔</span> Never miss a deal
          </p>
          <h2 className={styles.newsletterHeadline}>
            Get the best referral codes<br />delivered to your inbox
          </h2>
          <p className={styles.newsletterSub}>
            We send one weekly digest of the highest-value sign-up bonuses — no spam, unsubscribe anytime.
          </p>
          <NewsletterForm />
          <p className={styles.newsletterPrivacy}>
            🔒 No spam. We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* ── Main Footer ──────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          {/* Column 1 – Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Image src="/logo-small.png" alt="ReferBenefits Logo" width={32} height={32} className={styles.logoImage} />
              Refer<span className={styles.accent}>Benefits</span>
            </Link>
            <p className={styles.tagline}>
              India&apos;s most trusted directory for referral codes, sign-up bonuses &amp; invite links. Verified daily.
            </p>
            <div className={styles.trustBadges}>
              <span className={styles.trustBadge}>✅ Verified Codes</span>
              <span className={styles.trustBadge}>🇮🇳 Made for India</span>
              <span className={styles.trustBadge}>⚡ Updated Daily</span>
            </div>
            <div className={styles.socialRow}>
              <a
                href="https://twitter.com/referbenefits"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Follow on Twitter/X"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://t.me/referbenefits"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Join Telegram channel"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
                  <path d="m22 2-7 20-4-9-9-4Z"/>
                  <path d="M22 2 11 13"/>
                </svg>
              </a>
              <a
                href="mailto:hello@referbenefits.co.in"
                className={styles.socialIcon}
                aria-label="Contact via email"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 – Categories */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Browse by Category</h3>
            {categories.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}/`} className={styles.link}>
                {cat}
              </Link>
            ))}
            <Link href="/" className={styles.link}>
              All Offers
            </Link>
          </div>

          {/* Column 3 – Top Offers */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Top Offers</h3>
            {topOffers.map((offer) => (
              <Link key={offer.id} href={`/${offer.slug}/`} className={styles.link}>
                {offer.name}
              </Link>
            ))}
          </div>

          {/* Column 4 – Company */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Company</h3>
            <Link href="/about/" className={styles.link}>About Us</Link>
            <Link href="/blog/" className={styles.link}>
              Blog
              <span className={styles.linkNew}>New</span>
            </Link>
            <Link href="/privacy/" className={styles.link}>Privacy Policy</Link>
            <Link href="/terms/" className={styles.link}>Terms of Service</Link>
            <Link href="/disclaimer/" className={styles.link}>Affiliate Disclosure</Link>
            <Link href="/contact/" className={styles.link}>Contact Us</Link>
            <FeedbackForm className={styles.link} />
            <Link href="/contact/" className={styles.link}>
              📢 Partner / Advertise
            </Link>
          </div>
        </div>

        {/* ── Bottom Bar ─────────────────────────────────────────── */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} ReferBenefits.co.in — All rights reserved.
          </p>
          <p className={styles.disclaimer}>
            Affiliate Disclosure: We may earn a commission when you use our referral links, at no extra cost to you. All offers are independently verified.
          </p>
        </div>
      </footer>
    </>
  );
}
