import { NextResponse } from "next";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandName, code, link, benefit, email, cfTurnstileResponse } = body;

    // 1. Basic Validation
    if (!brandName || (!code && !link)) {
      return NextResponse.json(
        { error: "Brand Name and either a Code or Link are required." },
        { status: 400 }
      );
    }

    // 2. Cloudflare Turnstile Verification
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (secretKey && cfTurnstileResponse) {
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: cfTurnstileResponse,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json(
          { error: "Failed security verification. Please try again." },
          { status: 403 }
        );
      }
    } else if (secretKey && !cfTurnstileResponse) {
      return NextResponse.json(
        { error: "Security token missing. Please try again." },
        { status: 403 }
      );
    }

    // 3. Google Apps Script Webhook Integration
    const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL;
    if (webhookUrl) {
      const gasRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, code, link, benefit, email }),
      });

      const gasData = await gasRes.json();
      
      if (gasData.error) {
        return NextResponse.json(
          { error: gasData.error },
          { status: 400 } // Send 400 for duplicate codes from the spreadsheet
        );
      }
    } else {
      // Development mode: simulate network delay if no webhook is set
      console.log("No webhook URL configured. Simulating success for payload:", { brandName, code, link, benefit, email });
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    return NextResponse.json(
      { success: true, message: "Referral submitted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Submission Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
