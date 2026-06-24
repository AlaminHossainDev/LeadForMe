import { NextRequest, NextResponse } from "next/server";
import { generateOutreachSequenceAI } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { businessName, website, issues, recommendations } = await req.json();

    if (!businessName) {
      return NextResponse.json(
        { error: "businessName is a required parameter." },
        { status: 400 }
      );
    }

    const outreach = await generateOutreachSequenceAI(
      businessName,
      website || "their website",
      issues || [],
      recommendations || []
    );

    return NextResponse.json({ success: true, outreach });
  } catch (error) {
    console.error("Error in outreach generator API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
