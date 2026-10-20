import type { MetadataRoute } from "next";
import { divisions } from "@/lib/site-structure";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [{ url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 }];
  for (const d of divisions) {
    entries.push({ url: absoluteUrl(`/${d.slug}`), lastModified: now, changeFrequency: "monthly", priority: 0.9 });
    for (const s of d.services) {
      entries.push({ url: absoluteUrl(`/${s.slug}`), lastModified: now, changeFrequency: "monthly", priority: 0.8 });
      for (const sub of s.subServices)
        entries.push({ url: absoluteUrl(`/${s.slug}/${sub.slug}`), lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    }
  }
  return entries;
}
