import { getAllPages } from "@/lib/content";
import { getAllStoredPlacements, normalizePageSlug } from "@/lib/media-placements";
import { absoluteUrl, SITE_URL } from "@/lib/site-url";
import type { PageRecordV2 } from "@/lib/types";
import staticIaSeed from "../../../src/content/ia-v2.seed.json";
import staticMediaSeed from "../../../src/content/media-placements.seed.json";

export const dynamic = "force-dynamic";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

function getPriorityAndFrequency(page: PageRecordV2): {
  priority: string;
  changeFrequency: string;
} {
  if (page.path === "/") {
    return { priority: "1.0", changeFrequency: "daily" };
  }

  const type = page.pageType;
  if (type === "hub") {
    return { priority: "0.9", changeFrequency: "weekly" };
  }
  if (type === "service") {
    return { priority: "0.8", changeFrequency: "weekly" };
  }
  if (
    type === "sub" ||
    type === "platform" ||
    type === "challenge" ||
    type === "pricing" ||
    type === "proof"
  ) {
    return { priority: "0.7", changeFrequency: "weekly" };
  }
  if (type === "company" || type === "resource") {
    return { priority: "0.6", changeFrequency: "monthly" };
  }
  if (
    type === "legal" ||
    page.path.includes("privacy") ||
    page.path.includes("terms") ||
    page.path.includes("cookie")
  ) {
    return { priority: "0.3", changeFrequency: "yearly" };
  }

  return { priority: "0.7", changeFrequency: "weekly" };
}

export async function GET() {
  // 1. Build a resilient page map starting from the guaranteed 159 seed pages
  const pageMap = new Map<string, PageRecordV2>();
  const seedPages = Array.isArray((staticIaSeed as any)?.pages)
    ? (staticIaSeed as any).pages
    : [];

  for (const p of seedPages) {
    if (p && p.path) {
      pageMap.set(p.path, { ...p });
    }
  }

  // 2. Overlay any live updates from DynamoDB / local store
  try {
    const dbPages = await getAllPages();
    if (Array.isArray(dbPages)) {
      for (const p of dbPages) {
        if (p && typeof p.path === "string" && p.path.trim().length > 0) {
          const existing = pageMap.get(p.path);
          pageMap.set(p.path, {
            ...(existing || {}),
            ...p,
          });
        }
      }
    }
  } catch (err) {
    console.warn("[sitemap] Failed to query dynamic pages, using baseline seed:", err);
  }

  const allPages = Array.from(pageMap.values());

  // 3. Build image map starting with static baseline, then overlay stored DB placements
  const imagesBySlug = new Map<string, string[]>();
  const seedMedia = (staticMediaSeed || {}) as Record<string, any>;
  for (const [k, v] of Object.entries(seedMedia)) {
    if (
      v &&
      v.pageSlug &&
      v.mediaUrl &&
      typeof v.mediaUrl === "string" &&
      v.mediaUrl.startsWith("http") &&
      !v.mediaUrl.endsWith(".mp4")
    ) {
      const slug = normalizePageSlug(v.pageSlug);
      if (!imagesBySlug.has(slug)) {
        imagesBySlug.set(slug, []);
      }
      const list = imagesBySlug.get(slug)!;
      if (!list.includes(v.mediaUrl) && list.length < 3) {
        list.push(v.mediaUrl);
      }
    }
  }

  try {
    const dynamicPlacements = await getAllStoredPlacements();
    if (Array.isArray(dynamicPlacements)) {
      for (const item of dynamicPlacements) {
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
    }
  } catch (err) {
    console.warn("[sitemap] Failed to query dynamic placements:", err);
  }

  // 4. Filter for indexable pages: all public marketing & service pages are indexable unless explicitly indexLocked
  const indexablePages = allPages.filter((p) => {
    if (!p || typeof p.path !== "string" || p.path.trim().length === 0) return false;
    if (p.path.startsWith("/admin") || p.path.startsWith("/api") || p.path.startsWith("/_")) return false;
    if (p.seo?.indexLock) return false;
    return true;
  });

  const urlBlocks = indexablePages.map((p) => {
    const rawPath = p.path === "/" ? "/" : p.path;
    const url = p.seo?.canonicalPath
      ? absoluteUrl(p.seo.canonicalPath)
      : absoluteUrl(rawPath);

    const lastModified = (p.updatedAt ? new Date(p.updatedAt) : new Date())
      .toISOString()
      .split("T")[0];
    const { priority, changeFrequency } = getPriorityAndFrequency(p);
    const slug = normalizePageSlug(p.path);
    const pageImages = imagesBySlug.get(slug) || [];

    const imagesXml = pageImages
      .map(
        (imgUrl) =>
          `    <image:image>\n      <image:loc>${escapeXml(imgUrl)}</image:loc>\n    </image:image>`
      )
      .join("\n");

    return `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastModified}</lastmod>\n    <changefreq>${changeFrequency}</changefreq>\n    <priority>${priority}</priority>${
      imagesXml ? "\n" + imagesXml : ""
    }\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlBlocks.join(
    "\n"
  )}\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Sitemap-Total-Urls": String(urlBlocks.length),
    },
  });
}
