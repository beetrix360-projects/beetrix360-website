import type { Metadata } from "next";

const SPECIAL: Record<string, string> = {
  seo: "SEO", ai: "AI", aeo: "AEO", geo: "GEO", crm: "CRM", api: "API", ugc: "UGC", dsp: "DSP",
  chatgpt: "ChatGPT", tiktok: "TikTok", linkedin: "LinkedIn", whatsapp: "WhatsApp",
};
const SMALL = new Set(["and", "for", "of", "the", "to"]);

/** "local seo services" -> "Local SEO Services" */
export function keywordTitle(keyword: string) {
  return keyword
    .split(" ")
    .map((w, i) =>
      w
        .split("-")
        .map((p) => SPECIAL[p.toLowerCase()] ?? (i > 0 && SMALL.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
        .join("-"),
    )
    .join(" ");
}

/**
 * Metadata for structure pages. Titles use the target keyword from the navigation doc.
 * The description is assembled only from doc facts; replace it with written copy (dashboard) later.
 */
export function structureMetadata(opts: { path: string; keyword: string; name: string; divisionName: string }): Metadata {
  const title = keywordTitle(opts.keyword);
  const description = `${opts.name} from BeeTrix360, part of our ${opts.divisionName} services.`;
  return {
    title,
    description,
    alternates: { canonical: opts.path },
    openGraph: { title: `${title} | BeeTrix360`, description, url: opts.path, type: "website" },
    twitter: { title: `${title} | BeeTrix360`, description },
  };
}
