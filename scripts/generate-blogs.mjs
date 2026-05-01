import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import Papa from 'papaparse';

dotenv.config({ path: '.env.local' });

const METADATA_PATH = path.join(process.cwd(), 'src/content/blogs/metadata.json');
const BLOGS_DIR = path.join(process.cwd(), 'src/content/blogs');

const TEN_DAYS_IN_MS = 10 * 24 * 60 * 60 * 1000;

async function getLiveReferrals() {
  const rawUrl = process.env.GOOGLE_SHEET_CSV_URL || "";
  const cleanedUrl = rawUrl.replace(/^["']|["']$/g, '').trim();

  if (!cleanedUrl) {
    console.warn("No GOOGLE_SHEET_CSV_URL found. Cannot generate blogs.");
    return [];
  }

  const response = await fetch(`${cleanedUrl}&_t=${Date.now()}`);
  if (!response.ok) {
    console.error(`Failed to fetch CSV: ${response.statusText}`);
    return [];
  }

  const csvText = await response.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.filter(row => row.id && row.name && row.status !== 'expired');
}

async function generateBlogWithGemini(referral) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const prompt = `
You are an expert SEO copywriter and personal finance/rewards blogger.
Write a comprehensive, engaging, and human-sounding long-form blog post about the ${referral.name} referral code / sign-up bonus.

Here is the data you have about the referral:
- Name: ${referral.name}
- Category: ${referral.category}
- What the user gets: ${referral.benefit_user}
- What the referrer gets: ${referral.benefit_owner}
- Bonus Amount (if explicit): ${referral.bonus_amount || 'N/A'}

Write the blog post in Markdown format. Follow these rules:
1. Do not include a main H1 (# ) title in the markdown, as the webpage will render its own H1. Start with H2s (## ) or introductory paragraphs.
2. Make it read naturally, avoiding robotic patterns. Use formatting like bolding, bullet points, and short paragraphs.
3. Structure it well: Introduction, Why choose ${referral.name}, How to claim the bonus, Step-by-step guide, and Conclusion.
4. Naturally insert keywords like "${referral.name} referral code", "${referral.name} sign up bonus", "free ${referral.name} rewards".
5. Do not include any placeholder text (like "[Insert Date Here]"). Ensure it reads as an evergreen post.

Output ONLY the markdown content. No conversational intro/outro.
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API Error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error("No content returned from Gemini");
  }

  return content.trim();
}

async function main() {
  console.log("Checking for blog updates...");

  // Ensure directory exists
  await fs.mkdir(BLOGS_DIR, { recursive: true });

  let metadata = {};
  try {
    const metaStr = await fs.readFile(METADATA_PATH, 'utf-8');
    metadata = JSON.parse(metaStr);
  } catch (e) {
    console.log("No existing metadata.json found, creating a new one.");
  }

  const referrals = await getLiveReferrals();
  if (!referrals.length) {
    console.log("No valid referrals found to process.");
    return;
  }

  let updatedCount = 0;

  for (const ref of referrals) {
    const slug = ref.slug;
    if (!slug) continue;

    const existingMeta = metadata[slug];
    const now = Date.now();
    const needsGeneration = !existingMeta || (now - existingMeta.lastGenerated > TEN_DAYS_IN_MS);

    if (needsGeneration) {
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY missing. Skipping blog generation.");
        break;
      }
      
      console.log(`Generating blog for: ${ref.name} (${slug})...`);
      
      try {
        const markdown = await generateBlogWithGemini(ref);
        const filePath = path.join(BLOGS_DIR, `${slug}.md`);
        await fs.writeFile(filePath, markdown, 'utf-8');
        
        metadata[slug] = {
          lastGenerated: now,
        };
        updatedCount++;
        
        // Wait 2 seconds to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`Failed to generate blog for ${slug}:`, err.message);
      }
    }
  }

  if (updatedCount > 0) {
    await fs.writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf-8');
    console.log(`Successfully generated/updated ${updatedCount} blogs.`);
  } else {
    console.log("All blogs are up to date.");
  }
}

main().catch(console.error);
