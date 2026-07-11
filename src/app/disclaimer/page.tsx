import styles from "../page.module.css";

export const metadata = {
  title: "Affiliate Disclaimer",
  description: "Read the Affiliate Disclosure and Disclaimer for ReferBenefits. Learn about our referral links and terms of use.",
  alternates: {
    canonical: "https://referbenefits.co.in/disclaimer/",
  },
};

export default function DisclaimerPage() {
  return (
    <div className={`container ${styles.container}`} style={{ padding: "4rem 1rem", maxWidth: "800px" }}>
      <h1 className={styles.sectionTitle} style={{ marginBottom: "2rem" }}>Affiliate Disclaimer</h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: "1.6" }}>
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>1. Affiliate and Referral Disclosure</h2>
          <p>
            ReferBenefits is a participant in various developer, brand, and affiliate referral programs. We list promotional codes and links that, when clicked, redirect you to external merchant websites or mobile app stores. 
          </p>
          <p>
            If you sign up or perform specific transactions (such as completing KYC, depositing funds, or ordering a debit/credit card) after clicking our referral links, we may receive a commission, cash reward, or points bonus from the merchant. This occurs at **no additional cost to you**. These earnings support website operation and maintenance.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>2. Independent Review and Content Integrity</h2>
          <p>
            All detailed reviews, pros, cons, and steps listed on ReferBenefits are created independently by our editorial team. While we receive commissions, we do not accept sponsorships for positive ratings. If an application has drawbacks (such as high fees, complex KYC, or poor customer service), we list them clearly in our "Cons" sections.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>3. No Financial or Investment Advice</h2>
          <p>
            The content on ReferBenefits (including blog posts covering credit cards, Demat account sign-ups, and savings applications) is provided for **informational and educational purposes only**. 
          </p>
          <p>
            We do not provide professional financial, investment, legal, or tax advice. Opening credit cards, Demat trading accounts, or digital savings bank accounts involves risk:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li>Credit card applications require a hard credit pull, which can temporarily affect your CIBIL score.</li>
            <li>Trading stocks, mutual funds, or derivatives on platforms like Upstox carries high market risk.</li>
            <li>You should consult with a certified financial planner or read the terms of service on the official provider&apos;s site before making financial decisions.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>4. Accuracy of Promotional Offers</h2>
          <p>
            Fintech and consumer brands alter their promotional terms, codes, and welcome bonuses frequently. While we perform daily verification checks, we cannot guarantee the complete accuracy or longevity of every single listing. Please verify that the code has been successfully applied inside the respective merchant app during registration.
          </p>
        </section>
      </div>
    </div>
  );
}
