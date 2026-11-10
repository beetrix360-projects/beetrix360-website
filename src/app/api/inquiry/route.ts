import { NextRequest, NextResponse } from "next/server";
import { sendLeadInquiry, getLeadInquiries } from "@/lib/email-service";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let data: any = {};

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      data = {
        name: formData.get("name")?.toString() || "",
        email: formData.get("email")?.toString() || "",
        whatsapp: formData.get("whatsapp")?.toString() || formData.get("phone")?.toString() || "",
        website: formData.get("website")?.toString() || formData.get("domain")?.toString() || "",
        goal: formData.get("goal")?.toString() || formData.get("notes")?.toString() || "",
        budget: formData.get("budget")?.toString() || "",
        notes: formData.get("notes")?.toString() || formData.get("message")?.toString() || "",
        pageUrl: formData.get("pageUrl")?.toString() || req.headers.get("referer") || "",
        sectionName: formData.get("sectionName")?.toString() || "Website Form",
        buttonName: formData.get("buttonName")?.toString() || "Submit",
      };
    } else {
      // Fallback query or json try
      try {
        data = await req.json();
      } catch {
        data = {};
      }
    }

    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "Name and email are required fields." },
        { status: 400 }
      );
    }

    // Default page URL if not supplied
    if (!data.pageUrl) {
      data.pageUrl = req.headers.get("referer") || "https://www.beetrix360.com";
    }

    const result = await sendLeadInquiry({
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      website: data.website,
      goal: data.goal,
      budget: data.budget,
      notes: data.notes,
      pageUrl: data.pageUrl,
      sectionName: data.sectionName,
      buttonName: data.buttonName,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[API /api/inquiry Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process inquiry" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Only authenticated admins can fetch full list
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await getLeadInquiries();
  return NextResponse.json({ inquiries }, { status: 200 });
}

