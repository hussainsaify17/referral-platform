import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import Papa from 'papaparse';

dotenv.config({ path: '.env.local' });

const BLOGS_DIR = path.join(process.cwd(), 'src/content/blogs');

async function getLiveReferrals() {
  const rawUrl = process.env.GOOGLE_SHEET_CSV_URL || "";
  const cleanedUrl = rawUrl.replace(/^["']|["']$/g, '').trim();

  if (!cleanedUrl) return [];

  const response = await fetch(`${cleanedUrl}&_t=${Date.now()}`);
  if (!response.ok) return [];

  const csvText = await response.text();
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return parsed.data.filter(row => row.id && row.name && row.status !== 'expired');
}

async function main() {
  const referrals = await getLiveReferrals();
  
  for (const ref of referrals) {
    if (!ref.slug) continue;
    const filePath = path.join(BLOGS_DIR, `${ref.slug}.md`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const code = ref.referral_code;
      const link = ref.referral_link;
      
      console.log(`\nBlog: ${ref.name} (${ref.slug})`);
      if (code && content.includes(code)) {
        console.log(`✅ Contains Referral Code: ${code}`);
      } else if (code) {
        console.log(`❌ MISSING Referral Code: ${code}`);
      } else {
        console.log(`⚠️ No Referral Code in CSV`);
      }

    } catch (e) {
      console.log(`❌ File not found: ${filePath}`);
    }
  }
}

main().catch(console.error);
