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

  // Clean the URL in case of accidental quotes or spaces in the GitHub Secret
  const rawUrl = process.env.GOOGLE_SHEET_CSV_URL || "";
  const cleanedUrl = rawUrl.replace(/^["']|["']$/g, '').trim();

  if (cleanedUrl) {
    console.log("Fetching live data from Google Sheets...");
    try {
      // We append a timestamp to bypass Next.js build-time fetch caching without using 
      // cache: "no-store", which would crash the static export (NEXT_STATIC_GEN_BAILOUT)
      const cacheBusterUrl = cleanedUrl.includes("?") 
        ? `${cleanedUrl}&_t=${Date.now()}` 
        : `${cleanedUrl}?_t=${Date.now()}`;
        
      const response = await fetch(cacheBusterUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();
      
      // If the user accidentally pasted the "Web Page" link instead of CSV/TSV, the response will be HTML.
      if (csvText.trim().startsWith("<!DOCTYPE html>") || csvText.trim().startsWith("<html")) {
         throw new Error("The URL returned an HTML webpage instead of a CSV/TSV file. Make sure you published as Comma-separated values or Tab-separated values!");
      }
      
      const parsed = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
         console.warn("CSV Parsing Warnings:", parsed.errors);
      }

      // Map rows to our strongly typed structure
      data = parsed.data
        .map((row) => ({
          id: row.id || row.slug,
          name: row.name,
          slug: row.slug,
          category: row.category || "Uncategorized",
          referral_link: row.referral_link,
          referral_code: row.referral_code,
          benefit_user: row.benefit_user,
          benefit_owner: row.benefit_owner,
          steps: row.steps ? String(row.steps).split('|').map(s => s.trim()) : [],
          faq: parseFaqs(row.faq),
          expiry: row.expiry || "2099-12-31T00:00:00.000Z",
          last_checked: new Date().toISOString(),
          status: (row.status as "active" | "expired") || "active",
        }))
        // Ensure the row actually has an ID and Name
        .filter((row) => row.id && row.name);

      if (data.length === 0) {
        throw new Error("Successfully fetched the document, but found 0 valid rows. Check your column headers (must be id, name, slug, etc).");
      }

    } catch (error) {
      console.error("Live Data Fetch Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Instead of silently falling back to dummy data, display the exact error on the site!
      return [{
        id: "error-card-1",
        name: "⚠️ Data Fetch Error",
        slug: "error-card",
        category: "Error",
        referral_link: "#",
        referral_code: "ERROR",
        benefit_user: `There is a problem with the Google Sheet integration.`,
        benefit_owner: errorMessage,
        steps: [
          "1. This means the GitHub Action tried to fetch your Google Sheet but failed.",
          `2. The exact error is: ${errorMessage}`,
          `3. The URL it tried to fetch was: ${cleanedUrl.substring(0, 50)}...`
        ],
        faq: [],
        expiry: "2099-12-31T00:00:00.000Z",
        status: "active",
        last_checked: new Date().toISOString()
      }];
    }
  }

  // Fallback to local data only if the URL is completely missing
  if (data.length === 0) {
    console.log("No URL provided. Using local fallback data...");
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
