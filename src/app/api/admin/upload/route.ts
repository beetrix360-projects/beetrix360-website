import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { uploadMedia } from "@/lib/s3";

import path from "path";

// Maximum upload file size: 25MB
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
  "application/pdf",
  "text/html",
  "application/xhtml+xml",
];

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".mp4",
  ".pdf",
  ".html",
  ".htm",
];

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin", "editor", "moderator"].includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions to upload media." },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    // 3. Validate size & type
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 25MB limit." },
        { status: 400 }
      );
    }

    const fileExt = path.extname(file.name || "").toLowerCase();
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(fileExt);
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type);

    if (!isAllowedMime && !isAllowedExt) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Allowed formats: PNG, JPG, WebP, SVG, AVIF, GIF, MP4, PDF, HTML.",
        },
        { status: 400 }
      );
    }

    // Determine normalized content type
    let resolvedContentType = file.type;
    if (fileExt === ".html" || fileExt === ".htm") {
      resolvedContentType = "text/html; charset=utf-8";
    } else if (fileExt === ".pdf") {
      resolvedContentType = "application/pdf";
    } else if (!resolvedContentType) {
      resolvedContentType = "application/octet-stream";
    }

    // 4. Read arrayBuffer and upload to S3 (or fallback)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMedia(buffer, file.name, resolvedContentType);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      storage: result.storage,
      filename: file.name,
    });
  } catch (error: any) {
    console.error("[Media Upload Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during upload." },
      { status: 500 }
    );
  }
}
