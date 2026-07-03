"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { MessageSquarePlus, X, Send, CheckCircle2 } from "lucide-react";
import styles from "./FeedbackForm.module.css";

export function FeedbackForm({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setStatus("idle");
      setName("");
      setFeedback("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !feedback.trim()) {
      setStatus("error");
      setErrorMessage("Please fill out all fields.");
      return;
    }

    setStatus("submitting");
    trackEvent("submit_feedback", { user_name: name.substring(0, 20) });

    try {
      const endpoint = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK || "";
      if (!endpoint) {
        throw new Error("Feedback webhook endpoint is not configured.");
      }

      // Send to the Google Apps Script Web App
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "feedback",
          name: name.trim(),
          feedback: feedback.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback.");
      }

      setStatus("success");
      setName("");
      setFeedback("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to submit. Please try again later.");
    }
  };

  return (
    <>
      <button onClick={toggleModal} className={className || styles.footerLink}>
        <span aria-hidden="true">💬</span> Give Feedback
      </button>

      {/* Glassmorphic Modal overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={toggleModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={toggleModal} aria-label="Close modal">
              <X size={20} />
            </button>

            {status === "success" ? (
              <div className={styles.successScreen}>
                <CheckCircle2 size={48} className={styles.successIcon} />
                <h2>Thank You!</h2>
                <p>Your feedback has been successfully sent and saved to our dashboard.</p>
                <button onClick={toggleModal} className={styles.successCloseBtn}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.header}>
                  <MessageSquarePlus size={24} className={styles.headerIcon} />
                  <h2>Share Your Feedback</h2>
                </div>
                <p className={styles.introText}>
                  Help us improve ReferBenefits. Let us know what features you want or if any code didn't work.
                </p>

                <div className={styles.inputGroup}>
                  <label htmlFor="feedback-name">Name</label>
                  <input
                    type="text"
                    id="feedback-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={status === "submitting"}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="feedback-text">Your Feedback</label>
                  <textarea
                    id="feedback-text"
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write your suggestions, bugs, or comments..."
                    rows={4}
                    disabled={status === "submitting"}
                  />
                </div>

                {status === "error" && (
                  <p className={styles.errorMsg}>{errorMessage}</p>
                )}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Feedback <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
