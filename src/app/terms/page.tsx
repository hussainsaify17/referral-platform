import styles from "../page.module.css";

export const metadata = {
  title: "Terms of Service | ReferBenefits",
  description: "Terms of Service and Conditions for using ReferBenefits.",
};

export default function TermsOfService() {
  return (
    <div className={`container ${styles.container}`} style={{ padding: "4rem 1rem", maxWidth: "800px" }}>
      <h1 className={styles.sectionTitle} style={{ marginBottom: "2rem" }}>Terms of Service</h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.6" }}>
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>1. Acceptance of Terms</h2>
          <p>By accessing and using ReferBenefits ("the Website"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this Website.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>2. Description of Service</h2>
          <p>ReferBenefits provides a curated list of referral codes, sign-up bonuses, and invite links for various third-party services and platforms. We aggregate these links to help users discover financial benefits, discounts, and rewards.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>3. Affiliate Disclaimer</h2>
          <p>Some of the links on this Website are affiliate or referral links. This means that if you click on the link and make a purchase or sign up for a service, we may receive a commission or referral bonus at no additional cost to you. These commissions help support the maintenance and operation of ReferBenefits.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>4. Accuracy of Information</h2>
          <p>While we strive to keep all referral codes and promotional information up to date, the terms of third-party promotions change frequently. We do not guarantee the accuracy, completeness, or validity of any offers listed on the Website. You are responsible for verifying the terms and conditions of the offer on the third-party provider's website before signing up.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>5. Limitation of Liability</h2>
          <p>ReferBenefits and its operators shall not be liable for any direct, indirect, incidental, consequential, or exemplary damages resulting from your use of the Website or any third-party services linked from the Website. You engage with third-party services at your own risk.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>6. Modifications to Service</h2>
          <p>We reserve the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Website (or any part thereof) with or without notice.</p>
        </section>
      </div>
    </div>
  );
}
