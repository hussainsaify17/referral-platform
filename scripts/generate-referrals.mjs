import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import Papa from 'papaparse';

dotenv.config({ path: '.env.local' });

const REFERRALS_DIR = path.join(process.cwd(), 'src/content/referrals');

async function getLiveReferrals() {
  const rawUrl = process.env.GOOGLE_SHEET_CSV_URL || "";
  const cleanedUrl = rawUrl.replace(/^["']|["']$/g, '').trim();

  if (!cleanedUrl) {
    console.warn("No GOOGLE_SHEET_CSV_URL found. Cannot generate referral data.");
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

  // Mandatory fields: name, referral_link, and referral_code must be provided
  return parsed.data.filter(row => row.name && row.referral_code && row.referral_link && row.status !== 'expired');
}

async function generateDataWithGemini(referral) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const prompt = `
You are an expert SEO copywriter and personal finance/rewards analyst.
Your task is to generate comprehensive, highly-informative structured data for a referral offer.

Here is the raw data we have:
- Referral Link: ${referral.referral_link || ''}
- Referral Code: ${referral.referral_code || ''}
- Brand Name (if known): ${referral.name || ''}
- Category (if known): ${referral.category || ''}
- What the user gets (if known): ${referral.benefit_user || ''}

Please provide a JSON object containing EXACTLY these keys:
1. "name": The clean brand name of the company/app (e.g. "Google Pay", "CRED", "Zomato"). If not provided above, derive it intelligently from the referral link.
2. "category": The most appropriate category (choose from: "Fintech", "Food", "Shopping", "Travel", "Entertainment", "Services"). If not provided above, choose the best fit.
3. "benefit_user": A short, catchy, action-oriented sentence of what the new user gets upon signing up (e.g., "Get ₹100 cashback on your first payment"). If not provided above, estimate/derive a standard reward.
4. "pros": An array of 3 to 5 strings listing the biggest advantages of this app.
5. "cons": An array of 2 to 3 strings listing minor drawbacks or things to watch out for.
6. "detailed_review": A comprehensive, well-formatted HTML string containing a full review of the app, why people love it, and how to maximize the sign-up bonus. Use <h2>, <h3>, <p>, <ul> tags.
7. "steps": An array of strings detailing a foolproof guide on how to claim the bonus. Must include mentioning where to enter the referral code "${referral.referral_code}".
8. "faq": An array of objects, each with "question" and "answer" string properties. Provide 3-4 frequently asked questions about this app and its bonus.

Respond ONLY with valid JSON. Do not use markdown code blocks like \`\`\`json. Just the raw JSON object.
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
  let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error("No content returned from Gemini");
  }

  content = content.trim();
  if (content.startsWith('\`\`\`json')) {
    content = content.replace(/^\`\`\`json/g, '').replace(/\`\`\`$/g, '').trim();
  } else if (content.startsWith('\`\`\`')) {
    content = content.replace(/^\`\`\`/g, '').replace(/\`\`\`$/g, '').trim();
  }

  return JSON.parse(content);
}

async function main() {
  console.log("Checking for missing referral SEO data and updating Google Sheets...");

  await fs.mkdir(REFERRALS_DIR, { recursive: true });

  const referrals = await getLiveReferrals();
  if (!referrals.length) {
    console.log("No valid referrals found to process.");
    return;
  }

  const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK || "";
  let updatedCount = 0;

  for (const ref of referrals) {
    // 1. Identify missing metadata
    const isMissingName = !ref.name || String(ref.name).trim().length === 0;
    const isMissingCategory = !ref.category || String(ref.category).trim().length === 0;
    const isMissingBenefit = !ref.benefit_user || String(ref.benefit_user).trim().length === 0;
    const hasPros = ref.pros && String(ref.pros).trim().length > 0;
    const hasReview = ref.detailed_review && String(ref.detailed_review).trim().length > 0;

    // Check if we already have local files for this offer
    const tempSlug = ref.slug || ref.id || `temp_${Math.random().toString(36).substring(2, 9)}`;
    const localPath = path.join(REFERRALS_DIR, `${tempSlug}.json`);
    let localData = {};
    try {
      const localContent = await fs.readFile(localPath, 'utf8');
      localData = JSON.parse(localContent);
    } catch (e) {
      // File doesn't exist yet
    }

    const localHasData = localData.detailed_review && localData.detailed_review.length > 0;

    // We trigger generation if we are missing either basic metadata (name/category/benefit) OR rich SEO content
    if (isMissingName || isMissingCategory || isMissingBenefit || (!hasPros && !hasReview && !localHasData)) {
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY missing. Skipping generation.");
        break;
      }

      console.log(`✨ Processing & Generating details for offer code: ${ref.referral_code}...`);

      try {
        const generated = await generateDataWithGemini(ref);

        // Derive name and slug
        const finalName = ref.name || generated.name || "Unnamed Offer";
        const finalSlug = ref.slug || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-referral-code';
        const finalId = ref.id || `ref_${Math.random().toString(36).substring(2, 9)}`;
        const finalCategory = ref.category || generated.category || "Services";
        const finalBenefit = ref.benefit_user || generated.benefit_user || "Claim signup bonus";

        // Save local JSON file for build-time static generation
        const actualLocalPath = path.join(REFERRALS_DIR, `${finalSlug}.json`);
        const richData = {
          pros: generated.pros || [],
          cons: generated.cons || [],
          detailed_review: generated.detailed_review || "",
          steps: generated.steps || [],
          faq: generated.faq || []
        };
        await fs.writeFile(actualLocalPath, JSON.stringify(richData, null, 2), 'utf-8');

        // Write the data directly back to Google Sheets via webhook
        if (webhookUrl) {
          console.log(`✉️ Sending updates for "${finalName}" to Google Sheets...`);
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              type: 'update_referral',
              referral_code: ref.referral_code,
              referral_link: ref.referral_link,
              id: ref.id, // send if it exists
              updates: {
                id: finalId,
                name: finalName,
                slug: finalSlug,
                category: finalCategory,
                benefit_user: finalBenefit,
                status: ref.status || 'active',
                expiry: ref.expiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                is_featured: ref.is_featured || 'FALSE',
                pros: (generated.pros || []).join(', '),
                cons: (generated.cons || []).join(', '),
                detailed_review: generated.detailed_review || '',
                steps: (generated.steps || []).join('\n'),
                faq: JSON.stringify(generated.faq || [])
              }
            })
          });

          if (!res.ok) {
            console.error(`⚠️ Failed to update Google Sheet: ${res.statusText}`);
          } else {
            console.log(`✅ Google Sheet updated successfully for "${finalName}"!`);
          }
        }

        updatedCount++;
        // Wait 5 seconds to avoid Gemini rate limits
        await new Promise(r => setTimeout(r, 5000));
      } catch (err) {
        console.error(`❌ Failed to process referral:`, err.message);
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`Successfully generated and synchronized ${updatedCount} referral profiles.`);
  } else {
    console.log("All referrals are fully populated and synchronized!");
  }
}

main().catch(console.error);
