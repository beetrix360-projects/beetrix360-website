import { getHomepageContent, getSiteSettings, getAllPages } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";
import type { PageRecordV2 } from "@/lib/types";
import staticIaSeed from "../../../src/content/ia-v2.seed.json";

// /llms.txt — a plain-Markdown map of the site for LLMs and answer engines (llmstxt.org convention).
export const dynamic = "force-dynamic";

export async function GET() {
  const [site, home] = await Promise.all([
    getSiteSettings(),
    getHomepageContent(),
  ]);

  // Resilient page resolution starting from guaranteed baseline seed
  const pageMap = new Map<string, PageRecordV2>();
  const seedPages = Array.isArray((staticIaSeed as any)?.pages)
    ? (staticIaSeed as any).pages
    : [];
  for (const p of seedPages) {
    if (p && p.path) {
      pageMap.set(p.path, { ...p });
    }
  }

  try {
    const dynamicPages = await getAllPages();
    if (Array.isArray(dynamicPages)) {
      for (const p of dynamicPages) {
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
    console.warn("[llms.txt] Error querying dynamic pages:", err);
  }

  const pages = Array.from(pageMap.values());

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `- Website: ${site.url}`,
    `- Phone: ${site.phone.display}`,
    `- Founded: ${site.foundingYear} (as ${site.formerName})`,
    "",
    "## Core Pillars",
    "",
  ];

  if (home?.pillars?.cards) {
    for (const c of home.pillars.cards) {
      lines.push(`- ${c.title}: ${c.text}`);
    }
    lines.push("");
  }

  // Exactly the same set of indexed pages as sitemap.xml
  const indexedPages = pages
    .filter((p) => p && typeof p.path === "string" && p.path.trim().length > 0 && p.published !== false && p.seo?.robots?.index !== false && !p.seo?.indexLock)
    .sort((a, b) => (a.path === "/" ? -1 : b.path === "/" ? 1 : a.path.localeCompare(b.path)));

  lines.push("## Indexed Pages", "");

  for (const p of indexedPages) {
    const url = p.seo?.canonicalPath ? absoluteUrl(p.seo.canonicalPath) : absoluteUrl(p.path);
    const summary = p.seo?.metaDescription || `Official ${p.h1} page from Beetrix360.`;
    lines.push(`- [${p.h1}](${url}): ${summary}`);
  }

  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
