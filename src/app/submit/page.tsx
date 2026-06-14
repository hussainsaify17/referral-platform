"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function SubmitPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const data = {
      brandName: formData.get("brandName"),
      code: formData.get("code"),
      link: formData.get("link"),
      benefit: formData.get("benefit"),
      email: formData.get("email"),
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to submit");
      }

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <main className={`container ${styles.container}`}>
        <div className={styles.formCard}>
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>🎉</span>
            <h1 className={styles.successTitle}>Code Submitted!</h1>
            <p className={styles.successDesc}>
              Thank you for contributing to the community pool! Your submission has been received and is pending review. It will appear on the site once approved.
            </p>
            <Link href="/" className={styles.submitBtn} style={{ display: "inline-block", textDecoration: "none" }}>
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Submit a Referral Code</h1>
        <p className={styles.subtitle}>Add your code to the Community Pool and start earning rewards when others use it.</p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="brandName" className={styles.label}>App / Brand Name *</label>
            <input 
              type="text" 
              id="brandName" 
              name="brandName" 
              required 
              placeholder="e.g. Google Pay, CRED, Zomato" 
              className={styles.input} 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="code" className={styles.label}>Referral Code</label>
            <input 
              type="text" 
              id="code" 
              name="code" 
              placeholder="e.g. CRED100" 
              className={styles.input} 
            />
            <span className={styles.helperText}>Leave blank if the app only uses a referral link.</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="link" className={styles.label}>Referral Link</label>
            <input 
              type="url" 
              id="link" 
              name="link" 
              placeholder="https://..." 
              className={styles.input} 
            />
            <span className={styles.helperText}>Required if there is no specific code to copy/paste.</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="benefit" className={styles.label}>What does the user get?</label>
            <input 
              type="text" 
              id="benefit" 
              name="benefit" 
              placeholder="e.g. ₹250 Cashback on first payment" 
              className={styles.input} 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Your Email (Optional)</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="We'll notify you when it goes live" 
              className={styles.input} 
            />
          </div>

          {status === "error" && (
            <span className={styles.error}>{errorMsg}</span>
          )}

          <button type="submit" disabled={status === "loading"} className={styles.submitBtn}>
            {status === "loading" ? "Submitting..." : "Submit to Community Pool"}
          </button>
        </form>
      </div>
    </main>
  );
}
