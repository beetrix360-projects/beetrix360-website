import { NextResponse } from "next/server";
import { getSessionUser, canUpdate } from "@/lib/auth";
import { getChatWidgetConfig, saveChatWidgetConfig } from "@/lib/chat-widget.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const config = await getChatWidgetConfig();
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canUpdate(user)) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await saveChatWidgetConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save configuration" }, { status: 400 });
  }
}
