import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { initWasm, Resvg } from '@resvg/resvg-wasm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const fontPath = path.join(__dirname, 'Inter-Bold.ttf');

async function ensureFont() {
  if (fs.existsSync(fontPath)) return;
  console.log('📥 Downloading Inter-Bold font for social card typography...');
  const fontUrl = 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf';
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(fontPath);
    https.get(fontUrl, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ Font downloaded successfully.');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(fontPath, () => {});
      reject(err);
    });
  });
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(text, maxLen = 65) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '...';
}

function wrapTextToLines(text, maxCharsPerLine = 32, maxLines = 2) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (lines.length + 1 >= maxLines) {
        const remaining = (currentLine + ' ' + word).trim();
        lines.push(truncate(remaining, maxCharsPerLine));
        return lines;
      }
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine && lines.length <= maxLines) {
    lines.push(currentLine);
  }
  return lines;
}

function getBrandPalette(name = '', category = '') {
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  if (n.includes('cred')) {
    return { main: '#FFFFFF', accent: '#38BDF8', gradient: ['#0F172A', '#1E1B4B', '#020617'], glow: '#38BDF8', badge: '#38BDF8', tag: 'CRED EXCLUSIVE' };
  }
  if (n.includes('zomato')) {
    return { main: '#E11D48', accent: '#FB7185', gradient: ['#881337', '#4C0519', '#0F172A'], glow: '#F43F5E', badge: '#FB7185', tag: 'FOOD DISCOUNTS' };
  }
  if (n.includes('slice')) {
    return { main: '#8B5CF6', accent: '#C084FC', gradient: ['#3B0764', '#1E1B4B', '#090D16'], glow: '#A855F7', badge: '#C084FC', tag: 'CREDIT & CASHBACK' };
  }
  if (n.includes('jupiter')) {
    return { main: '#0EA5E9', accent: '#38BDF8', gradient: ['#0369A1', '#0C4A6E', '#090D16'], glow: '#0EA5E9', badge: '#38BDF8', tag: 'BANKING REWARDS' };
  }
  if (n.includes('ajio')) {
    return { main: '#EC4899', accent: '#F472B6', gradient: ['#831843', '#500724', '#090D16'], glow: '#EC4899', badge: '#F472B6', tag: 'FASHION SAVINGS' };
  }
  if (c.includes('food')) {
    return { main: '#F97316', accent: '#FDBA74', gradient: ['#7C2D12', '#431407', '#090D16'], glow: '#F97316', badge: '#FDBA74', tag: 'FOOD & DINING' };
  }
  if (c.includes('trading') || c.includes('demat')) {
    return { main: '#10B981', accent: '#6EE7B7', gradient: ['#064E3B', '#022C22', '#090D16'], glow: '#10B981', badge: '#6EE7B7', tag: 'DEMAT & TRADING' };
  }
  return { main: '#6366F1', accent: '#818CF8', gradient: ['#1E1B4B', '#312E81', '#090D16'], glow: '#6366F1', badge: '#818CF8', tag: 'FINTECH & SAVINGS' };
}

function buildOfferSvg(name, category, bonus, benefit, isLight = false) {
  const p = getBrandPalette(name, category);
  const safeName = escapeXml(name);
  const initial = escapeXml(name.charAt(0).toUpperCase());
  const safeTag = escapeXml(p.tag);
  const safeBonus = escapeXml(bonus ? `CLAIM ${bonus} BONUS` : 'VERIFIED SIGN-UP OFFER');
  
  const nameLines = wrapTextToLines(name, 30, 2);
  const nameTspans = nameLines.map((line, idx) => 
    `<tspan x="0" dy="${idx === 0 ? 0 : 56}">${escapeXml(line)}</tspan>`
  ).join('');

  const benefitLines = wrapTextToLines(benefit, 48, 2);
  const benefitTspans = benefitLines.map((line, idx) => 
    `<tspan x="0" dy="${idx === 0 ? 0 : 32}">${escapeXml(line)}</tspan>`
  ).join('');

  const bonusY = 120 + (nameLines.length > 1 ? 40 : 0);
  const benefitY = bonusY + 85;

  if (isLight) {
    return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>

    <radialGradient id="glowTop" cx="85%" cy="15%" r="65%">
      <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${p.glow}" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="glowBottom" cx="15%" cy="85%" r="65%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#10B981" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.main}" />
      <stop offset="100%" stop-color="${p.accent}" />
    </linearGradient>

    <pattern id="dotPatternLight" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.5" fill="#CBD5E1" opacity="0.5" />
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bgLight)" />
  <rect width="1200" height="630" fill="url(#dotPatternLight)" />
  <rect width="1200" height="630" fill="url(#glowTop)" />
  <rect width="1200" height="630" fill="url(#glowBottom)" />

  <text x="600" y="380" font-family="Inter" font-weight="900" font-size="170" fill="#0F172A" opacity="0.03" text-anchor="middle">
    ${safeName}
  </text>

  <rect x="40" y="40" width="1120" height="550" rx="36" fill="#FFFFFF" fill-opacity="0.9" stroke="#E2E8F0" stroke-width="2" />

  <!-- UX REBALANCED SAFE ZONE (x=100 to x=1100) -->
  <g transform="translate(100, 90)">
    <text x="0" y="32" font-family="Inter" font-weight="900" font-size="34" fill="#2563EB">
      Refer<tspan fill="#0284C7">Benefits</tspan>
    </text>

    <rect x="800" y="2" width="200" height="38" rx="19" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5" />
    <text x="900" y="27" font-family="Inter" font-weight="800" font-size="14" fill="#15803D" text-anchor="middle">
      ★ VERIFIED 2026
    </text>
  </g>

  <line x1="100" y1="150" x2="1100" y2="150" stroke="#E2E8F0" stroke-width="1.5" />

  <g transform="translate(100, 185)">
    <circle cx="45" cy="45" r="42" fill="url(#avatarGrad)" />
    <text x="45" y="58" font-family="Inter" font-weight="900" font-size="40" fill="#FFFFFF" text-anchor="middle">
      ${initial}
    </text>

    <rect x="110" y="30" width="180" height="32" rx="16" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.5" />
    <text x="200" y="51" font-family="Inter" font-weight="800" font-size="13" fill="#1D4ED8" text-anchor="middle">
      ${safeTag}
    </text>

    <text x="0" y="145" font-family="Inter" font-weight="900" font-size="54" fill="#0F172A">
      ${nameTspans}
    </text>

    <rect x="0" y="${bonusY + 55}" width="520" height="56" rx="28" fill="#15803D" />
    <text x="260" y="${bonusY + 91}" font-family="Inter" font-weight="900" font-size="23" fill="#FFFFFF" text-anchor="middle">
      🔥 ${safeBonus}
    </text>

    <text x="0" y="${benefitY + 65}" font-family="Inter" font-weight="700" font-size="25" fill="#334155">
      ${benefitTspans}
    </text>
  </g>

  <g transform="translate(100, 535)">
    <text x="0" y="0" font-family="Inter" font-weight="800" font-size="19" fill="#2563EB">
      referbenefits.co.in <tspan fill="#64748B" font-weight="600">• Tap to Copy Code &amp; Claim Verified Bonus ➔</tspan>
    </text>
  </g>
</svg>`;
  }

  // Dark Theme
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>

    <radialGradient id="glowTopDark" cx="85%" cy="15%" r="65%">
      <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.45" />
      <stop offset="100%" stop-color="${p.glow}" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="glowBottomDark" cx="15%" cy="85%" r="65%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#10B981" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="avatarGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.main}" />
      <stop offset="100%" stop-color="${p.accent}" />
    </linearGradient>

    <linearGradient id="bonusGradDark" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#16A34A" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <pattern id="dotPatternDark" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.5" fill="#334155" opacity="0.4" />
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bgDark)" />
  <rect width="1200" height="630" fill="url(#dotPatternDark)" />
  <rect width="1200" height="630" fill="url(#glowTopDark)" />
  <rect width="1200" height="630" fill="url(#glowBottomDark)" />

  <text x="600" y="380" font-family="Inter" font-weight="900" font-size="170" fill="#FFFFFF" opacity="0.04" text-anchor="middle">
    ${safeName}
  </text>

  <rect x="40" y="40" width="1120" height="550" rx="36" fill="#111827" fill-opacity="0.75" stroke="#374151" stroke-width="2" />

  <g transform="translate(100, 90)">
    <text x="0" y="32" font-family="Inter" font-weight="900" font-size="34" fill="#818CF8">
      Refer<tspan fill="#38BDF8">Benefits</tspan>
    </text>
    
    <rect x="800" y="2" width="200" height="38" rx="19" fill="#065F46" stroke="#34D399" stroke-width="1.5" />
    <text x="900" y="27" font-family="Inter" font-weight="800" font-size="14" fill="#6EE7B7" text-anchor="middle">
      ★ VERIFIED 2026
    </text>
  </g>

  <line x1="100" y1="150" x2="1100" y2="150" stroke="#374151" stroke-width="1.5" opacity="0.8" />

  <g transform="translate(100, 185)">
    <circle cx="45" cy="45" r="42" fill="url(#avatarGradDark)" />
    <text x="45" y="58" font-family="Inter" font-weight="900" font-size="40" fill="#FFFFFF" text-anchor="middle">
      ${initial}
    </text>

    <rect x="110" y="30" width="180" height="32" rx="16" fill="#1E1B4B" stroke="#6366F1" stroke-width="1.5" />
    <text x="200" y="51" font-family="Inter" font-weight="800" font-size="13" fill="#C7D2FE" text-anchor="middle">
      ${safeTag}
    </text>

    <text x="0" y="145" font-family="Inter" font-weight="900" font-size="54" fill="#FFFFFF">
      ${nameTspans}
    </text>

    <rect x="0" y="${bonusY + 55}" width="520" height="56" rx="28" fill="url(#bonusGradDark)" />
    <text x="260" y="${bonusY + 91}" font-family="Inter" font-weight="900" font-size="23" fill="#FFFFFF" text-anchor="middle">
      🔥 ${safeBonus}
    </text>

    <text x="0" y="${benefitY + 65}" font-family="Inter" font-weight="700" font-size="25" fill="#E2E8F0">
      ${benefitTspans}
    </text>
  </g>

  <g transform="translate(100, 535)">
    <text x="0" y="0" font-family="Inter" font-weight="800" font-size="19" fill="#38BDF8">
      referbenefits.co.in <tspan fill="#9CA3AF" font-weight="600">• Tap to Copy Code &amp; Claim Verified Bonus ➔</tspan>
    </text>
  </g>
</svg>`;
}

function buildBlogSvg(title, description, isLight = false) {
  const titleLines = wrapTextToLines(title, 32, 2);
  const titleTspans = titleLines.map((line, idx) => 
    `<tspan x="0" dy="${idx === 0 ? 0 : 50}">${escapeXml(line)}</tspan>`
  ).join('');

  const descLines = wrapTextToLines(description, 50, 2);
  const descTspans = descLines.map((line, idx) => 
    `<tspan x="0" dy="${idx === 0 ? 0 : 32}">${escapeXml(line)}</tspan>`
  ).join('');

  const descY = 115 + (titleLines.length > 1 ? 50 : 0);

  if (isLight) {
    return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>

    <pattern id="dotPatternLight" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.5" fill="#CBD5E1" opacity="0.5" />
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bgLight)" />
  <rect width="1200" height="630" fill="url(#dotPatternLight)" />
  <rect x="40" y="40" width="1120" height="550" rx="36" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />

  <g transform="translate(100, 90)">
    <text x="0" y="32" font-family="Inter" font-weight="900" font-size="34" fill="#2563EB">
      Refer<tspan fill="#0284C7">Benefits</tspan> <tspan fill="#64748B" font-size="22" font-weight="700">Official Guide</tspan>
    </text>
  </g>

  <line x1="100" y1="150" x2="1100" y2="150" stroke="#E2E8F0" stroke-width="1.5" />

  <g transform="translate(100, 200)">
    <text x="0" y="40" font-family="Inter" font-weight="900" font-size="42" fill="#0F172A">
      ${titleTspans}
    </text>
    <text x="0" y="${descY + 25}" font-family="Inter" font-weight="700" font-size="25" fill="#334155">
      ${descTspans}
    </text>
  </g>

  <g transform="translate(100, 535)">
    <text x="0" y="0" font-family="Inter" font-weight="800" font-size="19" fill="#2563EB">
      referbenefits.co.in/blog/ <tspan fill="#64748B" font-weight="600">• Official Savings Guide</tspan>
    </text>
  </g>
</svg>`;
  }

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#030712" />
    </linearGradient>

    <pattern id="dotPatternDark" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.5" fill="#334155" opacity="0.4" />
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bgDark)" />
  <rect width="1200" height="630" fill="url(#dotPatternDark)" />
  <rect x="40" y="40" width="1120" height="550" rx="36" fill="#111827" fill-opacity="0.75" stroke="#374151" stroke-width="2" />

  <g transform="translate(100, 90)">
    <text x="0" y="32" font-family="Inter" font-weight="900" font-size="34" fill="#818CF8">
      Refer<tspan fill="#38BDF8">Benefits</tspan> <tspan fill="#9CA3AF" font-size="22" font-weight="700">Official Guide</tspan>
    </text>
  </g>

  <line x1="100" y1="150" x2="1100" y2="150" stroke="#374151" stroke-width="1.5" opacity="0.8" />

  <g transform="translate(100, 200)">
    <text x="0" y="40" font-family="Inter" font-weight="900" font-size="42" fill="#FFFFFF">
      ${titleTspans}
    </text>
    <text x="0" y="${descY + 25}" font-family="Inter" font-weight="700" font-size="25" fill="#E2E8F0">
      ${descTspans}
    </text>
  </g>

  <g transform="translate(100, 535)">
    <text x="0" y="0" font-family="Inter" font-weight="800" font-size="19" fill="#38BDF8">
      referbenefits.co.in/blog/ <tspan fill="#9CA3AF" font-weight="600">• Official Savings Guide</tspan>
    </text>
  </g>
</svg>`;
}

async function main() {
  await ensureFont();

  console.log('🎨 Generating UX-Optimized OpenGraph cards (Dark & Light themes)...');

  const wasmPath = path.join(rootDir, 'node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  await initWasm(wasmBuffer);

  const fontBuffer = fs.readFileSync(fontPath);

  const ogOutputDir = path.join(rootDir, 'public', 'og');
  if (!fs.existsSync(ogOutputDir)) {
    fs.mkdirSync(ogOutputDir, { recursive: true });
  }

  const referralsDir = path.join(rootDir, 'src', 'content', 'referrals');
  const referralFiles = fs.readdirSync(referralsDir).filter(f => f.endsWith('.json'));

  let count = 0;

  for (const file of referralFiles) {
    const slug = file.replace('.json', '');
    const content = JSON.parse(fs.readFileSync(path.join(referralsDir, file), 'utf8'));

    const bonusMatch = !content.bonus_amount ? content.benefit_user.match(/(₹\d+|\d+%)/) : null;
    const bonusText = content.bonus_amount || (bonusMatch ? bonusMatch[0] : null);

    // 1. Dark Theme Card
    const darkSvg = buildOfferSvg(content.name, content.category, bonusText, content.benefit_user, false);
    const resvgDark = new Resvg(darkSvg, {
      fitTo: { mode: 'width', value: 1200 },
      font: { fontBuffers: [fontBuffer], defaultFontFamily: 'Inter' }
    });
    fs.writeFileSync(path.join(ogOutputDir, `${slug}.png`), resvgDark.render().asPng());

    // 2. Light Theme Card
    const lightSvg = buildOfferSvg(content.name, content.category, bonusText, content.benefit_user, true);
    const resvgLight = new Resvg(lightSvg, {
      fitTo: { mode: 'width', value: 1200 },
      font: { fontBuffers: [fontBuffer], defaultFontFamily: 'Inter' }
    });
    fs.writeFileSync(path.join(ogOutputDir, `${slug}-light.png`), resvgLight.render().asPng());

    count++;
  }

  console.log(`🌟 Generated ${count * 2} UX-Optimized offer OpenGraph cards in public/og/`);

  // Blog Cards
  const blogDir = path.join(rootDir, 'src', 'content', 'blog');
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    let blogCount = 0;
    for (const file of blogFiles) {
      const slug = file.replace('.md', '');
      const rawText = fs.readFileSync(path.join(blogDir, file), 'utf8');
      const titleMatch = rawText.match(/title:\s*["']?([^"'\r\n]+)["']?/);
      const descMatch = rawText.match(/description:\s*["']?([^"'\r\n]+)["']?/);

      const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ');
      const desc = descMatch ? descMatch[1] : 'ReferBenefits Official Savings & Bonus Guide';

      // Dark
      const darkSvg = buildBlogSvg(title, desc, false);
      const resvgDark = new Resvg(darkSvg, { fitTo: { mode: 'width', value: 1200 }, font: { fontBuffers: [fontBuffer], defaultFontFamily: 'Inter' } });
      fs.writeFileSync(path.join(ogOutputDir, `blog-${slug}.png`), resvgDark.render().asPng());

      // Light
      const lightSvg = buildBlogSvg(title, desc, true);
      const resvgLight = new Resvg(lightSvg, { fitTo: { mode: 'width', value: 1200 }, font: { fontBuffers: [fontBuffer], defaultFontFamily: 'Inter' } });
      fs.writeFileSync(path.join(ogOutputDir, `blog-${slug}-light.png`), resvgLight.render().asPng());

      blogCount++;
    }
    console.log(`🌟 Generated ${blogCount * 2} UX-Optimized blog OpenGraph cards in public/og/`);
  }
}

main().catch(err => {
  console.error('Fatal error generating OpenGraph cards:', err);
  process.exit(1);
});
