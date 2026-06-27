import dotenv from "dotenv";
import Papa from "papaparse";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function run() {
  const rawUrl = process.env.GOOGLE_SHEET_CSV_URL || "";
  const cleanedUrl = rawUrl.replace(/^["']|["']$/g, "").trim();
  const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK || "";

  if (!cleanedUrl) {
    console.log("⚠️ GOOGLE_SHEET_CSV_URL not set. Skipping expiry check.");
    return;
  }
  if (!webhookUrl) {
    console.log("⚠️ NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK not set. Skipping expiry alert notifications.");
    return;
  }

  console.log("🔍 Checking active offers for upcoming expirations during build...");
  try {
    const response = await fetch(`${cleanedUrl}&_t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }

    const csvText = await response.text();
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const rows = parsed.data || [];
    const today = new Date();
    
    // 24 hours in milliseconds
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    for (const row of rows) {
      const status = String(row.status || "").trim().toLowerCase();
      if (status === "active" && row.expiry) {
        const expiryDate = new Date(row.expiry);
        if (isNaN(expiryDate.getTime())) continue;

        const timeDiff = expiryDate.getTime() - today.getTime();
        
        // Alert if there is less than 36 hours remaining (approx 1 day left) and hasn't fully expired yet
        if (timeDiff > 0 && timeDiff <= 1.5 * ONE_DAY_MS) {
          const hoursLeft = Math.round(timeDiff / (1000 * 60 * 60));
          console.log(`⚠️ Expiry Alert: "${row.name}" has only ${hoursLeft} hours left before it expires!`);

          // Trigger the Apps Script webhook to send the email alert
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              type: "expiry_alert",
              name: row.name,
              code: row.referral_code || "Link-Only",
              expiry: row.expiry,
              hoursLeft: hoursLeft,
            }),
          });
          console.log(`✉️ Expiry alert sent to webhook for "${row.name}".`);
        }
      }
    }
    console.log("✅ Expiry check completed.");
  } catch (error) {
    console.error("❌ Error running expiry check script:", error);
  }
}

run();
