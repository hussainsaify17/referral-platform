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
      // You must create a Google Apps Script Web App that appends the row
      // to your Google Sheet, and put its URL in your .env.local as NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK
      const endpoint = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK || "";
      
      if (!endpoint) {
        throw new Error("Newsletter webhook is not configured.");
      }

      const res = await fetch(endpoint, {
        method: "POST",
        // GAS requires text/plain or application/x-www-form-urlencoded to avoid CORS preflight issues
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ email, timestamp: new Date().toISOString() }),
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
