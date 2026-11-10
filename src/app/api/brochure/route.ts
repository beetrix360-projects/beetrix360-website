import { NextResponse } from "next/server";
import { getBrochureConfig } from "@/lib/brochure.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getBrochureConfig();
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load brochure configuration" },
      { status: 500 }
    );
  }
}

