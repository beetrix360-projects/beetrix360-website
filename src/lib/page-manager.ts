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
 * Seed pages from site-structure.json if DB is empty (Disabled in IA v2 - seeding only via scripts/migrate-ia-v2.ts)
 */
export async function seedPagesIfEmpty(): Promise<void> {
  throw new Error("Disabled until the new editor (Phase 6) is ready");
}

function normalizePageRecord(p: any): PageRecord {
  const title = p.title || p.h1 || p.menuLabel || p.seo?.titleTag || p.slug || "Untitled Page";
  const slug = p.slug || (p.path ? p.path.replace(/^\//, "") : "");
  const path = p.path || (slug ? `/${slug}` : "/");
  return {
    ...p,
    id: p.id || `page_${slug}`,
    slug,
    title,
    parentId: p.parentId || null,
    pageType: p.pageType || "service",
    status: p.status || (p.contentStatus === "ready" ? "published" : "draft"),
    keyword: p.keyword || p.targetKeyword || "",
    order: p.order || 0,
    seo: {
      canonical: path,
      noIndex: false,
      ...p.seo,
      title: p.seo?.title || p.seo?.titleTag || title,
      description: p.seo?.description || p.seo?.metaDescription || "",
    },
    sections: p.sections || [],
    updatedAt: p.updatedAt || new Date().toISOString(),
  };
}

/**
 * Fetch all pages from DB
 */
export async function getAllPages(): Promise<PageRecord[]> {
  const pages = await queryDbByPk<any>("PAGE");
  return pages.map(normalizePageRecord).sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Fetch page by id
 */
export async function getPageById(id: string): Promise<PageRecord | null> {
  const all = await getAllPages();
  return all.find((p) => p.id === id) || null;
}

/**
 * Fetch page by path
 */
export async function getPageByPath(path: string): Promise<PageRecord | null> {
  const norm = path.startsWith("/") ? path : `/${path}`;
  const all = await getAllPages();
  return all.find((p: any) => (p.path ? p.path === norm : `/${p.slug}` === norm)) || null;
}

/**
 * Fetch page by slug (Deprecated in IA v2: lookup by id or path instead)
 */
export async function getPageBySlug(slug: string): Promise<PageRecord | null> {
  return null;
}

/**
 * Save or update a page (Disabled until Phase 6)
 */
export async function savePage(page: PageRecord): Promise<void> {
  throw new Error("Disabled until the new editor (Phase 6) is ready");
}

/**
 * Delete a page by slug (Disabled until Phase 6)
 */
export async function deletePageBySlug(slug: string): Promise<void> {
  throw new Error("Disabled until the new editor (Phase 6) is ready");
}
