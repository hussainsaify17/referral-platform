import Papa from "papaparse";
import fs from "fs/promises";
import path from "path";
import { Referral, FAQ, BlogPost } from "./types";

/**
 * Replace this with your Google Sheet's published CSV URL.
 * To get this:
 * 1. Create a Google Sheet with the exact columns.
 * 2. File > Share > Publish to web.
 * 3. Choose "Entire Document" and "Comma-separated values (.csv)".
 * 4. Paste the generated link here.
 */


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
      const response = await fetch(cleanedUrl);
      
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
      data = [];
      for (const row of parsed.data) {
        if (!row.id && !row.slug) continue;
        if (!row.name) continue;

        const slug = row.slug || row.id;
        
        // Attempt to load AI-generated local data
        let localData: any = {};
        try {
          const localPath = path.join(process.cwd(), 'src/content/referrals', `${slug}.json`);
          const localContent = await fs.readFile(localPath, 'utf8');
          localData = JSON.parse(localContent);
        } catch (e) {
          // No local file exists yet
        }

        const steps = row.steps ? String(row.steps).split('|').map(s => s.trim()) : [];
        const faq = parseFaqs(row.faq);
        const pros = row.pros ? String(row.pros).split('|').map(s => s.trim()).filter(Boolean) : [];
        const cons = row.cons ? String(row.cons).split('|').map(s => s.trim()).filter(Boolean) : [];
        const detailed_review = row.detailed_review || "";

        data.push({
          id: row.id || row.slug,
          name: row.name,
          slug: slug,
          category: row.category || "Uncategorized",
          referral_link: row.referral_link,
          referral_code: row.referral_code,
          benefit_user: row.benefit_user,
          benefit_owner: row.benefit_owner,
          bonus_amount: row.bonus_amount,
          // Merge logic: If CSV has data, use it. Otherwise, use local AI data.
          steps: steps.length > 0 ? steps : (localData.steps || []),
          faq: faq.length > 0 ? faq : (localData.faq || []),
          pros: pros.length > 0 ? pros : (localData.pros || []),
          cons: cons.length > 0 ? cons : (localData.cons || []),
          detailed_review: detailed_review ? detailed_review : (localData.detailed_review || ""),
          expiry: row.expiry || "2099-12-31T00:00:00.000Z",
          last_checked: new Date().toISOString(),
          status: (row.status as "active" | "expired") || "active",
          is_featured: String(row.is_featured).toLowerCase() === 'true',
        });
      }

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
        last_checked: new Date().toISOString(),
        is_featured: false
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
  const activeReferrals = data.filter(item => item.status === "active" && item.expiry > now);

  // Apply Google Analytics ranking overrides if present
  try {
    const rankingPath = path.join(process.cwd(), "src/data/analytics_ranking.json");
    const rankingContent = await fs.readFile(rankingPath, "utf8");
    const rankingData = JSON.parse(rankingContent);
    const topOffers = rankingData.topOffers || [];

    if (topOffers.length > 0) {
      activeReferrals.sort((a, b) => {
        const indexA = topOffers.indexOf(a.slug);
        const indexB = topOffers.indexOf(b.slug);

        // If both are in the top ranking, sort by ranking index
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        // If only A is in the top ranking, A comes first
        if (indexA !== -1) return -1;
        // If only B is in the top ranking, B comes first
        if (indexB !== -1) return 1;

        // Fallback to spreadsheet featured flag
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
      });

      // Dynamically set the top ranked item as the featured offer
      if (activeReferrals.length > 0 && topOffers.includes(activeReferrals[0].slug)) {
        activeReferrals.forEach(ref => {
          ref.is_featured = ref.slug === activeReferrals[0].slug;
        });
      }
    }
  } catch (error) {
    // Fallback sorting: is_featured first
    activeReferrals.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });
  }

  return activeReferrals;
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

export async function getReferralsByCategory(categorySlug: string): Promise<Referral[]> {
  const all = await getAllReferrals();
  return all.filter(r => r.category.toLowerCase().replace(/\s+/g, '-') === categorySlug.toLowerCase());
}

function parseMarkdownFile(fileContent: string, slug: string): BlogPost {
  const parts = fileContent.split("---");
  const frontmatterText = parts[1] || "";
  const content = parts.slice(2).join("---").trim();

  const metadata: Record<string, string> = {};
  const lines = frontmatterText.split("\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
      metadata[key] = val;
    }
  }

  return {
    slug,
    title: metadata.title || "Untitled",
    description: metadata.description || "",
    date: metadata.date || new Date().toISOString().split("T")[0],
    author: metadata.author || "Anonymous",
    category: metadata.category || "Uncategorized",
    content,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const blogDir = path.join(process.cwd(), "src/content/blog");
  try {
    const files = await fs.readdir(blogDir);
    const posts: BlogPost[] = [];
    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(blogDir, file);
        const fileContent = await fs.readFile(filePath, "utf8");
        const slug = file.replace(/\.md$/, "");
        posts.push(parseMarkdownFile(fileContent, slug));
      }
    }
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error reading blog directory:", error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(process.cwd(), "src/content/blog", `${slug}.md`);
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    return parseMarkdownFile(fileContent, slug);
  } catch (error) {
    console.error(`Error reading blog post: ${slug}`, error);
    return null;
  }
}
