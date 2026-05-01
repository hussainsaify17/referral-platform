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
Your task is to write a comprehensive, engaging, highly informative, and human-sounding long-form blog post about the ${referral.name} app and its referral code / sign-up bonus.

Here is the data you have about the referral:
- Name: ${referral.name}
- Category: ${referral.category}
- What the new user gets: ${referral.benefit_user}
- What the referrer gets: ${referral.benefit_owner}
- Bonus Amount (if explicit): ${referral.bonus_amount || 'N/A'}
- Referral Code (if available): ${referral.referral_code || 'N/A'}
- Referral Link (if available): ${referral.referral_link || 'N/A'}

To ensure the content passes every SEO benchmark and provides immense value, your article MUST cover the following:
1. **Introduction & What it does:** Explain clearly what ${referral.name} is, its core features, and the primary problem it solves.
2. **Pros of the product:** What are the biggest advantages of using ${referral.name} compared to alternatives?
3. **How it makes life easier (Use cases & What people are saying):** Detail specific everyday use cases. Share thoughts on how real users benefit from it and why people love it (social proof). 
4. **The Sign-Up Bonus:** Clearly explain the sign-up bonus (${referral.benefit_user}) and how lucrative it is.
5. **Step-by-step Guide & Referral Injection:** A highly detailed, foolproof guide on how to claim the bonus. **CRUCIAL:** You must organically and conversationally weave the exact Referral Code (${referral.referral_code || 'the provided code'}) and/or Referral Link (${referral.referral_link || 'the provided link'}) into the article (e.g., "Just enter the code **${referral.referral_code || 'XYZ'}** when signing up", or "Click [here](${referral.referral_link || '#'}) to download the app"). Do this naturally so it pleases Google crawlers and doesn't look spammy.
6. **SEO Optimization:** Naturally weave in high-intent keywords like "${referral.name} referral code", "${referral.name} sign up bonus", "${referral.name} review", and "free ${referral.name} rewards".

Write the blog post entirely in Markdown format. Follow these rules:
- Do not include a main H1 (# ) title in the markdown, as the webpage will render its own H1. Start with H2s (## ) or introductory paragraphs.
- Make it read naturally, like a human expert wrote it. Avoid repetitive or robotic AI structures. 
- Use rich formatting: bolding, bullet points, numbered lists, and short scannable paragraphs.
- Do not include any placeholder text. Make it an evergreen post.

Output ONLY the markdown content. Do not include any conversational intro or outro.
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
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
        
        // Wait 5 seconds to avoid rate limits
        await new Promise(r => setTimeout(r, 5000));
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
