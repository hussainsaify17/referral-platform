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

  return parsed.data.filter(row => row.id && row.name && row.status !== 'expired');
}

async function generateDataWithGemini(referral) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const prompt = `
You are an expert SEO copywriter and personal finance/rewards analyst.
Your task is to generate comprehensive, highly-informative structured data for the ${referral.name} app.

Here is the data you have about the referral:
- Name: ${referral.name}
- Category: ${referral.category}
- What the new user gets: ${referral.benefit_user}

Please provide a JSON object containing EXACTLY these keys:
1. "pros": An array of 3 to 5 strings listing the biggest advantages of this app.
2. "cons": An array of 2 to 3 strings listing minor drawbacks or things to watch out for.
3. "detailed_review": A comprehensive, well-formatted HTML string containing a full review of the app, why people love it, and how to maximize the sign-up bonus. Use <h2>, <h3>, <p>, <ul> tags.
4. "steps": An array of strings detailing a foolproof guide on how to claim the bonus. Must include mentioning where to enter the referral code if applicable.
5. "faq": An array of objects, each with "question" and "answer" string properties. Provide 3-4 frequently asked questions about this app and its bonus.

Respond ONLY with valid JSON. Do not use markdown code blocks like \`\`\`json. Just the raw JSON object.
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
  console.log("Checking for missing referral SEO data...");

  await fs.mkdir(REFERRALS_DIR, { recursive: true });

  const referrals = await getLiveReferrals();
  if (!referrals.length) {
    console.log("No valid referrals found to process.");
    return;
  }

  let updatedCount = 0;

  for (const ref of referrals) {
    const slug = ref.slug || ref.id;
    if (!slug) continue;

    const hasPros = ref.pros && String(ref.pros).trim().length > 0;
    const hasCons = ref.cons && String(ref.cons).trim().length > 0;
    const hasReview = ref.detailed_review && String(ref.detailed_review).trim().length > 0;
    
    let localData = {};
    const localPath = path.join(REFERRALS_DIR, `${slug}.json`);
    try {
      const localContent = await fs.readFile(localPath, 'utf8');
      localData = JSON.parse(localContent);
    } catch (e) {
      // File doesn't exist yet
    }

    const localHasData = localData.detailed_review && localData.detailed_review.length > 0;
    
    // If CSV lacks the data AND we don't have local data, generate it
    if (!hasPros && !hasReview && !localHasData) {
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY missing. Skipping generation.");
        break;
      }
      
      console.log(`Generating SEO data for: ${ref.name} (${slug})...`);
      
      try {
        const generatedJson = await generateDataWithGemini(ref);
        await fs.writeFile(localPath, JSON.stringify(generatedJson, null, 2), 'utf-8');
        updatedCount++;
        
        // Wait 5 seconds to avoid rate limits
        await new Promise(r => setTimeout(r, 5000));
      } catch (err) {
        console.error(`Failed to generate data for ${slug}:`, err.message);
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`Successfully generated ${updatedCount} referral profiles.`);
  } else {
    console.log("All referrals are fully populated!");
  }
}

main().catch(console.error);
