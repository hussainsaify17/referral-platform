import { google } from "googleapis";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// Load local .env.local if running locally
dotenv.config({ path: ".env.local" });

const PROPERTY_ID = "534627843"; // GA4 Property ID

async function run() {
  const rawCredentials = process.env.GA_SERVICE_ACCOUNT_KEY;
  if (!rawCredentials) {
    console.log("⚠️ GA_SERVICE_ACCOUNT_KEY not set. Skipping dynamic featured sorting from Google Analytics.");
    process.exit(0);
  }

  console.log("📊 Fetching live conversion data from Google Analytics...");
  try {
    const credentials = JSON.parse(rawCredentials);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analyticsdata = google.analyticsdata({
      version: "v1beta",
      auth,
    });

    // Run report to find top clicked and copied referral offers
    const response = await analyticsdata.properties.runReport({
      property: `properties/${PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        // We aggregate by pagePath to find which offer pages are most popular
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            // Matches clean offer detail paths (like /cred-referral-code/ or /cred-referral-code)
            stringFilter: {
              matchType: "REGEXP",
              value: "^/[a-zA-Z0-9_-]+/?$",
            },
          },
        },
      },
    });

    const rows = response.data.rows || [];
    const rankings = [];

    for (const row of rows) {
      const pagePath = row.dimensionValues?.[0]?.value || "";
      const pageViews = parseInt(row.metricValues?.[0]?.value || "0", 10);
      
      // Clean slug from path, e.g. "/jupiter-money-invite/" -> "jupiter-money-invite"
      const slug = pagePath.replace(/^\/|\/$/g, "").trim();
      
      // Exclude static non-referral root pages if matched
      if (slug && slug !== "blog" && slug !== "privacy" && slug !== "terms" && slug !== "robots.txt") {
        rankings.push({ slug, pageViews });
      }
    }

    // Sort by page views descending
    rankings.sort((a, b) => b.pageViews - a.pageViews);

    const outputDir = path.join(process.cwd(), "src/data");
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, "analytics_ranking.json");
    await fs.writeFile(
      outputPath,
      JSON.stringify({
        lastUpdated: new Date().toISOString(),
        topOffers: rankings.map(r => r.slug),
      }, null, 2)
    );

    console.log(`✅ Google Analytics rankings updated successfully! Saved to: src/data/analytics_ranking.json`);
    console.log(`🔥 Top offers based on live traffic:`, rankings.slice(0, 5).map(r => `${r.slug} (${r.pageViews} views)`));
  } catch (error) {
    console.error("❌ Error fetching data from Google Analytics:", error);
    process.exit(0); // Exit cleanly so build doesn't break
  }
}

run();
