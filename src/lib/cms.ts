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
  const referralsDir = path.join(process.cwd(), "src/content/referrals");
  let data: Referral[] = [];

  try {
    const files = await fs.readdir(referralsDir);
    for (const file of files) {
      // Exclude test or temporary files, read only json
      if (file.endsWith(".json") && file !== "test.json") {
        const filePath = path.join(referralsDir, file);
        const fileContent = await fs.readFile(filePath, "utf8");
        const referral = JSON.parse(fileContent) as Referral;
        
        // Populate slug and id if they somehow aren't in the JSON
        const slug = referral.slug || file.replace(/\.json$/, "");
        referral.slug = slug;
        referral.id = referral.id || slug;
        
        data.push(referral);
      }
    }
  } catch (error) {
    console.error("Error reading local referrals directory:", error);
    // Fallback to sample referrals if the directory cannot be read
    try {
      const filePath = path.join(process.cwd(), "src/data/sample_referrals.json");
      const fileContents = await fs.readFile(filePath, "utf8");
      data = JSON.parse(fileContents);
    } catch (fallbackError) {
      console.error("Failed to load sample fallback referrals:", fallbackError);
    }
  }

  // Sort referrals: featured first, active before expired, then by analytics if present
  try {
    const rankingPath = path.join(process.cwd(), "src/data/analytics_ranking.json");
    const rankingContent = await fs.readFile(rankingPath, "utf8");
    const rankingData = JSON.parse(rankingContent);
    const topOffers = rankingData.topOffers || [];

    data.sort((a, b) => {
      // 1. Sort by status: active first, then expired
      const isExpiredA = a.status === 'expired' || (a.expiry && new Date(a.expiry) < new Date());
      const isExpiredB = b.status === 'expired' || (b.expiry && new Date(b.expiry) < new Date());
      if (isExpiredA !== isExpiredB) {
        return isExpiredA ? 1 : -1;
      }

      // 2. Sort by analytics ranking
      const indexA = topOffers.indexOf(a.slug);
      const indexB = topOffers.indexOf(b.slug);
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // 3. Sort by featured flag
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });

    // Dynamically set the top active item as featured
    const firstActive = data.find(r => !(r.status === 'expired' || (r.expiry && new Date(r.expiry) < new Date())));
    if (firstActive && topOffers.includes(firstActive.slug)) {
      data.forEach(ref => {
        ref.is_featured = ref.slug === firstActive.slug;
      });
    }
  } catch (error) {
    data.sort((a, b) => {
      const isExpiredA = a.status === 'expired' || (a.expiry && new Date(a.expiry) < new Date());
      const isExpiredB = b.status === 'expired' || (b.expiry && new Date(b.expiry) < new Date());
      if (isExpiredA !== isExpiredB) {
        return isExpiredA ? 1 : -1;
      }
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });
  }

  return data;
}

export async function getActiveReferrals(): Promise<Referral[]> {
  const all = await getAllReferrals();
  const now = new Date();
  return all.filter(item => {
    if (item.status !== "active") return false;
    if (!item.expiry) return true; // active by default if no expiry is set
    try {
      const expiryDate = new Date(item.expiry);
      if (isNaN(expiryDate.getTime())) return true;
      return expiryDate > now;
    } catch {
      return true;
    }
  });
}

export async function getReferralBySlug(slug: string): Promise<Referral | null> {
  const all = await getAllReferrals();
  return all.find(r => r.slug === slug) || null;
}

export async function getCategories(): Promise<string[]> {
  const all = await getActiveReferrals();
  const categories = new Set(all.map(r => r.category));
  return Array.from(categories);
}

export async function getReferralsByCategory(categorySlug: string): Promise<Referral[]> {
  const all = await getActiveReferrals();
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
