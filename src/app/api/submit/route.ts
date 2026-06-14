import { NextResponse } from "next";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { brandName, code, link, benefit, email } = body;

    // Validate minimum required fields
    if (!brandName || (!code && !link)) {
      return NextResponse.json(
        { error: "Brand Name and either a Code or Link are required." },
        { status: 400 }
      );
    }

    // TODO: Forward payload to Google Sheets Webhook, Formspree, or DB
    console.log("New Community Pool Submission:", { brandName, code, link, benefit, email });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

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
