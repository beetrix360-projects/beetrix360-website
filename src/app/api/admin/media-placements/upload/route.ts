import { NextResponse } from "next/server";
import { getSessionUser, canUpdate } from "@/lib/auth";
import { uploadMedia } from "@/lib/s3";

const ALLOWED_MIME_TYPES: Record<string, "IMAGE" | "VIDEO"> = {
  "image/jpeg": "IMAGE",
  "image/jpg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "image/svg+xml": "IMAGE",
  "image/avif": "IMAGE",
  "image/gif": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
};

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_VIDEO_BYTES = 60 * 1024 * 1024; // 60 MB

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !canUpdate(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const detectedType = ALLOWED_MIME_TYPES[file.type];
    if (!detectedType) {
      return NextResponse.json(
        {
          error: `Unsupported file type (${file.type || "unknown"}). Allowed formats: .jpg, .png, .webp, .svg, .mp4, .webm.`,
        },
        { status: 400 }
      );
    }

    const maxBytes = detectedType === "VIDEO" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: `File exceeds maximum size (${detectedType === "VIDEO" ? "60MB" : "15MB"}).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMedia(buffer, file.name, file.type);
    return NextResponse.json({
      url: result.url,
      key: result.key,
      storage: result.storage,
      mediaType: detectedType,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/media-placements/upload] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Media upload failed" },
      { status: 500 }
    );
  }
}

