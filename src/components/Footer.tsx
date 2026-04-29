import Link from "next/link";
import styles from "./Footer.module.css";
import { getCategories, getAllReferrals } from "@/lib/cms";
import { NewsletterForm } from "./NewsletterForm";

export async function Footer() {
  const categories = await getCategories();
  const allReferrals = await getAllReferrals();
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
            <div className={styles.logo}>
              Refer<span className={styles.accent}>Benefits</span>
            </div>
            <p className={styles.tagline}>
              India&apos;s most trusted directory for referral codes, sign-up bonuses &amp; invite links. Verified daily.
            </p>
            <div className={styles.trustBadges}>
              <span className={styles.trustBadge}>✅ Verified Codes</span>
              <span className={styles.trustBadge}>🇮🇳 Made for India</span>
              <span className={styles.trustBadge}>⚡ Updated Daily</span>
            </div>
            {/* Social Links */}
            <div className={styles.socialRow}>
              <a
                href="https://twitter.com/referbenefits"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Follow on Twitter/X"
              >
                𝕏
              </a>
              <a
                href="https://t.me/referbenefits"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Join Telegram channel"
              >
                ✈
              </a>
              <a
                href="mailto:hello@referbenefits.co.in"
                className={styles.socialIcon}
                aria-label="Contact via email"
              >
                ✉
              </a>
            </div>
          </div>

          {/* Column 2 – Categories */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Browse by Category</h3>
            {categories.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`} className={styles.link}>
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
              <Link key={offer.id} href={`/${offer.slug}`} className={styles.link}>
                {offer.name}
              </Link>
            ))}
          </div>

          {/* Column 4 – Company */}
          <div className={styles.linkGroup}>
            <h3 className={styles.linkTitle}>Company</h3>
            <Link href="/blog" className={styles.link}>
              Blog
              <span className={styles.linkNew}>New</span>
            </Link>
            <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
            <Link href="/terms" className={styles.link}>Terms of Service</Link>
            <a href="mailto:hello@referbenefits.co.in" className={styles.link}>
              Contact Us
            </a>
            <a href="mailto:partner@referbenefits.co.in" className={styles.link}>
              📢 Partner / Advertise
            </a>
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
