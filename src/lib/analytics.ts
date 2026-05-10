/**
 * Central analytics event helpers.
 * All events flow through here so they stay consistent and easy to audit.
 * Uses the GA4 gtag already loaded in layout.tsx (G-5EV07XX9Y4).
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
  }
}

/** Fire a GA4 event safely (no-ops if gtag isn't loaded yet) */
function fireEvent(eventName: string, params: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

// ─── Conversion Events ────────────────────────────────────────────────────────

/**
 * Fired when a user clicks "Claim Offer via Link" — the primary conversion.
 * @param brandName  e.g. "CRED"
 * @param slug       e.g. "cred-referral-code"
 * @param category   e.g. "Fintech"
 * @param source     e.g. "twitter", "reddit" (optional UTM source)
 */
export function trackClaimOffer(brandName: string, slug: string, category: string, source?: string) {
  fireEvent("claim_referral_offer", {
    brand_name: brandName,
    page_slug: slug,
    brand_category: category,
    ...(source ? { utm_source: source } : {}),
  });
}

/**
 * Fired when a user copies the referral code — high-intent micro-conversion.
 * @param code      The actual code string, e.g. "SPQX2026"
 * @param brandName e.g. "CRED"
 * @param slug      e.g. "cred-referral-code"
 */
export function trackCopyCode(code: string, brandName: string, slug: string) {
  fireEvent("copy_referral_code", {
    referral_code: code,
    brand_name: brandName,
    page_slug: slug,
  });
}

/**
 * Fired when a user clicks a ReferralCard on the homepage / category page.
 * @param brandName e.g. "CRED"
 * @param slug      e.g. "cred-referral-code"
 * @param category  e.g. "Fintech"
 * @param position  Card position index on the page (for heatmap-style analysis)
 */
export function trackCardClick(brandName: string, slug: string, category: string, position: number) {
  fireEvent("referral_card_click", {
    brand_name: brandName,
    page_slug: slug,
    brand_category: category,
    card_position: position,
  });
}

/**
 * Generic escape hatch for one-off events (e.g. newsletter_signup).
 */
export function trackEvent(eventName: string, params: Record<string, string | number | boolean> = {}) {
  fireEvent(eventName, params);
}
