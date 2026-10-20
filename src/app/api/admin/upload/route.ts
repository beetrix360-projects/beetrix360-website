import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { uploadMedia } from "@/lib/s3";

// Maximum upload file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
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
        { error: "File exceeds 10MB limit." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Allowed formats: PNG, JPG, WebP, SVG, AVIF, GIF, MP4.",
        },
        { status: 400 }
      );
    }

    // 4. Read arrayBuffer and upload to S3 (or fallback)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMedia(buffer, file.name, file.type);

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
