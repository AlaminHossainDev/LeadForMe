import { NextRequest, NextResponse } from "next/server";
import { discoverLeadsAI } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { industry, location } = await req.json();

    if (!industry || !location) {
      return NextResponse.json(
        { error: "Industry and location are required parameters." },
        { status: 400 }
      );
    }

    const leads = await discoverLeadsAI(industry, location);
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error in search API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
