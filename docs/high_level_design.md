# High-Level Design (HLD): ReferBenefits Platform

This document describes the high-level system architecture, data flow, and core design patterns of the **ReferBenefits** platform.

---

## 1. System Architecture Overview

ReferBenefits is a highly automated, self-sustaining **Programmatic SEO** directory for referral codes, sign-up bonuses, and invite links. It leverages a **decoupled, serverless architecture** combining Next.js static rendering, Google Sheets as a database, and Gemini AI for content generation.

```
+-----------------------------------------------------------------------------------+
|                                 GOOGLE WORKSPACE                                  |
|                                                                                   |
|     +---------------------------+       +-----------------------------------+     |
|     |   Google Sheet Database   | <---+ | Google Apps Script Webhook Web App|     |
|     +---------------------------+       +-----------------------------------+     |
|                   |                                       ^                       |
|                   | Published CSV URL                     | POST Expiry Alert     |
|                   v                                       |                       |
+-------------------+---------------------------------------+-----------------------+
                    |                                       |
                    v                                       |
+-------------------+---------------------------------------+-----------------------+
|                               GITHUB ACTIONS WORKFLOW                             |
|                                                                                   |
|     +---------------------------+       +-----------------------------------+     |
|     |  check_expirations.mjs    | ----> |      generate-referrals.mjs       |     |
|     +---------------------------+       +-----------------------------------+     |
|                   |                                       |                       |
|                   v Build HTML                            v Gemini AI Copy        |
|     +---------------------------+                         |                       |
|     |  GitHub Pages Static Site | <-----------------------+                       |
|     +---------------------------+                                                 |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Subsystems

### A. Static Site Frontend (Next.js & GitHub Pages)
*   **Static Generation (SSG)**: The website is completely pre-compiled into static HTML/CSS files at build time (`npm run build`). This achieves a sub-second Largest Contentful Paint (LCP) and 100/100 Lighthouse performance.
*   **Decoupled Database**: The frontend does not connect to any live database at request time. It reads data from Google Sheets (via a published CSV URL) and merges it with local AI-generated JSON copy.
*   **Strict Routing**: Static routes are generated strictly from the active offers in the spreadsheet. If an offer is deleted or expired, Next.js serves a **404 Not Found** page immediately.

### B. Daily Content Generation Pipeline
*   **Gemini Integration**: A daily GitHub Actions workflow checks for new referral entries in Google Sheets. It automatically runs a generation script which prompts Gemini 2.5 Flash to write:
    *   FAQ questions and answers
    *   Pros & Cons lists
    *   Fool-proof step-by-step instructions
    *   Detailed HTML reviews
*   **SEO Automation**: Generates meta-descriptions, page titles, and canonical headers optimized for target keywords.

### C. Spreadsheet-Code Sync System
*   **Bidirectional Sync**: When AI copy is generated locally, a sync utility pushes the rich content back to the Google Sheet via a Google Apps Script Webhook. This ensures the Google Sheet remains a complete, single source of truth.
*   **Local Hook**: Runs both in GitHub Actions and as a Git pre-commit hook locally to ensure code changes never diverge from the spreadsheet.

### D. Expiration & Alerting System
*   **Monitoring**: Runs daily to scan all active offers. If an offer's expiration date is within 24 hours:
    *   Sends a styled HTML notification email.
    *   Automatically adds a task reminder on the administrator's Google Calendar.
    *   Protects against duplicate alerts using automated date checks.
*   **Auto-Disabling**: Automatically updates the status column in the Google Sheet to `"expired"`, disabling the offer on the live site without manual intervention.

### E. Newsletter & Feedback Collection
*   **Spam Protected**: Incorporates honey-pot fields and client-side validation for form submissions.
*   **Google Apps Script Webhook**: Directs submissions into separate, clean spreadsheet tabs (`Newsletter` and `Feedback`) securely.
