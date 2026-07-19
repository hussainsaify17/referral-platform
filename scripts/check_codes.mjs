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
    console.warn("⚠️ GOOGLE_SHEET_CSV_URL not set in .env.local");
    return [];
  }

  try {
    const response = await fetch(`${cleanedUrl}&_t=${Date.now()}`);
    if (!response.ok) {
      console.warn(`⚠️ Failed to fetch CSV from Google Sheet (HTTP Status: ${response.status})`);
      return [];
    }

    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    return parsed.data.filter(row => row.id && row.name && row.status !== 'expired');
  } catch (error) {
    console.warn("⚠️ Could not fetch live referrals from Google Sheets (No internet connection / DNS failure).");
    console.warn(`  Detail: ${error.message}`);
    return [];
  }
}

async function main() {
  const referrals = await getLiveReferrals();
  
  if (referrals.length === 0) {
    console.log("ℹ️ No active referrals loaded from Google Sheet. Check environment variables.");
    return;
  }
  
  console.log(`🔍 Sync-Checking ${referrals.length} active offers from Google Sheet against local JSON content...`);

  let mismatchCount = 0;
  let missingCount = 0;

  for (const ref of referrals) {
    if (!ref.slug) continue;
    const filePath = path.join(REFERRALS_DIR, `${ref.slug}.json`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      const code = String(ref.referral_code || "").trim();
      const localCode = String(data.referral_code || "").trim();
      
      console.log(`\nReferral: ${ref.name} (${ref.slug})`);
      if (code && code !== '-') {
        if (localCode === code) {
          console.log(`  ✅ Code Matches Sheet: ${code}`);
        } else {
          console.log(`  ❌ MISMATCH: CSV has "${code}" but local JSON has "${localCode}"`);
          mismatchCount++;
        }
      } else {
        console.log(`  ⚠️ No Referral Code required (Link-Only)`);
      }

    } catch (e) {
      console.log(`  ❌ File not found: ${filePath}`);
      missingCount++;
    }
  }

  console.log('\n======================================');
  console.log(`🎉 Validation Complete:`);
  console.log(`❌ Mismatched Codes: ${mismatchCount}`);
  console.log(`❌ Missing JSON Files: ${missingCount}`);
  console.log('======================================\n');
}

main().catch(console.error);
