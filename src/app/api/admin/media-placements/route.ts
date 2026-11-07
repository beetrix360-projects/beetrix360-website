import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser, canUpdate } from "@/lib/auth";
import {
  CATEGORY_LABELS,
  getAllPageMediaGroups,
  getPageMediaPlacements,
  normalizePageSlug,
  pageSlugToPath,
  upsertMediaPlacement,
} from "@/lib/media-placements";
import type { MediaSourceType, MediaType } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const categoryParam = searchParams.get("category");

    if (pageParam) {
      const pageSlug = normalizePageSlug(pageParam);
      const placements = await getPageMediaPlacements(pageSlug);
      return NextResponse.json({
        pageSlug,
        pagePath: pageSlugToPath(pageSlug),
        placements,
      });
    }

    const groups = await getAllPageMediaGroups({
      category: categoryParam || undefined,
    });

    const categories = Object.entries(CATEGORY_LABELS).map(([id, label]) => {
      const catGroups = groups.filter((g) => g.category === id);
      const configuredSlots = catGroups.reduce((acc, g) => acc + g.configuredCount, 0);
      const totalSlots = catGroups.reduce((acc, g) => acc + g.totalCount, 0);
      return {
        id,
        label,
        pageCount: catGroups.length,
        configuredSlots,
        totalSlots,
      };
    });

    return NextResponse.json({
      categories,
      groups,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/media-placements] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load media placements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !canUpdate(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const pageSlug = normalizePageSlug(body.pageSlug || "home");
    const placeholderKey = String(body.placeholderKey || "")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    if (!placeholderKey) {
      return NextResponse.json(
        { error: "placeholderKey is required." },
        { status: 400 }
      );
    }

    const mediaType: MediaType = body.mediaType === "VIDEO" ? "VIDEO" : "IMAGE";
    const sourceType: MediaSourceType = body.sourceType === "URL" ? "URL" : "UPLOAD";
    const mediaUrl = String(body.mediaUrl || "").trim();
    const altText = String(body.altText || "").trim();

    if (mediaUrl && !altText) {
      return NextResponse.json(
        { error: "ALT text is required for accessibility and search engine indexing." },
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
      // Non-fatal in dev
    }

    return NextResponse.json({
      ok: true,
      placement: result.primary,
      updatedCount: result.updatedCount,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/media-placements] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save media placement" },
      { status: 500 }
    );
  }
}

