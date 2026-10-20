import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    let email = "";
    let password = "";

    const rawText = await req.text();
    try {
      const body = JSON.parse(rawText);
      email = body.email || "";
      password = body.password || "";
    } catch {
      const params = new URLSearchParams(rawText);
      email = params.get("email") || "";
      password = params.get("password") || "";
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Please enter both email and password." }, { status: 400 });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Verify credentials and try again." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user);

    const res = NextResponse.json({ success: true, user });
    res.cookies.set("bx_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: err?.message || "Server authentication error." }, { status: 500 });
  }
}
