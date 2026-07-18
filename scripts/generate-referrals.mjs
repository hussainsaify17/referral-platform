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

  // Keep all rows including expired ones so we can synchronize status and metadata
  return parsed.data.filter(row => row.name && row.referral_link);
}

const parseSheetArray = (val) => {
  if (!val) return [];
  const str = String(val).trim();
  if (str.includes('|')) {
    return str.split('|').map(s => s.trim()).filter(Boolean);
  }
  if (str.includes('\n')) {
    return str.split('\n').map(s => s.trim()).filter(Boolean);
  }
  if (str.includes(',')) {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [str];
};

function parseFaqs(faqString) {
  if (!faqString) return [];
  try {
    return JSON.parse(faqString);
  } catch {
    return [];
  }
}

async function generateDataWithGemini(referral) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const prompt = `
You are the world's absolute best personal finance editor, rewards strategist, and conversion copywriter. You write with the authority of a senior editor at Forbes Advisor, Wirecutter, or NerdWallet.
Your task is to generate highly informative, completely original, and deeply engaging content for a referral offer. Avoid all robotic AI buzzwords (e.g., "seamless," "intuitive dashboard," "revolutionized the way," "unlock," "welcome bonus," "elevate," "delve"). Write in a natural, professional, yet conversational human voice that provides maximum information gain.

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
4. "bonus_amount": A short string representing the maximum or standard signup bonus amount (e.g., "₹100", "₹50", "Upto ₹300"). Derive this from the benefit details or use standard industry amounts if unknown.
5. "benefit_owner": A short sentence of what the person sharing the code gets (e.g., "Get ₹50 cashback when your friend completes their first payment"). Use a standard reward if unknown.
6. "pros": An array of 3 to 5 strings listing the biggest advantages of this app. Avoid generic pros; make them highly specific to the service (e.g., instead of "Fast transactions", use "Instant bank settlements via UPI with zero transaction fees").
7. "cons": An array of 2 to 3 strings listing minor drawbacks or things to watch out for (e.g., KYC wait times, account maintenance fees, or high minimum redemption limits).
8. "detailed_review": A comprehensive, well-formatted HTML string containing a full review of the app (aim for 400-600 words of rich content). Write a real, objective critique. Discuss who the app is perfect for, transaction fees/charges (if Demat or banking), features, and tips on how to maximize the reward. Use <h2>, <h3>, <p>, <ul> tags. Do NOT use boilerplate layouts or starting statements like "New to X? You're in for a treat!" or "X: Your Gateway to...". Start directly with an engaging, original intro hook.
9. "steps": An array of strings detailing a foolproof guide on how to claim the bonus. Must include mentioning where to enter the referral code "${referral.referral_code}". Keep the language direct and clear.
10. "faq": An array of objects, each with "question" and "answer" string properties. Provide 3-4 frequently asked questions about this app, its fees, and its bonus.

Respond ONLY with valid JSON. Do not use markdown code blocks like \`\`\`json. Just the raw JSON object.
`;

  const maxRetries = 3;
  let attempt = 0;
  let response;

  while (attempt < maxRetries) {
    attempt++;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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

      if (response.ok) {
        break; // Success
      }

      const status = response.status;
      const errorData = await response.json().catch(() => ({}));
      console.warn(`⚠️ Gemini API attempt ${attempt} failed with status ${status}: ${JSON.stringify(errorData)}`);

      if ((status === 503 || status === 429) && attempt < maxRetries) {
        const delay = attempt * 3000;
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error(`Gemini API Error: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      if (attempt >= maxRetries) {
        throw err;
      }
      const delay = attempt * 3000;
      console.warn(`⚠️ Request error on attempt ${attempt}: ${err.message}. Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
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
  const processedSlugs = new Set();

  for (const ref of referrals) {
    const tempSlug = ref.slug || ref.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-referral-code';
    processedSlugs.add(tempSlug);

    const localPath = path.join(REFERRALS_DIR, `${tempSlug}.json`);
    let localData = {};
    try {
      const localContent = await fs.readFile(localPath, 'utf8');
      localData = JSON.parse(localContent);
    } catch (e) {
      // File doesn't exist yet
    }

    const isExpired = ref.status === 'expired' || (ref.expiry && new Date(ref.expiry) < new Date());

    // 1. Handle expired referrals immediately (update status and fields, bypass Gemini)
    if (isExpired) {
      console.log(`🚫 Syncing expired offer: "${ref.name || tempSlug}"`);
      const completeData = {
        id: ref.id || localData.id || tempSlug,
        name: ref.name || localData.name || "Unnamed Offer",
        slug: tempSlug,
        category: ref.category || localData.category || "Services",
        referral_link: ref.referral_link || localData.referral_link || "",
        referral_code: ref.referral_code || localData.referral_code || "",
        benefit_user: ref.benefit_user || localData.benefit_user || "",
        benefit_owner: ref.benefit_owner || localData.benefit_owner || "",
        bonus_amount: ref.bonus_amount || localData.bonus_amount || "",
        expiry: ref.expiry || localData.expiry || "",
        status: "expired",
        is_featured: String(ref.is_featured).toLowerCase() === 'true' || localData.is_featured === true,
        last_checked: new Date().toISOString(),
        last_verified: localData.last_verified || ref.last_verified || "",
        verified_by: localData.verified_by || ref.verified_by || "",
        pros: parseSheetArray(ref.pros).length > 0 ? parseSheetArray(ref.pros) : (localData.pros || []),
        cons: parseSheetArray(ref.cons).length > 0 ? parseSheetArray(ref.cons) : (localData.cons || []),
        steps: parseSheetArray(ref.steps).length > 0 ? parseSheetArray(ref.steps) : (localData.steps || []),
        faq: parseFaqs(ref.faq).length > 0 ? parseFaqs(ref.faq) : (localData.faq || []),
        detailed_review: ref.detailed_review || localData.detailed_review || ""
      };
      await fs.writeFile(localPath, JSON.stringify(completeData, null, 2), 'utf-8');
      continue;
    }

    // 2. Identify missing metadata for active referrals
    const sheetPros = parseSheetArray(ref.pros);
    const sheetCons = parseSheetArray(ref.cons);
    const sheetSteps = parseSheetArray(ref.steps);
    const sheetFaq = parseFaqs(ref.faq);

    const isMissingName = !ref.name || String(ref.name).trim().length === 0;
    const isMissingCategory = !ref.category || String(ref.category).trim().length === 0;
    const isMissingBenefit = !ref.benefit_user || String(ref.benefit_user).trim().length === 0;
    const isMissingBonus = !ref.bonus_amount || String(ref.bonus_amount).trim().length === 0;
    const isMissingBenefitOwner = !ref.benefit_owner || String(ref.benefit_owner).trim().length === 0;
    
    const hasPros = sheetPros.length > 0 || (localData.pros && localData.pros.length > 0);
    const hasReview = (ref.detailed_review && String(ref.detailed_review).trim().length > 0) || (localData.detailed_review && String(localData.detailed_review).trim().length > 0);

    const localHasData = localData.detailed_review && localData.detailed_review.length > 0;
    let localHasCorrectCode = false;
    if (localHasData && ref.referral_code) {
      const lowerCode = String(ref.referral_code).toLowerCase();
      const hasCodeInReview = (localData.detailed_review || "").toLowerCase().includes(lowerCode);
      const hasCodeInSteps = (localData.steps || []).some(step => String(step).toLowerCase().includes(lowerCode));
      if (hasCodeInReview || hasCodeInSteps) {
        localHasCorrectCode = true;
      }
    }

    const needsGemini = isMissingName || isMissingCategory || isMissingBenefit || isMissingBonus || isMissingBenefitOwner || (!hasPros && !hasReview && (!localHasData || !localHasCorrectCode)) || !localHasCorrectCode;
    const needsSheetUpdate = isMissingName || isMissingCategory || isMissingBenefit || isMissingBonus || isMissingBenefitOwner || !hasPros || !hasReview || !localHasCorrectCode;

    let generated = null;
    let finalName = ref.name;
    let finalSlug = tempSlug;
    let finalId = ref.id;
    let finalCategory = ref.category;
    let finalBenefit = ref.benefit_user;
    let finalBonus = ref.bonus_amount;
    let finalBenefitOwner = ref.benefit_owner;

    try {
      if (needsGemini) {
        if (!process.env.GEMINI_API_KEY) {
          console.warn("GEMINI_API_KEY missing. Skipping generation.");
          continue;
        }

        console.log(`✨ Processing & Generating details for offer code: ${ref.referral_code}...`);
        generated = await generateDataWithGemini(ref);

        finalName = ref.name || generated.name || "Unnamed Offer";
        finalSlug = tempSlug;
        finalId = ref.id || localData.id || `ref_${Math.random().toString(36).substring(2, 9)}`;
        finalCategory = ref.category || generated.category || "Services";
        finalBenefit = ref.benefit_user || generated.benefit_user || "Claim signup bonus";
        finalBonus = ref.bonus_amount || generated.bonus_amount || "Welcome Reward";
        finalBenefitOwner = ref.benefit_owner || generated.benefit_owner || "Referrer reward";

        // Save complete schema object locally
        const completeData = {
          id: finalId,
          name: finalName,
          slug: finalSlug,
          category: finalCategory,
          referral_link: ref.referral_link,
          referral_code: ref.referral_code || "",
          benefit_user: finalBenefit,
          benefit_owner: finalBenefitOwner,
          bonus_amount: finalBonus,
          expiry: ref.expiry || localData.expiry || "2099-12-31T00:00:00.000Z",
          status: "active",
          is_featured: String(ref.is_featured).toLowerCase() === 'true' || localData.is_featured === true,
          last_checked: new Date().toISOString(),
          last_verified: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          verified_by: "ReferBenefits Team",
          pros: generated.pros || [],
          cons: generated.cons || [],
          steps: generated.steps || [],
          faq: generated.faq || [],
          detailed_review: generated.detailed_review || ""
        };

        await fs.writeFile(localPath, JSON.stringify(completeData, null, 2), 'utf-8');
        await new Promise(r => setTimeout(r, 5000));
      } else {
        // Sync local details with Google Sheet updates
        console.log(`📦 Syncing existing local details for offer "${ref.name || tempSlug}"...`);
        const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        
        finalName = ref.name || localData.name || "Unnamed Offer";
        finalSlug = tempSlug;
        finalId = ref.id || localData.id || `ref_${Math.random().toString(36).substring(2, 9)}`;
        
        const completeData = {
          id: finalId,
          name: finalName,
          slug: finalSlug,
          category: ref.category || localData.category || "Services",
          referral_link: ref.referral_link || localData.referral_link || "",
          referral_code: ref.referral_code || localData.referral_code || "",
          benefit_user: ref.benefit_user || localData.benefit_user || "",
          benefit_owner: ref.benefit_owner || localData.benefit_owner || "",
          bonus_amount: ref.bonus_amount || localData.bonus_amount || "",
          expiry: ref.expiry || localData.expiry || "2099-12-31T00:00:00.000Z",
          status: "active",
          is_featured: String(ref.is_featured).toLowerCase() === 'true' || localData.is_featured === true,
          last_checked: new Date().toISOString(),
          last_verified: localData.last_verified || ref.last_verified || currentMonthYear,
          verified_by: (localData.verified_by === "Hussain" ? "ReferBenefits Team" : (localData.verified_by || ref.verified_by || "ReferBenefits Team")),
          pros: sheetPros.length > 0 ? sheetPros : (localData.pros || []),
          cons: sheetCons.length > 0 ? sheetCons : (localData.cons || []),
          steps: sheetSteps.length > 0 ? sheetSteps : (localData.steps || []),
          faq: sheetFaq.length > 0 ? sheetFaq : (localData.faq || []),
          detailed_review: ref.detailed_review || localData.detailed_review || ""
        };

        await fs.writeFile(localPath, JSON.stringify(completeData, null, 2), 'utf-8');

        if (needsSheetUpdate) {
          generated = {
            name: finalName,
            category: completeData.category,
            benefit_user: completeData.benefit_user,
            bonus_amount: completeData.bonus_amount,
            benefit_owner: completeData.benefit_owner,
            last_verified: completeData.last_verified,
            verified_by: completeData.verified_by,
            pros: completeData.pros,
            cons: completeData.cons,
            detailed_review: completeData.detailed_review,
            steps: completeData.steps,
            faq: completeData.faq
          };
          finalCategory = completeData.category;
          finalBenefit = completeData.benefit_user;
          finalBonus = completeData.bonus_amount;
          finalBenefitOwner = completeData.benefit_owner;
        }
      }

      // Write updates back to Google Sheets via webhook if needed
      if (webhookUrl && generated && needsSheetUpdate) {
        console.log(`✉️ Sending updates for "${finalName}" to Google Sheets...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        try {
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              type: 'update_referral',
              referral_code: ref.referral_code,
              referral_link: ref.referral_link,
              id: ref.id,
              updates: {
                id: finalId,
                name: finalName,
                slug: finalSlug,
                category: finalCategory,
                benefit_user: finalBenefit,
                bonus_amount: finalBonus,
                benefit_owner: finalBenefitOwner,
                status: ref.status || 'active',
                expiry: ref.expiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                is_featured: ref.is_featured || 'FALSE',
                last_verified: generated.last_verified || '',
                verified_by: generated.verified_by || '',
                pros: (generated.pros || []).join(', '),
                cons: (generated.cons || []).join(', '),
                detailed_review: generated.detailed_review || '',
                steps: (generated.steps || []).join('\n'),
                faq: JSON.stringify(generated.faq || [])
              }
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          const resText = await res.text();
          if (!res.ok) {
            console.error(`⚠️ Failed to update Google Sheet: ${res.statusText}`);
          } else {
            console.log(`✅ Google Sheet updated successfully for "${finalName}"! Response: ${resText}`);
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.error(`⚠️ Webhook request failed or timed out for "${finalName}":`, fetchErr.message);
        }
        
        updatedCount++;
        await new Promise(r => setTimeout(r, 1500));
      }
    } catch (err) {
      console.error(`❌ Failed to process referral:`, err.message);
    }
  }

  // 3. Clean up orphaned local files
  console.log("🧹 Cleaning up orphaned local files...");
  try {
    const files = await fs.readdir(REFERRALS_DIR);
    for (const file of files) {
      if (file.endsWith('.json') && file !== 'test.json') {
        const slug = file.replace('.json', '');
        if (!processedSlugs.has(slug)) {
          console.log(`🗑️ Deleting orphan referral file: ${file}`);
          await fs.unlink(path.join(REFERRALS_DIR, file));
        }
      }
    }
  } catch (err) {
    console.error("❌ Failed to clean up orphaned local files:", err.message);
  }

  if (updatedCount > 0) {
    console.log(`Successfully generated and synchronized ${updatedCount} referral profiles.`);
  } else {
    console.log("All referrals are fully populated and synchronized!");
  }

  // 4. Compile public/recommendations.json (excluding expired ones)
  try {
    const activeOffers = [];
    const today = new Date();

    for (const ref of referrals) {
      const finalName = ref.name || "Unnamed Offer";
      const finalSlug = ref.slug || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-referral-code';
      
      const isExpired = ref.status === 'expired' || (ref.expiry && new Date(ref.expiry) < today);
      if (isExpired) continue;

      let localData = {};
      try {
        const localPath = path.join(REFERRALS_DIR, `${finalSlug}.json`);
        const localContent = await fs.readFile(localPath, 'utf8');
        localData = JSON.parse(localContent);
      } catch (e) {
        // file not found
      }

      activeOffers.push({
        name: finalName,
        slug: finalSlug,
        category: ref.category || localData.category || "Services",
        benefit_user: ref.benefit_user || "Claim signup bonus",
        bonus_amount: ref.bonus_amount || localData.bonus_amount || "Welcome Reward",
        benefit_owner: ref.benefit_owner || localData.benefit_owner || "Referrer reward",
        referral_code: ref.referral_code,
        referral_link: ref.referral_link,
        last_verified: localData.last_verified || ref.last_verified || "",
        verified_by: localData.verified_by || ref.verified_by || "",
        expiry: ref.expiry || ""
      });
    }

    const publicDir = path.join(process.cwd(), 'public');
    await fs.mkdir(publicDir, { recursive: true });
    const recommendationsPath = path.join(publicDir, 'recommendations.json');
    await fs.writeFile(
      recommendationsPath,
      JSON.stringify({
        lastUpdated: new Date().toISOString(),
        totalOffers: activeOffers.length,
        offers: activeOffers
      }, null, 2),
      'utf-8'
    );
    console.log(`✅ Recommendations compiled successfully to public/recommendations.json (${activeOffers.length} offers)`);
  } catch (err) {
    console.error("❌ Failed to compile public/recommendations.json:", err.message);
  }
}

main().catch(console.error);
