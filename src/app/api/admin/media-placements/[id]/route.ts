import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser, canUpdate, canDelete } from "@/lib/auth";
import {
  deleteMediaPlacement,
  getMediaPlacementById,
  pageSlugToPath,
  parsePlacementId,
  upsertMediaPlacement,
} from "@/lib/media-placements";
import type { MediaSourceType, MediaType } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user || !canUpdate(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const decodedId = decodeURIComponent(id);
    const parsed = parsePlacementId(decodedId);

    const body = await request.json();
    const pageSlug = parsed?.pageSlug || body.pageSlug;
    const placeholderKey = parsed?.placeholderKey || body.placeholderKey;

    if (!pageSlug || !placeholderKey) {
      return NextResponse.json(
        { error: "Invalid placement identifier." },
        { status: 400 }
      );
    }

    const mediaType: MediaType = body.mediaType === "VIDEO" ? "VIDEO" : "IMAGE";
    const sourceType: MediaSourceType = body.sourceType === "URL" ? "URL" : "UPLOAD";
    const mediaUrl = String(body.mediaUrl || "").trim();
    const altText = String(body.altText || "").trim();

    if (mediaUrl && !altText) {
      return NextResponse.json(
        { error: "ALT text is required when attaching an image or video." },
        { status: 400 }
      );
    }

    const applyScope =
      body.applyScope === "category" || body.applyScope === "all"
        ? body.applyScope
        : "page";

    const result = await upsertMediaPlacement({
      pageSlug,
      placeholderKey,
      label: body.label,
      mediaType,
      sourceType,
      mediaUrl,
      altText,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      dimensions: body.dimensions,
      applyScope,
    });

    try {
      revalidatePath(pageSlugToPath(pageSlug));
      if (applyScope !== "page") {
        revalidatePath("/", "layout");
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      ok: true,
      placement: result.primary,
      updatedCount: result.updatedCount,
    });
  } catch (err: any) {
    console.error("[PUT /api/admin/media-placements/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update media placement" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user || (!canUpdate(user) && !canDelete(user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const decodedId = decodeURIComponent(id);
    const parsed = parsePlacementId(decodedId);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid placement ID" }, { status: 400 });
    }

    await deleteMediaPlacement(decodedId);

    try {
      revalidatePath(pageSlugToPath(parsed.pageSlug));
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      ok: true,
      deletedId: decodedId,
    });
  } catch (err: any) {
    console.error("[DELETE /api/admin/media-placements/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to remove media placement" },
      { status: 500 }
    );
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const decodedId = decodeURIComponent(id);
    const item = await getMediaPlacementById(decodedId);
    return NextResponse.json({ placement: item });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

