import styles from "../page.module.css";

export const metadata = {
  title: "Privacy Policy | ReferBenefits",
  description: "Privacy Policy for ReferBenefits platform.",
};

export default function PrivacyPolicy() {
  return (
    <div className={`container ${styles.container}`} style={{ padding: "4rem 1rem", maxWidth: "800px" }}>
      <h1 className={styles.sectionTitle} style={{ marginBottom: "2rem" }}>Privacy Policy</h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.6" }}>
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>1. Information We Collect</h2>
          <p>ReferBenefits is primarily a static informational website. We do not require you to create an account or provide personal information to browse our referral codes. We may collect basic analytics data (such as IP addresses, browser types, and usage patterns) to improve our platform's performance and user experience.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>2. How We Use Your Information</h2>
          <p>Any non-personally identifiable information collected through analytics is used solely to understand how visitors interact with our website, enabling us to optimize the content and layout.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>3. Third-Party Links</h2>
          <p>Our website contains referral links and promo codes to third-party services and products. Once you click on these links, you will be redirected to external websites. We are not responsible for the privacy practices, content, or terms of those external sites. We strongly advise you to read the privacy policies of any third-party websites you visit.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>4. Cookies</h2>
          <p>We may use cookies and similar tracking technologies to track activity on our website. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some portions of our website may not function optimally.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>5. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@referralbuddy.example.com.</p>
        </section>
      </div>
    </div>
  );
}
