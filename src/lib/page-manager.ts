import "server-only";
import { getDbItem, putDbItem, queryDbByPk, deleteDbItem } from "./db";
import structure from "@/content/site-structure.json";

export type PageType = "division" | "service" | "sub-service" | "custom";
export type PageStatus = "published" | "draft";

export interface SectionBlock {
  id: string;
  type: "hero" | "text" | "linkCards" | "faqs" | "proof" | "cta" | "custom";
  title?: string;
  content: Record<string, any>;
  seoSchema?: {
    schemaType?: "FAQPage" | "Service" | "HowTo" | "Review" | "LocalBusiness" | "Custom";
    jsonLdSnippet?: string;
  };
}

export interface PageRecord {
  id: string;
  slug: string;
  title: string;
  parentId: string | null; // slug of parent page or null for top-level
  pageType: PageType;
  status: PageStatus;
  keyword?: string;
  order?: number;
  seo: {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    noIndex?: boolean;
    customJsonLd?: string;
  };
  sections: SectionBlock[];
  updatedAt: string;
}

/**
 * Seed pages from site-structure.json if DB is empty
 */
export async function seedPagesIfEmpty(): Promise<void> {
  const existing = await queryDbByPk<PageRecord>("PAGE");
  if (existing.length > 0) return;

  const records: PageRecord[] = [];
  const divisions = structure.divisions || [];

  for (let dIdx = 0; dIdx < divisions.length; dIdx++) {
    const d = divisions[dIdx];
    // Parent Division Page
    records.push({
      id: `page_${d.slug}`,
      slug: d.slug,
      title: d.name,
      parentId: null,
      pageType: "division",
      status: "published",
      keyword: d.name,
      order: dIdx + 1,
      seo: {
        title: `${d.name} Services | BeeTrix360`,
        description: `Explore enterprise ${d.name} capabilities, performance architectures, and proven solutions.`,
      },
      sections: [
        {
          id: `sec_${d.slug}_hero`,
          type: "hero",
          title: d.name,
          content: { label: "Enterprise Solutions", headline: d.name, description: `Specialized ${d.name} infrastructure.` },
        },
      ],
      updatedAt: new Date().toISOString(),
    });

    // Child Services
    const services = d.services || [];
    for (let sIdx = 0; sIdx < services.length; sIdx++) {
      const s = services[sIdx];
      records.push({
        id: `page_${s.slug}`,
        slug: s.slug,
        title: s.name,
        parentId: d.slug,
        pageType: "service",
        status: "published",
        keyword: s.keyword || s.name,
        order: sIdx + 1,
        seo: {
          title: `${s.name} | ${d.name} | BeeTrix360`,
          description: `High-impact ${s.name} crafted for scaling businesses.`,
        },
        sections: [
          {
            id: `sec_${s.slug}_hero`,
            type: "hero",
            title: s.name,
            content: { label: d.name, headline: s.name, description: `Comprehensive ${s.name} workflows.` },
          },
        ],
        updatedAt: new Date().toISOString(),
      });

      // Grandchild Sub-Services
      const subServices = s.subServices || [];
      for (let subIdx = 0; subIdx < subServices.length; subIdx++) {
        const sub = subServices[subIdx];
        records.push({
          id: `page_${sub.slug}`,
          slug: `${s.slug}/${sub.slug}`,
          title: sub.name,
          parentId: s.slug,
          pageType: "sub-service",
          status: "published",
          keyword: sub.keyword || sub.name,
          order: subIdx + 1,
          seo: {
            title: `${sub.name} | ${s.name} | BeeTrix360`,
            description: `Targeted ${sub.name} designed to maximize ROI and operational velocity.`,
          },
          sections: [],
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  for (const page of records) {
    await putDbItem("PAGE", page.slug, page);
  }
}

/**
 * Fetch all pages from DB
 */
export async function getAllPages(): Promise<PageRecord[]> {
  await seedPagesIfEmpty();
  const pages = await queryDbByPk<PageRecord>("PAGE");
  return pages.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Fetch page by slug
 */
export async function getPageBySlug(slug: string): Promise<PageRecord | null> {
  await seedPagesIfEmpty();
  return await getDbItem<PageRecord>("PAGE", slug);
}

/**
 * Save or update a page
 */
export async function savePage(page: PageRecord): Promise<void> {
  page.updatedAt = new Date().toISOString();
  await putDbItem("PAGE", page.slug, page);
}

/**
 * Delete a page by slug
 */
export async function deletePageBySlug(slug: string): Promise<void> {
  await deleteDbItem("PAGE", slug);
}
