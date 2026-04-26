import Papa from "papaparse";
import fs from "fs/promises";
import path from "path";
import { Referral, FAQ } from "./types";

/**
 * Replace this with your Google Sheet's published CSV URL.
 * To get this:
 * 1. Create a Google Sheet with the exact columns.
 * 2. File > Share > Publish to web.
 * 3. Choose "Entire Document" and "Comma-separated values (.csv)".
 * 4. Paste the generated link here.
 */
const GOOGLE_SHEET_CSV_URL = process.env.GOOGLE_SHEET_CSV_URL || "";

/**
 * Helper to parse the custom FAQ string format: "Q: ... A: ... | Q: ... A: ..."
 */
function parseFaqs(faqString: string): FAQ[] {
  if (!faqString) return [];
  try {
    // If the data is valid JSON in the cell
    return JSON.parse(faqString);
  } catch {
    // Fallback: simple text splitting (optional, depends on your input method)
    return [];
  }
}

/**
 * Fetches referrals from either the published Google Sheet CSV or a local fallback.
 */
export async function getAllReferrals(): Promise<Referral[]> {
  let data: Referral[] = [];

  if (GOOGLE_SHEET_CSV_URL) {
    console.log("Fetching live data from Google Sheets...");
    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
      const csvText = await response.text();
      
      const parsed = Papa.parse<Record<string, unknown>>(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      // Map rows to our strongly typed structure
      data = parsed.data.map((row) => ({
        id: row.id || row.slug,
        name: row.name,
        slug: row.slug,
        category: row.category,
        referral_link: row.referral_link,
        referral_code: row.referral_code,
        benefit_user: row.benefit_user,
        benefit_owner: row.benefit_owner,
        // Assuming steps are separated by |
        steps: row.steps ? String(row.steps).split('|').map(s => s.trim()) : [],
        // Assuming faq is valid JSON string in the cell
        faq: parseFaqs(row.faq),
        expiry: row.expiry || "2099-12-31T00:00:00.000Z",
        last_checked: new Date().toISOString(),
        status: row.status || "active",
      }));
    } catch (error) {
      console.error("Failed to parse Google Sheet CSV:", error);
    }
  }

  // Fallback to local data if no URL is provided or fetch failed
  if (data.length === 0) {
    console.log("Using local fallback data...");
    const filePath = path.join(process.cwd(), "src/data/sample_referrals.json");
    const fileContents = await fs.readFile(filePath, "utf8");
    data = JSON.parse(fileContents);
  }
  
  // Filter out expired items in the ingestion layer
  const now = new Date().toISOString();
  return data.filter(item => item.status === "active" && item.expiry > now);
}

export async function getReferralBySlug(slug: string): Promise<Referral | null> {
  const all = await getAllReferrals();
  return all.find(r => r.slug === slug) || null;
}

export async function getCategories(): Promise<string[]> {
  const all = await getAllReferrals();
  const categories = new Set(all.map(r => r.category));
  return Array.from(categories);
}

export async function getReferralsByCategory(category: string): Promise<Referral[]> {
  const all = await getAllReferrals();
  return all.filter(r => r.category.toLowerCase() === category.toLowerCase());
}
