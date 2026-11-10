import { NextResponse } from "next/server";
import { getSessionUser, canUpdate } from "@/lib/auth";
import { getLeadInquiries } from "@/lib/email-service";
import { putDbItem, getDbItem } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await getLeadInquiries();
    return NextResponse.json({ inquiries });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load inquiries" }, { status: 500 });
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
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const existing = await getDbItem("INQUIRY", id);
    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const updated = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
    };

    await putDbItem("INQUIRY", id, updated);
    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update inquiry" }, { status: 400 });
  }
}
