import { NextResponse } from "next/server";
import { getChatWidgetConfig } from "@/lib/chat-widget.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getChatWidgetConfig();
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load chat widget configuration" },
      { status: 500 }
    );
  }
}

