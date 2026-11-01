import type { MetadataRoute } from "next";
import { getAllPages } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();

  // Exactly published pages with seo.robots.index === true and not locked
  const indexablePages = pages.filter(
    (p) => p && typeof p.path === "string" && p.published && p.seo?.robots?.index === true && !p.seo?.indexLock
  );

  return indexablePages.map((p) => {
    const rawPath = p.path === "/" ? "/" : p.path;
    const url = p.seo?.canonicalPath
      ? absoluteUrl(p.seo.canonicalPath)
      : absoluteUrl(rawPath);

    const lastModified = p.updatedAt ? new Date(p.updatedAt) : new Date();

    return {
      url,
      lastModified,
      changeFrequency: p.path === "/" ? "weekly" : "monthly",
      priority: p.path === "/" ? 1.0 : p.pageType === "hub" ? 0.9 : 0.8,
    };
  });
}
