import styles from "../page.module.css";

export const metadata = {
  title: "About Us",
  description: "Learn about ReferBenefits, our mission to help you discover verified referral codes, and our rigorous daily manual verification process.",
  alternates: {
    canonical: "https://referbenefits.co.in/about/",
  },
};

export default function AboutPage() {
  return (
    <div className={`container ${styles.container}`} style={{ padding: "4rem 1rem", maxWidth: "800px" }}>
      <h1 className={styles.sectionTitle} style={{ marginBottom: "2rem" }}>About Us</h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.6" }}>
        <p>
          Welcome to <strong>ReferBenefits</strong>, India&apos;s leading independent directory for verified referral codes, sign-up bonuses, and invite links. Our mission is simple: to help you maximize your savings and unlock cash rewards when signing up for new services and applications.
        </p>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Our Mission</h2>
          <p>
            Every day, thousands of fintech, food delivery, shopping, and travel apps offer incentives to new users. However, finding active, unexpired, and working codes can be frustrating. ReferBenefits acts as your trusted curation hub, organizing the highest-value offers in one clean, ad-light interface so you never leave money on the table.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Our Editorial & Verification Process</h2>
          <p>
            Unlike automated scraping portals that list broken or expired codes, we believe in **manual verification**. Here is how we ensure quality:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li><strong>Manual Testing:</strong> Our team registers on new apps and manually applies each listed code to verify that the welcome rewards are active.</li>
            <li><strong>Daily Syncing:</strong> We maintain a central Google Sheet database containing expiration dates, which updates our website build automatically.</li>
            <li><strong>Active Expiry Reminders:</strong> Our automated notification scripts alert us when codes are near expiration, prompting us to refresh or update them immediately.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Who We Are</h2>
          <p>
            ReferBenefits was founded by Hussain Saify, a personal finance enthusiast and developer based in India. Frustrated by the lack of verified promotional code portals, he built ReferBenefits to provide a clean, accessible, and fast utility platform for Indian internet users.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>How We Support the Platform</h2>
          <p>
            ReferBenefits is free to use. To support hosting, domain, and database maintenance, some of the links on our site are affiliate or referral links. This means we may earn a small reward or commission when you complete a sign-up, at absolutely zero additional cost to you.
          </p>
        </section>
      </div>
    </div>
  );
}
