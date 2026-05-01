"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import styles from "./Footer.module.css";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    // Fire GA4 event
    trackEvent("newsletter_signup", { email_domain: email.split("@")[1] });
    try {
      // Using formsubmit.co for static sites. Ensure NEXT_PUBLIC_ADMIN_EMAIL is set.
      const endpoint = process.env.NEXT_PUBLIC_ADMIN_EMAIL 
        ? `https://formsubmit.co/ajax/${process.env.NEXT_PUBLIC_ADMIN_EMAIL}`
        : "https://formsubmit.co/ajax/hello@referbenefits.co.in";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, _subject: "New Newsletter Subscriber!" }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to subscribe");
      }
      setStatus("success");
      setMessage("🎉 You’re in! Check your inbox for weekly deals.");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>{message}</p>
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
      <button type="submit" className={styles.newsletterBtn}>Get Deals →</button>
      {status === "error" && (
        <p style={{ color: "#ff6b6b", marginTop: "0.5rem", fontSize: "0.85rem" }}>{message}</p>
      )}
    </form>
  );
}
