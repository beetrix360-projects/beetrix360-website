import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getBrochureConfig } from "@/lib/brochure.server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const config = await getBrochureConfig();

    if (!config || !config.fileUrl) {
      return NextResponse.json({ error: "No brochure configured" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const isInline = searchParams.get("inline") === "1" || searchParams.get("view") === "1";

    const fileUrl = config.fileUrl;
    let fileName = config.fileName || path.basename(fileUrl) || "beetrix360-brochure.pdf";

    // Clean up filename for header
    fileName = fileName.replace(/["\r\n]/g, "");

    const ext = path.extname(fileName || fileUrl).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".html" || ext === ".htm") {
      contentType = "text/html; charset=utf-8";
    } else if (ext === ".pdf") {
      contentType = "application/pdf";
    }

    const dispositionType = isInline ? "inline" : "attachment";
    const contentDisposition = `${dispositionType}; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;

    // Case 1: Remote URL (S3, CloudFront, CDN)
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      const remoteRes = await fetch(fileUrl, {
        headers: { "User-Agent": "Beetrix360-Brochure-Downloader/1.0" },
      });

      if (!remoteRes.ok) {
        return NextResponse.json(
          { error: `Failed to fetch remote brochure file: ${remoteRes.statusText}` },
          { status: 502 }
        );
      }

      const buffer = await remoteRes.arrayBuffer();
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": contentDisposition,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Case 2: Local File within /public
    const cleanRelative = fileUrl.replace(/^\/+/, "");
    const localFilePath = path.join(process.cwd(), "public", cleanRelative);

    if (fs.existsSync(localFilePath)) {
      const fileBuffer = fs.readFileSync(localFilePath);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": contentDisposition,
          "Content-Length": fileBuffer.length.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Fallback: If uploaded path missing, check default brochure
    const defaultPdf = path.join(process.cwd(), "public", "downloads", "beetrix360-corporate-brochure.pdf");
    if (fs.existsSync(defaultPdf)) {
      const fileBuffer = fs.readFileSync(defaultPdf);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `${dispositionType}; filename="beetrix360-corporate-brochure.pdf"`,
          "Content-Length": fileBuffer.length.toString(),
        },
      });
    }

    return NextResponse.json({ error: "Brochure file not found" }, { status: 404 });
  } catch (err: any) {
    console.error("[Brochure Download Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to download brochure" },
      { status: 500 }
    );
  }
}

