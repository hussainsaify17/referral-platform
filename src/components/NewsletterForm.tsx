"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import styles from "./Footer.module.css";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      return;
    }
    // Fire GA4 event
    trackEvent("newsletter_signup", { email_domain: email.split("@")[1] });
    // TODO: wire to your email provider (Mailchimp / ConvertKit / Brevo)
    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
        🎉 You&apos;re in! Check your inbox for weekly deals.
      </p>
    );
  }

  return (
    <form className={styles.newsletterForm} onSubmit={handleSubmit}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className={styles.newsletterInput}
        aria-label="Email address for newsletter"
      />
      <button type="submit" className={styles.newsletterBtn}>
        Get Deals →
      </button>
    </form>
  );
}
