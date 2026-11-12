import type { MetadataRoute } from "next";
import { getAllPages } from "@/lib/content";
import { getAllStoredPlacements, normalizePageSlug } from "@/lib/media-placements";
import { absoluteUrl } from "@/lib/site-url";
import type { PageRecordV2 } from "@/lib/types";

export const revalidate = 3600;

function getPriorityAndFrequency(page: PageRecordV2): {
  priority: number;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
} {
  if (page.path === "/") {
    return { priority: 1.0, changeFrequency: "daily" };
  }

  const type = page.pageType;
  if (type === "hub") {
    return { priority: 0.9, changeFrequency: "weekly" };
  }
  if (type === "service") {
    return { priority: 0.8, changeFrequency: "weekly" };
  }
  if (type === "sub" || type === "platform" || type === "challenge") {
    return { priority: 0.7, changeFrequency: "weekly" };
  }
  if (type === "pricing" || type === "proof") {
    return { priority: 0.7, changeFrequency: "weekly" };
  }
  if (type === "company" || type === "resource") {
    return { priority: 0.6, changeFrequency: "monthly" };
  }
  if (
    type === "legal" ||
    page.path.includes("privacy") ||
    page.path.includes("terms") ||
    page.path.includes("cookie")
  ) {
    return { priority: 0.3, changeFrequency: "yearly" };
  }

  return { priority: 0.7, changeFrequency: "weekly" };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, placements] = await Promise.all([
    getAllPages().catch(() => []),
    getAllStoredPlacements().catch(() => []),
  ]);

  // Index image URLs by normalized page slug for Google Image & AEO discovery
  const imagesBySlug = new Map<string, string[]>();
  for (const item of placements) {
    if (
      item &&
      item.pageSlug &&
      item.mediaUrl &&
      typeof item.mediaUrl === "string" &&
      item.mediaUrl.startsWith("http") &&
      !item.mediaUrl.endsWith(".mp4")
    ) {
      const slug = normalizePageSlug(item.pageSlug);
      if (!imagesBySlug.has(slug)) {
        imagesBySlug.set(slug, []);
      }
      const list = imagesBySlug.get(slug)!;
      if (!list.includes(item.mediaUrl) && list.length < 3) {
        list.push(item.mediaUrl);
      }
    }
  }

  // Exactly published pages that are not explicitly marked index: false or locked
  const indexablePages = pages.filter(
    (p) =>
      p &&
      typeof p.path === "string" &&
      p.path.trim().length > 0 &&
      p.published !== false &&
      p.seo?.robots?.index !== false &&
      !p.seo?.indexLock
  );

  return indexablePages.map((p) => {
    const rawPath = p.path === "/" ? "/" : p.path;
    const url = p.seo?.canonicalPath
      ? absoluteUrl(p.seo.canonicalPath)
      : absoluteUrl(rawPath);

    const lastModified = p.updatedAt ? new Date(p.updatedAt) : new Date();
    const { priority, changeFrequency } = getPriorityAndFrequency(p);
    const slug = normalizePageSlug(p.path);
    const pageImages = imagesBySlug.get(slug);

    return {
      url,
      lastModified,
      changeFrequency,
      priority,
      ...(pageImages && pageImages.length > 0 ? { images: pageImages } : {}),
    };
  });
}
