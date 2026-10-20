import { getHomepageContent, getSiteSettings } from "@/lib/content";
import { divisions } from "@/lib/site-structure";
import { absoluteUrl } from "@/lib/site-url";

// /llms.txt — a plain-Markdown map of the site for LLMs and answer engines (llmstxt.org convention).
export const dynamic = "force-static";

export async function GET() {
  const [site, home] = await Promise.all([getSiteSettings(), getHomepageContent()]);
  const lines: string[] = [`# ${site.name}`, "", `> ${site.description}`, ""];
  lines.push(`- Website: ${site.url}`, `- Phone: ${site.phone.display}`, `- Founded: ${site.foundingYear} (as ${site.formerName})`, "");
  lines.push("## Pillars", "");
  for (const c of home.pillars.cards) lines.push(`- ${c.title}: ${c.text}`);
  lines.push("");
  for (const d of divisions) {
    lines.push(`## ${d.name}`, "", `- [${d.name}](${absoluteUrl(`/${d.slug}`)})`);
    for (const s of d.services) {
      lines.push(`- [${s.name}](${absoluteUrl(`/${s.slug}`)})`);
      for (const sub of s.subServices) lines.push(`  - [${sub.name}](${absoluteUrl(`/${s.slug}/${sub.slug}`)})`);
    }
    lines.push("");
  }
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
