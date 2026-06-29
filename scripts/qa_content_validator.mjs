import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import Papa from 'papaparse';

// Load environment variables
dotenv.config({ path: '.env.local' });

const REFERRALS_DIR = path.join(process.cwd(), 'src/content/referrals');

// List of common placeholder patterns to reject
const PLACEHOLDER_PATTERNS = [
  /\[insert/i,
  /\[company/i,
  /\[your/i,
  /YOUR_CODE/i,
  /TODO/i,
  /lorem ipsum/i,
  /placeholder/i,
  /xxxx/i,
  /<insert/i
];

// Basic helper to validate HTML tags are balanced
function hasBalancedTags(html) {
  const stack = [];
  const tagRegex = /<\/?([a-z0-9]+)(?=>|\s)/gi;
  let match;

  // List of self-closing tags to ignore
  const selfClosing = new Set(['img', 'br', 'hr', 'input', 'link', 'meta']);

  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();

    if (selfClosing.has(tagName)) {
      continue;
    }

    if (fullTag.startsWith('</')) {
      // Closing tag
      if (stack.length === 0 || stack.pop() !== tagName) {
        return false; // Mismatched or extra closing tag
      }
    } else {
      // Opening tag
      stack.push(tagName);
    }
  }

  return stack.length === 0; // Stack should be empty if all tags are balanced
}

async function getSheetData() {
  const rawUrl = process.env.GOOGLE_SHEET_CSV_URL || "";
  const cleanedUrl = rawUrl.replace(/^["']|["']$/g, '').trim();

  if (!cleanedUrl) {
    console.warn("⚠️ GOOGLE_SHEET_CSV_URL is missing. Context verification against sheet values will be skipped.");
    return [];
  }

  try {
    const response = await fetch(`${cleanedUrl}&_t=${Date.now()}`);
    if (!response.ok) {
      console.warn(`⚠️ Failed to fetch sheet CSV: ${response.statusText}. Context validation skipped.`);
      return [];
    }
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    return parsed.data || [];
  } catch (err) {
    console.warn(`⚠️ Error fetching spreadsheet: ${err.message}. Context validation skipped.`);
    return [];
  }
}

async function main() {
  console.log("🔍 Running QA Content Validator on referral content...");

  let files;
  try {
    files = await fs.readdir(REFERRALS_DIR);
    files = files.filter(f => f.endsWith('.json'));
  } catch (err) {
    console.error(`❌ Could not read referrals directory: ${err.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log("ℹ️ No referral content JSON files found to validate.");
    process.exit(0);
  }

  const sheetRows = await getSheetData();
  let errorsFound = 0;

  for (const filename of files) {
    const filepath = path.join(REFERRALS_DIR, filename);
    const slug = filename.replace('.json', '');

    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const data = JSON.parse(content);

      console.log(`Checking ${filename}...`);

      // 1. Structural Checks
      const requiredArrays = ['pros', 'cons', 'steps', 'faq'];
      for (const key of requiredArrays) {
        if (!data[key] || !Array.isArray(data[key])) {
          console.error(`  ❌ Error: Missing or invalid array key "${key}"`);
          errorsFound++;
        } else if (data[key].length === 0) {
          console.error(`  ❌ Error: Array "${key}" is empty`);
          errorsFound++;
        }
      }

      if (typeof data.detailed_review !== 'string') {
        console.error(`  ❌ Error: Missing or invalid "detailed_review" string`);
        errorsFound++;
      } else {
        if (data.detailed_review.length < 250) {
          console.error(`  ❌ Error: "detailed_review" is too short (${data.detailed_review.length} chars, min 250)`);
          errorsFound++;
        }
        if (!hasBalancedTags(data.detailed_review)) {
          console.error(`  ❌ Error: "detailed_review" contains unclosed or mismatched HTML tags`);
          errorsFound++;
        }
      }

      // Validate FAQ structure
      if (Array.isArray(data.faq)) {
        data.faq.forEach((item, index) => {
          if (!item.question || !item.answer) {
            console.error(`  ❌ Error: FAQ item at index ${index} is missing question or answer`);
            errorsFound++;
          }
        });
      }

      // 2. Placeholder Leak Checks
      const fullTextToInspect = JSON.stringify(data);
      for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.test(fullTextToInspect)) {
          console.error(`  ❌ Error: Found placeholder leaking matching pattern: ${pattern.toString()}`);
          errorsFound++;
        }
      }

      // 3. Context check against Google Sheet row
      const matchedRow = sheetRows.find(row => {
        const rowSlug = String(row.slug || '').trim();
        return rowSlug === slug;
      });

      if (matchedRow) {
        const refCode = String(matchedRow.referral_code || '').trim();
        if (refCode) {
          const lowerCaseCode = refCode.toLowerCase();
          const hasCodeInReview = data.detailed_review.toLowerCase().includes(lowerCaseCode);
          const hasCodeInSteps = data.steps.some(step => String(step).toLowerCase().includes(lowerCaseCode));

          if (!hasCodeInReview && !hasCodeInSteps) {
            console.error(`  ❌ Error: Active referral code "${refCode}" is not referenced anywhere in detailed_review or steps!`);
            errorsFound++;
          }
        }
      } else {
        console.warn(`  ⚠️ Warning: No matching row found in spreadsheet for slug: "${slug}"`);
      }

    } catch (err) {
      console.error(`  ❌ Error reading or parsing ${filename}: ${err.message}`);
      errorsFound++;
    }
  }

  if (errorsFound > 0) {
    console.error(`\n❌ QA Content Validator failed with ${errorsFound} errors. Blocking compile.`);
    process.exit(1);
  }

  console.log("\n✅ All referral content JSON files passed QA validation successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Unexpected error running QA validator:", err);
  process.exit(1);
});
