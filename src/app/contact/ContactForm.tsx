"use client";

import { useState } from "react";
import styles from "../page.module.css";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    
    // Simulate sending form
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "general", message: "" });
    }, 1000);
  };

  return (
    <div className={`container ${styles.container}`} style={{ padding: "4rem 1rem", maxWidth: "800px" }}>
      <h1 className={styles.sectionTitle} style={{ marginBottom: "2rem" }}>Contact Us</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem", lineHeight: "1.6" }}>
        
        {/* Contact info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          <div style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--card-border)", backgroundColor: "var(--card-bg)" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--accent)" }}>General Inquiries</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>Questions, feedback, or general support:</p>
            <a href="mailto:hello@referbenefits.co.in" style={{ color: "var(--foreground)", fontWeight: "600", textDecoration: "underline", fontSize: "14px", display: "block", marginTop: "0.5rem" }}>
              hello@referbenefits.co.in
            </a>
          </div>

          <div style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--card-border)", backgroundColor: "var(--card-bg)" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--accent)" }}>Submit a Code</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>Have a working referral code you want us to list?</p>
            <a href="mailto:submit@referbenefits.co.in" style={{ color: "var(--foreground)", fontWeight: "600", textDecoration: "underline", fontSize: "14px", display: "block", marginTop: "0.5rem" }}>
              submit@referbenefits.co.in
            </a>
          </div>

          <div style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--card-border)", backgroundColor: "var(--card-bg)" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--accent)" }}>Business & Partnerships</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>For advertising, integrations, or partnerships:</p>
            <a href="mailto:partner@referbenefits.co.in" style={{ color: "var(--foreground)", fontWeight: "600", textDecoration: "underline", fontSize: "14px", display: "block", marginTop: "0.5rem" }}>
              partner@referbenefits.co.in
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ padding: "2rem", borderRadius: "16px", border: "1px solid var(--card-border)", backgroundColor: "var(--card-bg)" }}>
          <h2 style={{ fontSize: "1.5rem", marginTop: 0, marginBottom: "1.5rem" }}>Send us a message</h2>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label htmlFor="contact-name" style={{ fontWeight: "600", fontSize: "14px" }}>Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Hussain"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)", backgroundColor: "var(--bg)", color: "var(--foreground)" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label htmlFor="contact-email" style={{ fontWeight: "600", fontSize: "14px" }}>Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="hussain@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)", backgroundColor: "var(--bg)", color: "var(--foreground)" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="contact-subject" style={{ fontWeight: "600", fontSize: "14px" }}>Inquiry Type</label>
              <select
                id="contact-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)", backgroundColor: "var(--bg)", color: "var(--foreground)" }}
              >
                <option value="general">General Inquiry</option>
                <option value="submit">Submit Referral Code</option>
                <option value="report">Report Broken Code</option>
                <option value="partner">Partnership Opportunity</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="contact-message" style={{ fontWeight: "600", fontSize: "14px" }}>Message</label>
              <textarea
                id="contact-message"
                required
                rows={5}
                placeholder="How can we help you?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--card-border)", backgroundColor: "var(--bg)", color: "var(--foreground)", resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                padding: "0.85rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                fontWeight: "bold",
                cursor: status === "sending" ? "not-allowed" : "pointer",
                opacity: status === "sending" ? 0.7 : 1,
                transition: "opacity 0.2s"
              }}
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>

            {status === "success" && (
              <p style={{ color: "var(--success)", fontWeight: "600", margin: 0, textAlign: "center" }}>
                ✓ Thank you! Your message has been sent successfully. We will get back to you shortly.
              </p>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
