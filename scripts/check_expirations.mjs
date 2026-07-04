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
              slug: row.slug,
              category: row.category || "General",
              link: row.referral_link || ""
            }),
          });
          console.log(`✉️ Expiry alert sent to webhook for "${row.name}".`);
        } else if (timeDiff <= 0) {
          // The offer has expired! Let's mark it as expired in the Google Sheet.
          console.log(`🚫 Offer Expired: "${row.name}" has expired! Marking it as expired in Google Sheets...`);
          
          try {
            const res = await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                type: "update_referral",
                slug: row.slug,
                updates: {
                  status: "not active"
                }
              }),
            });
            const resText = await res.text();
            if (res.ok) {
              console.log(`✅ Marked "${row.name}" as expired successfully in Google Sheets. Response: ${resText}`);
            } else {
              console.error(`⚠️ Failed to mark "${row.name}" as expired: ${res.statusText}`);
            }
          } catch (fetchErr) {
            console.error(`⚠️ Webhook request failed to mark "${row.name}" as expired:`, fetchErr.message);
          }
        }
      }
    }
    console.log("✅ Expiry check completed.");
  } catch (error) {
    console.error("❌ Error running expiry check script:", error);
  }
}

run();
