"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";

export function SubmitForm({ brands }: { brands: string[] }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [token, setToken] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setErrorMsg("Please complete the security verification.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const data = {
      brandName: formData.get("brandName"),
      code: formData.get("code"),
      link: formData.get("link"),
      benefit: formData.get("benefit"),
      email: formData.get("email"),
      cfTurnstileResponse: token,
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
    );
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Submit a Referral Code</h1>
        <p className={styles.subtitle}>Add your code to the Community Pool and start earning rewards when others use it.</p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="brandName" className={styles.label}>App / Brand Name *</label>
            <select 
              id="brandName" 
              name="brandName" 
              required 
              className={styles.input}
              defaultValue=""
            >
              <option value="" disabled>-- Select a Brand --</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <span className={styles.helperText}>Don't see your app? Contact us to add it.</span>
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

          <div className={styles.formGroup} style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
              <Turnstile 
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                onSuccess={setToken} 
              />
            ) : (
              <div style={{ color: "orange", fontSize: "0.9rem" }}>
                [Dev Mode] Turnstile disabled. Please configure NEXT_PUBLIC_TURNSTILE_SITE_KEY.
              </div>
            )}
          </div>

          {status === "error" && (
            <span className={styles.error}>{errorMsg}</span>
          )}

          {/* Fallback to allow dev mode testing when Turnstile is missing */}
          <button 
            type="submit" 
            disabled={status === "loading" || (!token && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)} 
            className={styles.submitBtn}
          >
            {status === "loading" ? "Submitting..." : "Submit to Community Pool"}
          </button>
        </form>
      </div>
    </>
  );
}
