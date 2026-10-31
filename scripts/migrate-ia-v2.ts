// Intercept server-only for standalone script runs
try {
  const m = require.resolve("server-only");
  (require.cache as any)[m] = { id: m, filename: m, loaded: true, exports: {} };
} catch {}

import fs from "fs";
import path from "path";
import seedData from "../src/content/ia-v2.seed.json";
import {
  getDbItem,
  putDbItem,
  queryDbByPk,
  deleteDbItem,
  normalizePath,
  exportAllDbRecords,
} from "../src/lib/db";
import type { PageRecordV2, NavigationRecord, RedirectRecord } from "../src/lib/types";

// Master 301 Redirect Mapping (90 Active Legacy Redirects, Excluding Identity Rows)
export const RAW_REDIRECT_MAP: Record<string, { to: string; note: string }> = {
  // Divisions
  "/paid-media-buying": { to: "/paid-media", note: "Division remapped to PPC hub (retired division slug)" },
  "/ai-automation": { to: "/ai", note: "Division remapped to AI Agents & Automation hub (retired division slug)" },
  "/ai-content-generation": { to: "/ai-content", note: "Division remapped to AI Content hub (retired division slug)" },

  // Digital Marketing Services & Sub-services
  "/seo-services": { to: "/seo", note: "Service hub renamed to /seo" },
  "/seo-services/local-seo": { to: "/seo/local-seo", note: "Moved under /seo" },
  "/seo-services/technical-seo": { to: "/seo/technical-seo", note: "Moved under /seo" },
  "/seo-services/on-page-seo": { to: "/seo/on-page-seo", note: "Moved under /seo" },
  "/seo-services/ecommerce-seo": { to: "/seo/ecommerce-seo", note: "Moved under /seo" },
  "/seo-services/link-building": { to: "/seo/link-building", note: "Moved under /seo" },
  "/seo-services/keyword-research": { to: "/seo/keyword-research", note: "Moved under /seo" },
  "/seo-services/answer-engine-optimization": { to: "/seo/answer-engine-optimization", note: "Moved under /seo" },
  "/seo-services/generative-engine-optimization": { to: "/seo/generative-engine-optimization", note: "Moved under /seo" },

  "/social-media-management": { to: "/social-media", note: "Service hub renamed to /social-media" },
  "/social-media-management/instagram-management": { to: "/social-media/instagram-management", note: "Moved under /social-media" },
  "/social-media-management/facebook-management": { to: "/social-media/facebook-management", note: "Moved under /social-media" },
  "/social-media-management/linkedin-management": { to: "/social-media/linkedin-management", note: "Moved under /social-media" },
  "/social-media-management/tiktok-management": { to: "/social-media/tiktok-management", note: "Moved under /social-media" },
  "/social-media-management/content-creation": { to: "/social-media/content-and-design", note: "Renamed to /social-media/content-and-design" },
  "/social-media-management/community-management": { to: "/social-media/community-management", note: "Moved under /social-media" },

  "/branding-services": { to: "/branding", note: "Service hub renamed to /branding" },
  "/branding-services/branding-strategy": { to: "/branding/brand-strategy", note: "Renamed to brand-strategy" },
  "/branding-services/brand-identity-design": { to: "/branding/brand-identity-design", note: "Moved under /branding" },
  "/branding-services/logo-design": { to: "/branding/logo-design", note: "Moved under /branding" },
  "/branding-services/collateral-design": { to: "/branding/collateral-design", note: "Moved under /branding" },
  "/branding-services/packaging-label-design": { to: "/branding/packaging-label-design", note: "Moved under /branding" },

  "/email-marketing-services": { to: "/email-marketing", note: "Service hub renamed to /email-marketing" },
  "/email-marketing-services/email-campaigns": { to: "/email-marketing/campaign-management", note: "Renamed to campaign-management" },
  "/email-marketing-services/email-automation": { to: "/email-marketing/automation", note: "Renamed to automation" },
  "/email-marketing-services/newsletter-management": { to: "/email-marketing/newsletter-management", note: "Moved under /email-marketing" },
  "/email-marketing-services/email-design": { to: "/email-marketing/design-testing", note: "Renamed to design-testing" },

  "/sales-funnel-development": { to: "/conversion/sales-funnels", note: "Moved under /conversion" },
  "/sales-funnel-development/lead-generation": { to: "/conversion/lead-generation", note: "Moved under /conversion" },
  "/sales-funnel-development/conversion-rate-optimization": { to: "/conversion", note: "Remapped to /conversion hub" },
  "/sales-funnel-development/landing-pages": { to: "/web-design/landing-pages", note: "Moved to /web-design/landing-pages" },
  "/sales-funnel-development/marketing-automation": { to: "/automation/marketing-automation", note: "Moved to /automation/marketing-automation" },

  // Paid Media Services & Sub-services
  "/google-ads-management": { to: "/paid-media/google-ads", note: "Moved under /paid-media" },
  "/meta-ads-management": { to: "/paid-media/meta-ads", note: "Moved under /paid-media" },
  "/tiktok-ads-management": { to: "/paid-media/tiktok-ads", note: "Moved under /paid-media" },
  "/walmart-ads-management": { to: "/marketplaces/walmart", note: "Moved under /marketplaces" },
  "/target-ads-management": { to: "/marketplaces/target", note: "Moved under /marketplaces" },
  "/amazon-management": { to: "/marketplaces/amazon", note: "Moved under /marketplaces" },
  "/amazon-management/amazon-ads": { to: "/marketplaces/amazon/advertising", note: "Moved under /marketplaces/amazon" },
  "/amazon-management/amazon-dsp": { to: "/marketplaces/amazon/dsp", note: "Moved under /marketplaces/amazon" },
  "/amazon-management/seller-operations": { to: "/marketplaces/amazon/seller-operations", note: "Moved under /marketplaces/amazon" },
  "/amazon-management/creator-connections": { to: "/marketplaces/amazon/creator-connections", note: "Moved under /marketplaces/amazon" },
  "/amazon-management/brand-management": { to: "/marketplaces/amazon/brand-management", note: "Moved under /marketplaces/amazon" },

  // AI Automation Services & Sub-services
  "/ai-agent-development": { to: "/ai/agent-development", note: "Moved under /ai" },
  "/ai-agent-development/custom-ai-agents": { to: "/ai/agent-development/custom-ai-agents", note: "Moved under /ai" },
  "/ai-agent-development/ai-sales-agents": { to: "/ai/agent-development/ai-sales-agents", note: "Moved under /ai" },
  "/ai-agent-development/ai-customer-service-agents": { to: "/ai/agent-development/ai-customer-service-agents", note: "Moved under /ai" },
  "/ai-agent-development/multi-agent-systems": { to: "/ai/agent-development/multi-agent-systems", note: "Moved under /ai" },

  "/ai-chatbot-development": { to: "/ai/chatbot-development", note: "Moved under /ai" },
  "/ai-chatbot-development/website-chatbots": { to: "/ai/chatbot-development/website-chatbots", note: "Moved under /ai" },
  "/ai-chatbot-development/whatsapp-chatbots": { to: "/ai/chatbot-development/whatsapp-chatbots", note: "Moved under /ai" },
  "/ai-chatbot-development/ecommerce-chatbots": { to: "/ai/chatbot-development/ecommerce-chatbots", note: "Moved under /ai" },
  "/ai-chatbot-development/customer-service-chatbots": { to: "/ai/agent-development/ai-customer-service-agents", note: "Mapped to /ai/agent-development/ai-customer-service-agents" },

  "/ai-integration-services": { to: "/ai/integration", note: "Moved under /ai" },
  "/ai-integration-services/chatgpt-integration": { to: "/ai/integration/chatgpt-integration", note: "Moved under /ai" },
  "/ai-integration-services/crm-ai-integration": { to: "/ai/integration/crm-ai-integration", note: "Moved under /ai" },
  "/ai-integration-services/ai-software-integration": { to: "/ai/integration/ai-software-integration", note: "Moved under /ai" },

  "/workflow-automation-services": { to: "/automation", note: "Remapped to /automation hub" },
  "/workflow-automation-services/business-process-automation": { to: "/automation/business-process-automation", note: "Moved under /automation" },
  "/workflow-automation-services/data-entry-automation": { to: "/automation/data-entry-automation", note: "Moved under /automation" },
  "/workflow-automation-services/api-automation": { to: "/automation/api-integration", note: "Mapped to api-integration" },
  "/workflow-automation-services/no-code-automation": { to: "/automation/no-code-automation", note: "Moved under /automation" },

  // AI Content Services & Sub-services
  "/ai-content-writing": { to: "/ai-content/writing", note: "Moved under /ai-content" },
  "/ai-content-writing/ai-blog-writing": { to: "/ai-content/writing/blog-writing", note: "Moved under /ai-content" },
  "/ai-content-writing/ai-copywriting": { to: "/ai-content/writing/copywriting", note: "Moved under /ai-content" },
  "/ai-content-writing/ai-website-content": { to: "/content-marketing/website-copywriting", note: "Remapped to /content-marketing/website-copywriting" },
  "/ai-content-writing/ai-product-descriptions": { to: "/ai-content/writing/product-descriptions", note: "Moved under /ai-content" },

  "/ai-video-generation": { to: "/ai-content/video", note: "Moved under /ai-content" },
  "/ai-video-generation/ai-avatar-videos": { to: "/ai-content/video/avatar-videos", note: "Moved under /ai-content" },
  "/ai-video-generation/ai-faceless-videos": { to: "/ai-content/video/faceless-videos", note: "Moved under /ai-content" },
  "/ai-video-generation/ai-video-ads": { to: "/ai-content/video/video-ads", note: "Moved under /ai-content" },
  "/ai-video-generation/ai-product-videos": { to: "/ai-content/video/product-videos", note: "Moved under /ai-content" },

  "/ai-image-generation": { to: "/ai-content/images", note: "Moved under /ai-content" },
  "/ai-image-generation/ai-product-photography": { to: "/ai-content/images/product-photography", note: "Moved under /ai-content" },
  "/ai-image-generation/ai-ad-creatives": { to: "/ai-content/images/ad-creatives", note: "Moved under /ai-content" },
  "/ai-image-generation/ai-lifestyle-images": { to: "/ai-content/images/lifestyle-images", note: "Moved under /ai-content" },

  "/ai-social-media-content": { to: "/ai-content/social-media", note: "Moved under /ai-content" },
  "/ai-social-media-content/ai-social-posts": { to: "/ai-content/social-media", note: "Mapped to /ai-content/social-media hub (retired sub)" },
  "/ai-social-media-content/ai-reels": { to: "/ai-content/social-media/reels-shorts", note: "Moved under /ai-content/social-media" },

  "/ai-ugc-ads": { to: "/ai-content/ugc-ads", note: "Moved under /ai-content" },
  "/ai-ugc-ads/ai-ugc-video-ads": { to: "/ai-content/ugc-ads", note: "Mapped to /ai-content/ugc-ads hub (retired sub)" },
  "/ai-ugc-ads/ai-ugc-avatars": { to: "/ai-content/ugc-ads/ugc-avatars", note: "Moved under /ai-content/ugc-ads" },
  "/ai-ugc-ads/ai-tiktok-ugc": { to: "/ai-content/ugc-ads/tiktok-ugc-ads", note: "Moved under /ai-content/ugc-ads" },

  "/ai-seo-content": { to: "/ai-content/writing", note: "Remapped to AI writing hub (retired service)" },
  "/ai-seo-content/ai-content-optimization": { to: "/seo/on-page-seo", note: "Merged into On-Page SEO (per seed note on /seo/on-page-seo)" },
  "/ai-seo-content/programmatic-seo": { to: "/seo/programmatic-seo", note: "Remapped to /seo/programmatic-seo" },
  "/ai-seo-content/generative-engine-optimization": { to: "/seo/generative-engine-optimization", note: "Remapped to /seo/generative-engine-optimization" },
};

function generateStableId(p: string): string {
  if (p === "/") return "page_home";
  return `page_${p.replace(/^\//, "").replace(/[^a-zA-Z0-9]/g, "_")}`;
}

async function runMigration() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isApply = args.includes("--apply");

  if (!isDryRun && !isApply) {
    console.log("Usage: node scripts/run-migrate.js [--dry-run | --apply]");
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`  BEETRIX360 IA v2 MIGRATION SCRIPT (${isDryRun ? "DRY RUN" : "APPLY MODE"})`);
  console.log(`======================================================\n`);

  // Step 1: Universal Backup through db.ts (Only on --apply)
  if (isApply) {
    const backupDir = path.join(process.cwd(), ".data", "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    console.log(`[Backup] Exporting all database records through db.ts...`);
    const allRecords = await exportAllDbRecords();
    fs.writeFileSync(backupFile, JSON.stringify(allRecords, null, 2), "utf8");
    console.log(`[Backup] Full snapshot created successfully at: ${backupFile} (${Object.keys(allRecords).length} items)`);
  }

  // Step 2: Dynamic Hand-Edited Page Carry-Over Check & Abort Protection
  console.log(`[Carry-Over Audit] Scanning existing page records for manual/custom content...`);
  const existingPages = await queryDbByPk<any>("PAGE");
  const handEditedPages: any[] = [];
  
  for (const p of existingPages) {
    // Condition:
    // 1. Legacy record (slug-based) whose timestamp != 2026-10-19T13:05 batch or has updatedBy
    // 2. Already migrated page explicitly modified by editor (updatedBy set or custom ready status)
    const isLegacy = !p.path || !p.path.startsWith("/");
    if (isLegacy) {
      const isModified = Boolean(p.updatedBy) || (p.updatedAt && !p.updatedAt.startsWith("2026-10-19T13:05"));
      if (isModified) {
        handEditedPages.push(p);
      }
    } else {
      if (p.updatedBy) {
        handEditedPages.push(p);
      }
    }
  }

  // Abort safety check: Ensure all detected hand-edited pages map cleanly to new target pages
  const seedPaths = new Set(seedData.pages.map((p) => normalizePath(p.path)));
  const unmappedHandEdited: string[] = [];

  for (const hep of handEditedPages) {
    const sourcePath = hep.path ? normalizePath(hep.path) : "/" + hep.slug;
    const targetPath = seedPaths.has(sourcePath)
      ? sourcePath
      : RAW_REDIRECT_MAP[sourcePath]?.to;

    if (!targetPath || !seedPaths.has(normalizePath(targetPath))) {
      unmappedHandEdited.push(`${sourcePath} (title: "${hep.title || hep.h1}")`);
    }
  }

  if (unmappedHandEdited.length > 0) {
    console.error(`\n[FATAL ABORT] Found hand-edited page(s) that cannot be mapped to the new IA tree:`);
    unmappedHandEdited.forEach((u) => console.error(`  - ${u}`));
    console.error(`Migration safely aborted before writing anything to protect data.`);
    process.exit(1);
  }

  if (handEditedPages.length > 0) {
    console.log(`[Carry-Over Audit] Detected ${handEditedPages.length} hand-edited pages in target store (all mapped):`);
    for (const hep of handEditedPages) {
      console.log(`   - ${hep.slug || hep.path} (updatedBy: ${hep.updatedBy || "none"}, updatedAt: ${hep.updatedAt})`);
    }
  } else {
    console.log(`[Carry-Over Audit] 0 hand-edited pages detected. All records match standard seed timestamps.`);
  }

  // Step 3: Index Seed Pages & Resolve Stable IDs
  const seedPages = seedData.pages;
  console.log(`\n[Pages] Seeding ${seedPages.length} pages from src/content/ia-v2.seed.json...`);

  // Build ID and Path lookup maps
  const pageIdByPath = new Map<string, string>();
  for (const sp of seedPages) {
    const normalized = normalizePath(sp.path);
    pageIdByPath.set(normalized, generateStableId(normalized));
  }

  const pagesToSave: PageRecordV2[] = [];
  let pagesCreated = 0;
  let pagesUpdated = 0;
  let pagesUnchanged = 0;

  for (const sp of seedPages) {
    const normPath = normalizePath(sp.path);
    const id = pageIdByPath.get(normPath)!;
    const parentId = sp.parentPath ? (pageIdByPath.get(normalizePath(sp.parentPath)) || null) : null;

    // Check if this page has old paths redirecting to it
    const redirectFrom = Object.entries(RAW_REDIRECT_MAP)
      .filter(([_, mapping]) => normalizePath(mapping.to) === normPath)
      .map(([from]) => from);

    // Check homepage override constraint:
    // User Requirement: "/" seo.robots must stay index:true, follow:true, and existing homepage content preserved.
    const isHome = normPath === "/";
    const initialRobots = isHome ? { index: true, follow: true } : (sp.seo?.robots || { index: false, follow: true });

    // Check if hand-edited page maps here
    const handEditedMatch = handEditedPages.find((hep) => {
      const src = hep.path ? normalizePath(hep.path) : "/" + hep.slug;
      return src === normPath || RAW_REDIRECT_MAP[src]?.to === normPath;
    });

    const existing = await getDbItem<PageRecordV2>("PAGE", normPath);

    // Bug 1 fix: A page is "ready" only if it is a carried-over hand-edited page, or an editor set it (updatedBy present).
    // Never inherit "ready" from a previous migration run.
    const isHandEdited = Boolean(handEditedMatch) || Boolean(existing?.updatedBy);
    const contentStatus = isHandEdited ? "ready" : (isHome ? "ready" : "placeholder");
    const finalRobots = isHome
      ? { index: true, follow: true }
      : (isHandEdited
          ? (sp.seo?.robotsAfterContentReady || { index: true, follow: true })
          : (sp.seo?.robots || { index: false, follow: true }));

    const finalTitle = handEditedMatch?.seo?.title || handEditedMatch?.title || sp.seo?.titleTag || `${sp.h1} | Beetrix360`;
    const finalMetaDesc = handEditedMatch?.seo?.description || sp.seo?.metaDescription || null;
    const finalOgImage = handEditedMatch?.seo?.ogImage || sp.seo?.openGraph?.imagePath || null;
    const finalSections = existing?.sections?.length && isHandEdited
      ? existing.sections
      : (handEditedMatch?.sections?.length ? handEditedMatch.sections : []);

    const nowTimestamp = new Date().toISOString();

    const pageRecord: PageRecordV2 = {
      id,
      path: normPath,
      parentId,
      slug: sp.slug,
      h1: sp.h1,
      menuLabel: sp.menuLabel || sp.h1,
      targetKeyword: sp.targetKeyword,
      seo: {
        titleTag: finalTitle,
        metaDescription: finalMetaDesc,
        canonicalPath: normPath,
        robots: finalRobots,
        robotsAfterContentReady: sp.seo?.robotsAfterContentReady || { index: true, follow: true },
        breadcrumbLabel: sp.seo?.breadcrumbLabel || sp.menuLabel || sp.h1,
        schemaTypes: sp.seo?.schemaTypes || ["WebPage"],
        faqSchemaOnlyWhenReady: sp.seo?.faqSchemaOnlyWhenReady ?? true,
        openGraph: {
          type: sp.seo?.openGraph?.type || "website",
          imagePath: finalOgImage,
        },
      },
      pageType: sp.pageType as any,
      origin: sp.origin as any,
      division: sp.division,
      sections: finalSections,
      contentStatus,
      published: true,
      redirectFrom,
      note: sp.note,
      updatedAt: existing?.updatedAt || handEditedMatch?.updatedAt || nowTimestamp,
      updatedBy: existing?.updatedBy || handEditedMatch?.updatedBy || undefined,
    };

    pagesToSave.push(pageRecord);

    // Comprehensive Idempotency Check comparing every seeded field
    if (!existing) {
      pagesCreated++;
      if (isApply) {
        await putDbItem("PAGE", normPath, pageRecord);
      }
    } else {
      const isDiff =
        existing.id !== pageRecord.id ||
        existing.path !== pageRecord.path ||
        existing.parentId !== pageRecord.parentId ||
        existing.slug !== pageRecord.slug ||
        existing.h1 !== pageRecord.h1 ||
        existing.menuLabel !== pageRecord.menuLabel ||
        existing.targetKeyword !== pageRecord.targetKeyword ||
        existing.pageType !== pageRecord.pageType ||
        existing.origin !== pageRecord.origin ||
        existing.division !== pageRecord.division ||
        existing.contentStatus !== pageRecord.contentStatus ||
        existing.seo?.titleTag !== pageRecord.seo.titleTag ||
        existing.seo?.metaDescription !== pageRecord.seo.metaDescription ||
        existing.seo?.canonicalPath !== pageRecord.seo.canonicalPath ||
        existing.seo?.robots?.index !== pageRecord.seo.robots.index ||
        existing.seo?.robots?.follow !== pageRecord.seo.robots.follow ||
        existing.seo?.robotsAfterContentReady?.index !== pageRecord.seo.robotsAfterContentReady.index ||
        existing.seo?.robotsAfterContentReady?.follow !== pageRecord.seo.robotsAfterContentReady.follow ||
        existing.seo?.breadcrumbLabel !== pageRecord.seo.breadcrumbLabel ||
        existing.seo?.faqSchemaOnlyWhenReady !== pageRecord.seo.faqSchemaOnlyWhenReady ||
        existing.seo?.openGraph?.type !== pageRecord.seo.openGraph.type ||
        existing.seo?.openGraph?.imagePath !== pageRecord.seo.openGraph.imagePath ||
        JSON.stringify(existing.seo?.schemaTypes || []) !== JSON.stringify(pageRecord.seo.schemaTypes || []) ||
        JSON.stringify(existing.redirectFrom || []) !== JSON.stringify(pageRecord.redirectFrom || []);

      if (isDiff) {
        pagesUpdated++;
        if (isApply) {
          pageRecord.updatedAt = nowTimestamp;
          await putDbItem("PAGE", normPath, pageRecord);
        }
      } else {
        pagesUnchanged++;
      }
    }
  }

  console.log(`[Pages Summary] Created: ${pagesCreated}, Updated: ${pagesUpdated}, Unchanged: ${pagesUnchanged}`);

  // Step 4: Navigation Migration
  console.log(`\n[Navigation] Resolving navigation structure to stable page IDs...`);
  const seedNav = seedData.navigation;
  const navMenus: any[] = [];

  for (const m of seedNav.menus) {
    const groups: any[] = [];
    for (const g of m.groups) {
      const items: any[] = [];
      for (const it of g.items as any[]) {
        if (it.dynamic) {
          items.push(it);
        } else if (it.path) {
          const normPath = normalizePath(it.path);
          const pageId = pageIdByPath.get(normPath);
          if (!pageId) {
            throw new Error(`[Migration Abort] Seed navigation path missing in page tree: "${it.path}"`);
          }
          const targetPage = seedPages.find((p) => normalizePath(p.path) === normPath);
          items.push({
            pageId,
            path: normPath,
            label: targetPage?.menuLabel || targetPage?.h1 || it.path,
          });
        }
      }
      groups.push({
        heading: g.heading,
        headingPath: g.headingPath ? normalizePath(g.headingPath) : null,
        items,
      });
    }

    const bottomBarLinks = (m.bottomBarLinks || []).map((linkPath) => {
      const norm = normalizePath(linkPath);
      const targetPage = seedPages.find((p) => normalizePath(p.path) === norm);
      return {
        path: norm,
        label: targetPage?.menuLabel || targetPage?.h1 || norm,
      };
    });

    navMenus.push({
      label: m.label,
      viewAllPath: normalizePath(m.viewAllPath),
      bottomBarLinks,
      proofCard: m.proofCard
        ? {
            text: m.proofCard.text,
            cta: m.proofCard.cta,
            path: normalizePath(m.proofCard.path),
          }
        : null,
      groups,
    });
  }

  const navRecord: NavigationRecord = {
    logoPath: typeof seedNav.logo === "string" ? seedNav.logo : (seedNav.logo as any)?.path || "/logo.svg",
    cta: {
      label: seedNav.cta?.label || "Get a proposal",
      path: normalizePath(seedNav.cta?.path || "/get-a-proposal"),
    },
    footerLegal: (seedNav.footerLegal || []).map(normalizePath),
    menus: navMenus,
    updatedAt: new Date().toISOString(),
  };

  if (isApply) {
    await putDbItem("SITE#config", "NAVIGATION", navRecord);
    console.log(`[Navigation] Saved SITE#config:NAVIGATION with 7 menus and resolved page IDs.`);
  } else {
    console.log(`[Navigation] Dry run validated all 7 menus and all group paths successfully.`);
  }

  // Step 5: Redirect Ingestion (Exactly 90 Active 301 Redirects)
  console.log(`\n[Redirects] Ingesting 301 redirects with identity & single-hop validation...`);
  let redirectsCreated = 0;
  let redirectsRefused = 0;

  for (const [fromRaw, data] of Object.entries(RAW_REDIRECT_MAP)) {
    const from = normalizePath(fromRaw);
    const to = normalizePath(data.to);

    // Rule 1: Refuse identity redirect
    if (from === to) {
      console.warn(`[Redirect Refused] Identity redirect rejected: ${from} -> ${to}`);
      redirectsRefused++;
      continue;
    }

    // Rule 2: Single-hop collapse
    let collapsedTo = to;
    if (RAW_REDIRECT_MAP[to]) {
      console.log(`[Redirect Chain Collapsed] ${from} -> ${to} -> ${RAW_REDIRECT_MAP[to].to}`);
      collapsedTo = normalizePath(RAW_REDIRECT_MAP[to].to);
    }

    const redirectRecord: RedirectRecord = {
      from,
      to: collapsedTo,
      status: 301,
      createdAt: new Date().toISOString(),
    };

    if (isApply) {
      await putDbItem("REDIRECT", from, redirectRecord);
    }
    redirectsCreated++;
  }

  console.log(`[Redirects Summary] Created: ${redirectsCreated}, Refused/Skipped: ${redirectsRefused}`);

  // Step 6: Legacy Clean up (Only on --apply)
  if (isApply) {
    console.log(`\n[Cleanup] Cleaning up legacy slug-based PAGE records...`);
    let legacyDeleted = 0;
    for (const p of existingPages) {
      // If the record key does not start with "/" and is not a protected system record
      if (p.slug && (!p.path || !p.path.startsWith("/"))) {
        await deleteDbItem("PAGE", p.slug);
        legacyDeleted++;
      }
    }
    console.log(`[Cleanup] Safely removed ${legacyDeleted} legacy un-normalized PAGE records.`);
  }

  console.log(`\n======================================================`);
  console.log(`  MIGRATION COMPLETE! (${isDryRun ? "Dry run passed with 0 errors" : "All records successfully applied"})`);
  console.log(`======================================================\n`);
}

if (process.argv[1]?.includes("migrate")) {
  runMigration().catch((err) => {
    console.error("\n[FATAL ERROR IN MIGRATION]:", err);
    process.exit(1);
  });
}
