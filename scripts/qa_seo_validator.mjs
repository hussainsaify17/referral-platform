import fs from 'fs/promises';
import path from 'path';

async function getHtmlFiles(dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const file of list) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(await getHtmlFiles(res));
    } else if (file.name.endsWith('.html')) {
      results.push(res);
    }
  }
  return results;
}

async function validateSeo() {
  const outDir = path.resolve(process.cwd(), 'out');
  console.log(`🔍 Scanning all built HTML pages in ${outDir} for SEO validation...`);
  
  let files;
  try {
    files = await getHtmlFiles(outDir);
  } catch (err) {
    console.error(`❌ Could not read build output directory. Make sure to run 'npm run build' first.`);
    process.exit(1);
  }

  let totalPages = files.length;
  let passedCount = 0;
  let errors = [];

  for (const file of files) {
    const relativePath = path.relative(outDir, file);
    
    // Skip internal error pages & diagnostic tools
    if (
      relativePath.includes('404.html') || 
      relativePath.includes('500.html') ||
      relativePath.includes('analytics-dashboard.html')
    ) {
      passedCount++;
      continue;
    }

    const html = await fs.readFile(file, 'utf-8');
    const pageErrors = [];

    // 1. Validate Title Tag
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      pageErrors.push('Missing or empty <title> tag');
    }

    // 2. Validate Meta Description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i) || 
                      html.match(/<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["']/i);
    if (!descMatch || !descMatch[1].trim()) {
      pageErrors.push('Missing or empty meta description');
    }

    // 3. Validate Canonical Link Tag
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([\s\S]*?)["']/i) ||
                           html.match(/<link\s+href=["']([\s\S]*?)["']\s+rel=["']canonical["']/i);
    if (!canonicalMatch || !canonicalMatch[1].trim()) {
      pageErrors.push('Missing or empty canonical link tag');
    } else {
      const canonicalUrl = canonicalMatch[1];
      // Ensure the canonical matches the path structure (trailing slash)
      if (!canonicalUrl.endsWith('/')) {
        pageErrors.push(`Canonical URL missing trailing slash: ${canonicalUrl}`);
      }
    }

    // 4. Validate H1 tag
    const h1Count = (html.match(/<h1/gi) || []).length;
    if (h1Count === 0) {
      pageErrors.push('Missing <h1> heading tag');
    } else if (h1Count > 1) {
      pageErrors.push(`Multiple <h1> tags found (${h1Count})`);
    }

    if (pageErrors.length > 0) {
      errors.push({ path: relativePath, reasons: pageErrors });
      console.log(`❌ Fail: /${relativePath.replace(/index\.html$/, '')} - ${pageErrors.join(', ')}`);
    } else {
      passedCount++;
    }
  }

  console.log('\n======================================');
  console.log(`🎉 Scan Complete: Checked ${totalPages} HTML pages.`);
  console.log(`✅ Passed: ${passedCount} pages`);
  console.log(`❌ Failed: ${errors.length} pages`);
  console.log('======================================\n');

  if (errors.length > 0) {
    process.exit(1);
  }
}

validateSeo();
