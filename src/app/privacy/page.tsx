import styles from "../page.module.css";

export const metadata = {
  title: "Privacy Policy",
  description: "Read the Privacy Policy for ReferBenefits. Learn how we protect your personal information, handle cookies, and serve personalized Google AdSense ads.",
  alternates: {
    canonical: "https://referbenefits.co.in/privacy/",
  },
};

export default function PrivacyPolicy() {
  return (
    <div className={`container ${styles.container}`} style={{ padding: "4rem 1rem", maxWidth: "800px" }}>
      <h1 className={styles.sectionTitle} style={{ marginBottom: "2rem" }}>Privacy Policy</h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.6" }}>
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>1. Information We Collect</h2>
          <p>ReferBenefits is primarily a static informational website. We do not require you to create an account or provide personal data to browse our referral codes. We may collect basic usage data (such as IP addresses, browser types, and navigation history) using cookies to improve our platform&apos;s performance and user experience.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>2. Google AdSense & Third-Party Advertising</h2>
          <p>We use Google AdSense and other third-party advertising companies to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li>Google, as a third-party vendor, uses cookies to serve ads on our site.</li>
            <li>Google&apos;s use of the DoubleClick DART cookie enables it and its partners to serve ads to users based on their visit to our site and/or other sites on the Internet.</li>
            <li>Users may opt out of the use of the DART cookie by visiting the <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google Ad and Content Network Privacy Policy</a>.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>3. Cookies & Tracking</h2>
          <p>Our website utilizes cookies to customize your experience and track site traffic. You can choose to disable or selectively turn off our cookies or third-party cookies in your browser settings. However, this can affect how you are able to interact with our site as well as other websites. To manage personalized advertising preferences, you can also visit <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>4. Third-Party Links</h2>
          <p>Our website contains referral links and promo codes to third-party services. Once you click on these links, you will be redirected to external websites. We are not responsible for the privacy practices, content, or terms of those external sites. We strongly advise you to read the privacy policies of any third-party websites you visit.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>5. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at hello@referbenefits.co.in.</p>
        </section>
      </div>
    </div>
  );
}
