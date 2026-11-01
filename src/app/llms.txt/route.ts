import { getHomepageContent, getSiteSettings, getAllPages } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";

// /llms.txt — a plain-Markdown map of the site for LLMs and answer engines (llmstxt.org convention).
export const dynamic = "force-dynamic";

export async function GET() {
  const [site, home, pages] = await Promise.all([
    getSiteSettings(),
    getHomepageContent(),
    getAllPages(),
  ]);

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
    .filter((p) => p.published && p.seo?.robots?.index === true && !p.seo?.indexLock)
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
