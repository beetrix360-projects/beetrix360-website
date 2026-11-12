import "server-only";
import staticMediaSeed from "../content/media-placements.seed.json";
import { getDbItem, putDbItem, queryDbByPk, deleteDbItem } from "./db";
import { getAllServicePages, renderServicePageByPath } from "./service-pages";
import type { ServiceGroupId } from "./service-pages/types";
import { absoluteUrl } from "./site-url";
import type {
  MediaPlacement,
  MediaPlaceholderSlotView,
  MediaSourceType,
  MediaType,
  PageMediaGroup,
} from "./types";

const PK_MEDIA_PLACEMENT = "MEDIA_PLACEMENT";

export const CATEGORY_LABELS: Record<string, string> = {
  home: "Home Page",
  "01": "AI Search & SEO",
  "02": "Paid Media",
  "03": "Brand & Social",
  "04": "AI Content",
  "05": "Web & Conversion",
  "06": "AI & Automation",
  company: "Company & Inner Pages",
};

export function normalizePageSlug(slugOrPath: string): string {
  if (!slugOrPath) return "home";
  const trimmed = slugOrPath.trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed || trimmed === "home") return "home";
  return trimmed;
}

export function pageSlugToPath(pageSlug: string): string {
  const norm = normalizePageSlug(pageSlug);
  return norm === "home" ? "/" : `/${norm}`;
}

export function buildPlacementId(pageSlug: string, placeholderKey: string): string {
  return `${normalizePageSlug(pageSlug)}__${placeholderKey.trim()}`;
}

export function parsePlacementId(id: string): { pageSlug: string; placeholderKey: string } | null {
  const idx = id.indexOf("__");
  if (idx === -1) return null;
  return {
    pageSlug: normalizePageSlug(id.slice(0, idx)),
    placeholderKey: id.slice(idx + 2).trim(),
  };
}

function buildSk(pageSlug: string, placeholderKey: string): string {
  return `${normalizePageSlug(pageSlug)}#${placeholderKey.trim()}`;
}

interface DiscoveredSlot {
  placeholderKey: string;
  label: string;
  dimensions: string;
  defaultAltText: string;
  defaultMediaType: MediaType;
}

interface DiscoveredPage {
  pageSlug: string;
  pagePath: string;
  pageTitle: string;
  category: string;
  slots: DiscoveredSlot[];
}

const HOME_DEFAULT_SLOTS: DiscoveredSlot[] = [
  {
    placeholderKey: "hero_showreel_video",
    label: "Hero Section · Watch the 60s showreel (Video)",
    dimensions: "1920 × 1080",
    defaultAltText: "Beetrix360 AI Revenue Engine — 60-second overview showreel video",
    defaultMediaType: "VIDEO",
  },
  {
    placeholderKey: "pillar_card_01",
    label: "Pillar 01 · Digitize — Enterprise Digitization (Website Mockup)",
    dimensions: "1200 × 900",
    defaultAltText: "Pillar 01 · Enterprise Digitization website mockup and funnels architecture",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "pillar_card_02",
    label: "Pillar 02 · Automate — Workflow Automation (Screen Capture / Loop)",
    dimensions: "1200 × 900",
    defaultAltText: "Pillar 02 · Workflow Automation screen capture and lead response loop",
    defaultMediaType: "VIDEO",
  },
  {
    placeholderKey: "pillar_card_03",
    label: "Pillar 03 · Agents — Agentic AI Teams (Agent Dashboard UI)",
    dimensions: "1200 × 900",
    defaultAltText: "Pillar 03 · Agentic AI Teams dashboard UI and autonomous digital employees",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "pillar_card_04",
    label: "Pillar 04 · Content — AI-Ready Content (Content Samples Collage)",
    dimensions: "1200 × 900",
    defaultAltText: "Pillar 04 · AI-Ready Content sample collage and GEO entity structuring",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "proof_case_01",
    label: "Proof Case 01 · Clean Energy — Tesla Solar Campaign Creative",
    dimensions: "1200 × 900",
    defaultAltText: "Tesla Solar campaign creative and organic search growth case study",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "proof_case_02",
    label: "Proof Case 02 · Enterprise SaaS — Microsoft Engagement Dashboard",
    dimensions: "1200 × 900",
    defaultAltText: "Microsoft enterprise engagement dashboard case study",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "proof_case_03",
    label: "Proof Case 03 · Global QSR — Subway Local Ad Creative",
    dimensions: "1200 × 900",
    defaultAltText: "Subway local ad creative and multi-location footfall case study",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "real_estate_01",
    label: "Real Estate 01 · West & Post (Oakville, Canada)",
    dimensions: "800 × 1066",
    defaultAltText: "West & Post Oakville real estate launch render showcase",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "real_estate_02",
    label: "Real Estate 02 · Elo 3 by Damac (Dubai, UAE)",
    dimensions: "800 × 1066",
    defaultAltText: "Elo 3 by Damac Dubai luxury property launch render showcase",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "real_estate_03",
    label: "Real Estate 03 · Bravo (Vaughan, Canada)",
    dimensions: "800 × 1066",
    defaultAltText: "Bravo Vaughan real estate launch render showcase",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "real_estate_04",
    label: "Real Estate 04 · IVY Gardens 2 (Dubai, UAE)",
    dimensions: "800 × 1066",
    defaultAltText: "IVY Gardens 2 Dubai luxury real estate render showcase",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "real_estate_05",
    label: "Real Estate 05 · River & Sky (Woodstock, Canada)",
    dimensions: "800 × 1066",
    defaultAltText: "River & Sky Woodstock property launch render showcase",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "real_estate_06",
    label: "Real Estate 06 · Bay Square (Dubai, UAE)",
    dimensions: "800 × 1066",
    defaultAltText: "Bay Square Dubai commercial & residential property render showcase",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "real_estate_07",
    label: "Real Estate 07 · Pickering City Centre (Pickering, Canada)",
    dimensions: "800 × 1066",
    defaultAltText: "Pickering City Centre urban development render showcase",
    defaultMediaType: "IMAGE",
  },
  {
    placeholderKey: "process_rollout_video",
    label: "Process Timeline · 2-min Walkthrough (Video)",
    dimensions: "1920 × 1080",
    defaultAltText: "Beetrix360 2-min process rollout and onboarding walkthrough video",
    defaultMediaType: "VIDEO",
  },
];

const COMPANY_INNER_PAGES: { slug: string; title: string }[] = [
  { slug: "about", title: "About Beetrix360" },
  { slug: "case-studies", title: "Case Studies" },
  { slug: "portfolio", title: "Portfolio" },
  { slug: "results", title: "Client Results" },
  { slug: "reviews", title: "Client Reviews & Testimonials" },
  { slug: "contact", title: "Contact Us" },
  { slug: "blog", title: "Blog & Insights" },
  { slug: "pricing", title: "Pricing & Engagement Packages" },
  { slug: "industries", title: "Industries We Serve" },
  { slug: "challenges/invisible-in-chatgpt", title: "Challenge: Invisible in ChatGPT" },
  { slug: "challenges/rising-ad-costs", title: "Challenge: Rising Ad Costs" },
  { slug: "challenges/website-not-converting", title: "Challenge: Website Not Converting" },
  { slug: "challenges/content-doesnt-scale", title: "Challenge: Content Doesn't Scale" },
  { slug: "challenges/manual-ops-bottlenecks", title: "Challenge: Manual Ops Bottlenecks" },
  { slug: "challenges/agency-not-delivering-roi", title: "Challenge: Agency Not Delivering ROI" },
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&times;/g, "×");
}

function parseServiceHtmlSlots(htmlContent: string, pageTitle: string): DiscoveredSlot[] {
  const slots: DiscoveredSlot[] = [];
  const seen = new Set<string>();

  const slotRegex =
    /<(figure|span)\s+class="imgs[^"]*"[^>]*data-slot="([^"]+)"[^>]*data-alt="([^"]*)"[^>]*>[\s\S]*?<span\s+class="il1">([\s\S]*?)<\/span>(?:<span\s+class="il2">([\s\S]*?)<\/span>)?[\s\S]*?<\/\1>/gi;

  let m: RegExpExecArray | null;
  while ((m = slotRegex.exec(htmlContent)) !== null) {
    const placeholderKey = m[2].trim();
    if (!placeholderKey || seen.has(placeholderKey)) continue;
    seen.add(placeholderKey);

    const rawAlt = decodeHtmlEntities(m[3].trim());
    const rawLabel = decodeHtmlEntities(m[4].replace(/<[^>]+>/g, "").trim());
    const rawDim = decodeHtmlEntities((m[5] || "").replace(/<[^>]+>/g, "").trim());

    slots.push({
      placeholderKey,
      label: rawLabel || placeholderKey,
      dimensions: rawDim || "1200 × 900",
      defaultAltText: rawAlt || `${pageTitle} — ${rawLabel || placeholderKey}`,
      defaultMediaType: "IMAGE",
    });
  }

  return slots;
}

let cachedDiscoveredPages: DiscoveredPage[] | null = null;

export function discoverAllPagePlaceholders(): DiscoveredPage[] {
  if (cachedDiscoveredPages) return cachedDiscoveredPages;

  const pages: DiscoveredPage[] = [];

  // 1. Home Page
  pages.push({
    pageSlug: "home",
    pagePath: "/",
    pageTitle: "Home Page (Main Landing Page)",
    category: "home",
    slots: HOME_DEFAULT_SLOTS,
  });

  // 2. All 134 Service & Pricing Pages across 6 groups
  const servicePages = getAllServicePages();
  for (const sp of servicePages) {
    const pageSlug = normalizePageSlug(sp.path);
    const rendered = renderServicePageByPath(sp.path);
    const slots = rendered
      ? parseServiceHtmlSlots(rendered.htmlContent, sp.name)
      : [];

    pages.push({
      pageSlug,
      pagePath: sp.path,
      pageTitle: sp.name,
      category: sp.group,
      slots,
    });
  }

  // 3. Company & Inner Pages
  for (const cp of COMPANY_INNER_PAGES) {
    const pageSlug = normalizePageSlug(cp.slug);
    pages.push({
      pageSlug,
      pagePath: `/${pageSlug}`,
      pageTitle: cp.title,
      category: "company",
      slots: [
        {
          placeholderKey: "hero_banner",
          label: `${cp.title} — Hero Banner`,
          dimensions: "1600 × 900",
          defaultAltText: `${cp.title} hero banner visual — Beetrix360`,
          defaultMediaType: "IMAGE",
        },
        {
          placeholderKey: "featured_media",
          label: `${cp.title} — Featured Visual / Video`,
          dimensions: "1200 × 800",
          defaultAltText: `${cp.title} featured showcase media — Beetrix360`,
          defaultMediaType: "IMAGE",
        },
        {
          placeholderKey: "proof_showcase",
          label: `${cp.title} — Proof & Results Showcase`,
          dimensions: "1200 × 675",
          defaultAltText: `${cp.title} performance and ROI proof showcase`,
          defaultMediaType: "IMAGE",
        },
      ],
    });
  }

  cachedDiscoveredPages = pages;
  return pages;
}

// ============================================================================
// Database Access & Merging
// ============================================================================

export async function getAllStoredPlacements(): Promise<MediaPlacement[]> {
  const map = new Map<string, MediaPlacement>();

  // 1. Load the comprehensive baseline media seed (all 4,609 curated slots across 150 pages)
  try {
    const seedMap = (staticMediaSeed || {}) as Record<string, any>;
    for (const [k, v] of Object.entries(seedMap)) {
      if (k.startsWith(`${PK_MEDIA_PLACEMENT}:`) && v && typeof v === "object") {
        const item = v as MediaPlacement;
        const key = `${normalizePageSlug(item.pageSlug)}#${item.placeholderKey.trim()}`;
        map.set(key, item);
      }
    }
  } catch (e) {
    console.error("[media-placements] Failed to load media seed fallback:", e);
  }

  // 2. Query DynamoDB (or local DB) for custom user edits and overlay them on top of the seed
  try {
    const records = await queryDbByPk<MediaPlacement>(PK_MEDIA_PLACEMENT);
    if (Array.isArray(records)) {
      for (const rec of records) {
        if (rec && rec.placeholderKey) {
          const key = `${normalizePageSlug(rec.pageSlug)}#${rec.placeholderKey.trim()}`;
          const existing = map.get(key);
          map.set(key, {
            ...(existing || {}),
            ...rec,
          });
        }
      }
    }
  } catch (err) {
    console.error("[media-placements] Error reading stored placements from DB:", err);
  }

  return Array.from(map.values());
}

export async function getMediaPlacementById(id: string): Promise<MediaPlacement | null> {
  const parsed = parsePlacementId(id);
  if (!parsed) return null;
  const sk = buildSk(parsed.pageSlug, parsed.placeholderKey);
  const saved = await getDbItem<MediaPlacement>(PK_MEDIA_PLACEMENT, sk);
  if (saved && saved.mediaUrl) {
    return saved;
  }

  // Fallback to static seed
  try {
    const seedMap = (staticMediaSeed || {}) as Record<string, any>;
    const match = seedMap[`${PK_MEDIA_PLACEMENT}:${sk}`];
    if (match) return match as MediaPlacement;
  } catch {}
  return null;
}

export async function getPageMediaPlacements(
  rawPageSlug: string
): Promise<MediaPlaceholderSlotView[]> {
  const pageSlug = normalizePageSlug(rawPageSlug);
  const allDiscovered = discoverAllPagePlaceholders();
  const discoveredPage = allDiscovered.find((p) => p.pageSlug === pageSlug);

  const allStored = await getAllStoredPlacements();
  const pageStored = allStored.filter((item) => normalizePageSlug(item.pageSlug) === pageSlug);
  const storedBySlot = new Map<string, MediaPlacement>();
  for (const item of pageStored) {
    storedBySlot.set(item.placeholderKey, item);
  }

  const results: MediaPlaceholderSlotView[] = [];
  const handledKeys = new Set<string>();

  if (discoveredPage) {
    for (const slot of discoveredPage.slots) {
      handledKeys.add(slot.placeholderKey);
      const saved = storedBySlot.get(slot.placeholderKey);
      const mediaUrl = saved?.mediaUrl?.trim() || "";
      results.push({
        id: buildPlacementId(pageSlug, slot.placeholderKey),
        pageSlug,
        placeholderKey: slot.placeholderKey,
        label: saved?.label || slot.label,
        mediaType: saved?.mediaType || slot.defaultMediaType,
        sourceType: saved?.sourceType || "UPLOAD",
        mediaUrl,
        altText: saved?.altText || slot.defaultAltText,
        seoTitle: saved?.seoTitle || "",
        seoDescription: saved?.seoDescription || "",
        dimensions: saved?.dimensions || slot.dimensions,
        updatedAt: saved?.updatedAt || "",
        isConfigured: mediaUrl.length > 0,
        isCustomSlot: false,
        defaultAltText: slot.defaultAltText,
      });
    }
  }

  // Append any custom registered placeholders for this page
  for (const saved of pageStored) {
    if (handledKeys.has(saved.placeholderKey)) continue;
    const mediaUrl = saved.mediaUrl?.trim() || "";
    results.push({
      ...saved,
      id: buildPlacementId(pageSlug, saved.placeholderKey),
      pageSlug,
      mediaUrl,
      isConfigured: mediaUrl.length > 0,
      isCustomSlot: true,
      defaultAltText: saved.altText || "",
    });
  }

  return results;
}

export async function getPageMediaPlacementsMap(
  rawPageSlug: string
): Promise<Map<string, MediaPlaceholderSlotView>> {
  const placements = await getPageMediaPlacements(rawPageSlug);
  const map = new Map<string, MediaPlaceholderSlotView>();
  for (const p of placements) {
    if (p.isConfigured && p.mediaUrl) {
      map.set(p.placeholderKey, p);
    }
  }
  return map;
}

export async function getAllPageMediaGroups(options?: {
  category?: string;
  pageSlug?: string;
}): Promise<PageMediaGroup[]> {
  const allDiscovered = discoverAllPagePlaceholders();
  const allStored = await getAllStoredPlacements();

  const storedByPage = new Map<string, Map<string, MediaPlacement>>();
  for (const item of allStored) {
    const pSlug = normalizePageSlug(item.pageSlug);
    if (!storedByPage.has(pSlug)) {
      storedByPage.set(pSlug, new Map());
    }
    storedByPage.get(pSlug)!.set(item.placeholderKey, item);
  }

  const groups: PageMediaGroup[] = [];
  const seenPageSlugs = new Set<string>();

  for (const dp of allDiscovered) {
    if (options?.category && dp.category !== options.category) continue;
    if (options?.pageSlug && dp.pageSlug !== normalizePageSlug(options.pageSlug)) continue;

    seenPageSlugs.add(dp.pageSlug);
    const pageMap = storedByPage.get(dp.pageSlug) || new Map<string, MediaPlacement>();
    const handledKeys = new Set<string>();
    const placements: MediaPlaceholderSlotView[] = [];

    for (const slot of dp.slots) {
      handledKeys.add(slot.placeholderKey);
      const saved = pageMap.get(slot.placeholderKey);
      const mediaUrl = saved?.mediaUrl?.trim() || "";
      placements.push({
        id: buildPlacementId(dp.pageSlug, slot.placeholderKey),
        pageSlug: dp.pageSlug,
        placeholderKey: slot.placeholderKey,
        label: saved?.label || slot.label,
        mediaType: saved?.mediaType || slot.defaultMediaType,
        sourceType: saved?.sourceType || "UPLOAD",
        mediaUrl,
        altText: saved?.altText || slot.defaultAltText,
        seoTitle: saved?.seoTitle || "",
        seoDescription: saved?.seoDescription || "",
        dimensions: saved?.dimensions || slot.dimensions,
        updatedAt: saved?.updatedAt || "",
        isConfigured: mediaUrl.length > 0,
        isCustomSlot: false,
        defaultAltText: slot.defaultAltText,
      });
    }

    for (const [key, saved] of pageMap.entries()) {
      if (handledKeys.has(key)) continue;
      const mediaUrl = saved.mediaUrl?.trim() || "";
      placements.push({
        ...saved,
        id: buildPlacementId(dp.pageSlug, key),
        pageSlug: dp.pageSlug,
        mediaUrl,
        isConfigured: mediaUrl.length > 0,
        isCustomSlot: true,
        defaultAltText: saved.altText || "",
      });
    }

    const configuredCount = placements.filter((p) => p.isConfigured).length;
    groups.push({
      pageSlug: dp.pageSlug,
      pagePath: dp.pagePath,
      pageTitle: dp.pageTitle,
      category: dp.category,
      placements,
      configuredCount,
      totalCount: placements.length,
    });
  }

  return groups;
}

export interface UpsertMediaPlacementInput {
  pageSlug: string;
  placeholderKey: string;
  label?: string;
  mediaType?: MediaType;
  sourceType?: MediaSourceType;
  mediaUrl: string;
  altText: string;
  seoTitle?: string;
  seoDescription?: string;
  dimensions?: string;
  /** Optional bulk scope: apply to this page only ("page"), all pages in same category ("category"), or all pages with this slot ("all") */
  applyScope?: "page" | "category" | "all";
}

export async function upsertMediaPlacement(
  input: UpsertMediaPlacementInput
): Promise<{ primary: MediaPlacement; updatedCount: number }> {
  const pageSlug = normalizePageSlug(input.pageSlug);
  const placeholderKey = input.placeholderKey.trim();
  const now = new Date().toISOString();

  const allDiscovered = discoverAllPagePlaceholders();
  const currentDiscoveredPage = allDiscovered.find((p) => p.pageSlug === pageSlug);
  const currentSlot = currentDiscoveredPage?.slots.find(
    (s) => s.placeholderKey === placeholderKey
  );

  const sk = buildSk(pageSlug, placeholderKey);
  const existing = await getDbItem<MediaPlacement>(PK_MEDIA_PLACEMENT, sk);

  const primaryRecord: MediaPlacement = {
    id: buildPlacementId(pageSlug, placeholderKey),
    pageSlug,
    placeholderKey,
    label: input.label?.trim() || currentSlot?.label || existing?.label || placeholderKey,
    mediaType: input.mediaType || existing?.mediaType || currentSlot?.defaultMediaType || "IMAGE",
    sourceType: input.sourceType || existing?.sourceType || "UPLOAD",
    mediaUrl: input.mediaUrl.trim(),
    altText:
      input.altText.trim() ||
      existing?.altText ||
      currentSlot?.defaultAltText ||
      `${pageSlug} ${placeholderKey}`,
    seoTitle: input.seoTitle !== undefined ? input.seoTitle.trim() : existing?.seoTitle || "",
    seoDescription:
      input.seoDescription !== undefined
        ? input.seoDescription.trim()
        : existing?.seoDescription || "",
    dimensions: input.dimensions || currentSlot?.dimensions || existing?.dimensions || "1200 × 900",
    updatedAt: now,
  };

  await putDbItem(PK_MEDIA_PLACEMENT, sk, primaryRecord);
  let updatedCount = 1;

  // Handle optional bulk-apply across matching placeholderKey in category or all pages
  const scope = input.applyScope || "page";
  if (scope === "category" || scope === "all") {
    const targetCategory = currentDiscoveredPage?.category;
    for (const dp of allDiscovered) {
      if (dp.pageSlug === pageSlug) continue;
      if (scope === "category" && dp.category !== targetCategory) continue;
      const matchingSlot = dp.slots.find((s) => s.placeholderKey === placeholderKey);
      if (!matchingSlot) continue;

      const targetSk = buildSk(dp.pageSlug, placeholderKey);
      const targetRecord: MediaPlacement = {
        id: buildPlacementId(dp.pageSlug, placeholderKey),
        pageSlug: dp.pageSlug,
        placeholderKey,
        label: matchingSlot.label,
        mediaType: primaryRecord.mediaType,
        sourceType: primaryRecord.sourceType,
        mediaUrl: primaryRecord.mediaUrl,
        altText: input.altText.trim() || matchingSlot.defaultAltText,
        seoTitle: primaryRecord.seoTitle,
        seoDescription: primaryRecord.seoDescription,
        dimensions: matchingSlot.dimensions,
        updatedAt: now,
      };
      await putDbItem(PK_MEDIA_PLACEMENT, targetSk, targetRecord);
      updatedCount++;
    }
  }

  return { primary: primaryRecord, updatedCount };
}

export async function deleteMediaPlacement(id: string): Promise<boolean> {
  const parsed = parsePlacementId(id);
  if (!parsed) return false;
  const sk = buildSk(parsed.pageSlug, parsed.placeholderKey);
  await deleteDbItem(PK_MEDIA_PLACEMENT, sk);
  return true;
}

// ============================================================================
// Server-Side Service Page HTML Slot Injection
// ============================================================================

function escapeHtmlAttr(val: string): string {
  return (val || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function injectMediaPlacementsIntoServiceHtml(
  htmlContent: string,
  placementsMap: Map<string, MediaPlaceholderSlotView>
): string {
  if (!placementsMap || placementsMap.size === 0) return htmlContent;

  const slotRegex =
    /<(figure|span)\s+class="(imgs[^"]*)"([^>]*?)data-slot="([^"]+)"([^>]*?)>([\s\S]*?)<\/\1>/gi;

  return htmlContent.replace(
    slotRegex,
    (fullMatch, tag, classAttr, beforeAttr, slotKey, afterAttr) => {
      const placement = placementsMap.get(slotKey.trim());
      if (!placement || !placement.isConfigured || !placement.mediaUrl) {
        return fullMatch;
      }

      const nextClass = classAttr.includes(" has") ? classAttr : `${classAttr} has`;
      const src = escapeHtmlAttr(placement.mediaUrl);
      const alt = escapeHtmlAttr(placement.altText || placement.label);
      const titleAttr = placement.seoTitle
        ? ` title="${escapeHtmlAttr(placement.seoTitle)}"`
        : "";

      if (placement.mediaType === "VIDEO") {
        const innerVideo = `<video src="${src}" aria-label="${alt}"${titleAttr} style="width:100%;height:100%;object-fit:cover;display:block" autoplay muted loop playsinline controls></video>`;
        return `<${tag} class="${nextClass}"${beforeAttr}data-slot="${slotKey}"${afterAttr}>${innerVideo}</${tag}>`;
      }

      const innerImg = `<img src="${src}" alt="${alt}"${titleAttr} loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block" />`;
      return `<${tag} class="${nextClass}"${beforeAttr}data-slot="${slotKey}"${afterAttr}>${innerImg}</${tag}>`;
    }
  );
}

// ============================================================================
// SEO Metadata (<head> OpenGraph / Twitter & JSON-LD Structured Data)
// ============================================================================

function parseDimensions(dimStr?: string): { width: number; height: number } {
  if (!dimStr) return { width: 1200, height: 630 };
  const m = dimStr.match(/(\d+)\s*[×xX]\s*(\d+)/);
  if (!m) return { width: 1200, height: 630 };
  return {
    width: parseInt(m[1], 10) || 1200,
    height: parseInt(m[2], 10) || 630,
  };
}

function resolvePublicMediaUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return absoluteUrl(url.startsWith("/") ? url : `/${url}`);
}

export interface PageMediaSeoMetadata {
  openGraphImages: {
    url: string;
    width: number;
    height: number;
    alt: string;
  }[];
  twitterImages: {
    url: string;
    alt: string;
  }[];
  openGraphVideos: {
    url: string;
    width: number;
    height: number;
  }[];
}

export async function getPageMediaMetadata(
  rawPageSlug: string
): Promise<PageMediaSeoMetadata> {
  const placements = await getPageMediaPlacements(rawPageSlug);
  const configured = placements.filter((p) => p.isConfigured && p.mediaUrl);

  const openGraphImages: PageMediaSeoMetadata["openGraphImages"] = [];
  const twitterImages: PageMediaSeoMetadata["twitterImages"] = [];
  const openGraphVideos: PageMediaSeoMetadata["openGraphVideos"] = [];

  for (const p of configured) {
    const absUrl = resolvePublicMediaUrl(p.mediaUrl);
    const { width, height } = parseDimensions(p.dimensions);
    const alt = p.altText || p.seoTitle || p.label;

    if (p.mediaType === "IMAGE") {
      openGraphImages.push({
        url: absUrl,
        width,
        height,
        alt,
      });
      twitterImages.push({
        url: absUrl,
        alt,
      });
    } else if (p.mediaType === "VIDEO") {
      openGraphVideos.push({
        url: absUrl,
        width,
        height,
      });
    }
  }

  return {
    openGraphImages,
    twitterImages,
    openGraphVideos,
  };
}

export async function buildPageMediaJsonLd(
  rawPageSlug: string
): Promise<Record<string, any>[]> {
  const pageSlug = normalizePageSlug(rawPageSlug);
  const pageUrl = absoluteUrl(pageSlugToPath(pageSlug));
  const placements = await getPageMediaPlacements(pageSlug);
  const configured = placements.filter((p) => p.isConfigured && p.mediaUrl);

  const nodes: Record<string, any>[] = [];

  configured.forEach((p, idx) => {
    const contentUrl = resolvePublicMediaUrl(p.mediaUrl);
    const { width, height } = parseDimensions(p.dimensions);
    const name = p.seoTitle || p.altText || p.label;
    const description = p.seoDescription || p.altText || p.label;

    if (p.mediaType === "VIDEO") {
      nodes.push({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "@id": `${pageUrl}#video-${p.placeholderKey}`,
        name,
        description,
        caption: p.altText || description,
        contentUrl,
        embedUrl: contentUrl,
        width,
        height,
        uploadDate: p.updatedAt || new Date().toISOString(),
        isFamilyFriendly: true,
      });
    } else {
      nodes.push({
        "@context": "https://schema.org",
        "@type": "ImageObject",
        "@id": `${pageUrl}#image-${p.placeholderKey}`,
        name,
        description,
        caption: p.altText || description,
        contentUrl,
        url: contentUrl,
        width,
        height,
        representativeOfPage: idx === 0,
      });
    }
  });

  return nodes;
}

