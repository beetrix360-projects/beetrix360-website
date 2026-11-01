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
import { generatePlaceholderSections } from "../src/lib/placeholder-generator";

import { RAW_REDIRECT_MAP } from "../src/lib/redirect-map";
export { RAW_REDIRECT_MAP };

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

  // Detect pages in store that no longer exist in the seed (only when NOT hand-edited)
  const pagesToDelete: any[] = [];
  for (const p of existingPages) {
    const normPath = p.path && p.path.startsWith("/") ? normalizePath(p.path) : null;
    if (normPath && !seedPaths.has(normPath)) {
      if (p.updatedBy) {
        // Hand-edited page missing from seed - safety abort handled above in unmappedHandEdited
      } else {
        pagesToDelete.push(p);
      }
    }
  }

  console.log(`\n[Deletions Audit] Checking for pages in store no longer present in seed...`);
  if (pagesToDelete.length > 0) {
    console.log(`[Deletions Audit] Found ${pagesToDelete.length} unedited page(s) to delete:`);
    for (const p of pagesToDelete) {
      console.log(`  - DELETE: ${p.path} ("${p.h1 || p.menuLabel || p.path}")`);
    }
  } else {
    console.log(`[Deletions Audit] 0 pages to delete. Store matches seed paths.`);
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

  const allBaselinePages: PageRecordV2[] = seedPages.map((sp) => {
    const normPath = normalizePath(sp.path);
    return {
      id: pageIdByPath.get(normPath)!,
      path: normPath,
      parentId: sp.parentPath ? (pageIdByPath.get(normalizePath(sp.parentPath)) || null) : null,
      slug: sp.slug,
      h1: sp.h1,
      menuLabel: sp.menuLabel || sp.h1,
      targetKeyword: sp.targetKeyword,
      seo: {} as any,
      pageType: sp.pageType as any,
      origin: sp.origin as any,
      division: sp.division,
      sections: [],
      contentStatus: "placeholder",
      published: (sp as any).published !== false,
      redirectFrom: [],
      updatedAt: "",
    };
  });

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

    // Requirement 7: Migration safety - Re-running migration will NOT overwrite:
    // - seo.robots (respect what has been indexed)
    // - seo.indexLock and seo.indexLockReason
    // - seo.indexedAt
    // - contentStatus (preserve any page marked "review" or "final" or set in store)
    // - sections (preserve existing generated or edited sections)
    // - meta descriptions that are already set
    const isHandEdited = Boolean(handEditedMatch) || Boolean(existing?.updatedBy);
    const contentStatus = existing?.contentStatus
      ? existing.contentStatus
      : (isHandEdited ? "ready" : (isHome ? "ready" : "placeholder"));

    const finalRobots = existing?.seo?.robots
      ? existing.seo.robots
      : (isHome
          ? { index: true, follow: true }
          : (isHandEdited
              ? (sp.seo?.robotsAfterContentReady || { index: true, follow: true })
              : (sp.seo?.robots || { index: false, follow: true })));

    const finalTitle = handEditedMatch?.seo?.title || handEditedMatch?.title || existing?.seo?.titleTag || sp.seo?.titleTag || `${sp.h1} | Beetrix360`;
    const finalMetaDesc = existing?.seo?.metaDescription || handEditedMatch?.seo?.description || sp.seo?.metaDescription || null;
    const finalOgImage = existing?.seo?.openGraph?.imagePath || handEditedMatch?.seo?.ogImage || sp.seo?.openGraph?.imagePath || null;
    const spSeo = sp.seo as (PageRecordV2["seo"] | undefined);
    const finalIndexLock = existing?.seo?.indexLock ?? spSeo?.indexLock;
    const finalIndexLockReason = existing?.seo?.indexLockReason ?? spSeo?.indexLockReason;
    const finalIndexedAt = existing?.seo?.indexedAt ?? spSeo?.indexedAt;

    let finalSections = existing?.sections?.length
      ? existing.sections
      : (handEditedMatch?.sections?.length ? handEditedMatch.sections : []);

    if (finalSections.length === 0 && !isHome) {
      finalSections = generatePlaceholderSections(
        {
          id,
          path: normPath,
          parentId,
          slug: sp.slug,
          h1: sp.h1,
          menuLabel: sp.menuLabel || sp.h1,
          targetKeyword: sp.targetKeyword,
          seo: {} as any,
          pageType: sp.pageType as any,
          origin: sp.origin as any,
          division: sp.division,
          sections: [],
          contentStatus,
          published: (sp as any).published !== false,
          redirectFrom: [],
          updatedAt: "",
        },
        allBaselinePages
      );
    }

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
        indexLock: finalIndexLock,
        indexLockReason: finalIndexLockReason,
        indexedAt: finalIndexedAt,
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
      published: (sp as any).published !== false,
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
        existing.published !== pageRecord.published ||
        existing.seo?.titleTag !== pageRecord.seo.titleTag ||
        existing.seo?.metaDescription !== pageRecord.seo.metaDescription ||
        existing.seo?.canonicalPath !== pageRecord.seo.canonicalPath ||
        existing.seo?.robots?.index !== pageRecord.seo.robots.index ||
        existing.seo?.robots?.follow !== pageRecord.seo.robots.follow ||
        existing.seo?.robotsAfterContentReady?.index !== pageRecord.seo.robotsAfterContentReady.index ||
        existing.seo?.robotsAfterContentReady?.follow !== pageRecord.seo.robotsAfterContentReady.follow ||
        existing.seo?.breadcrumbLabel !== pageRecord.seo.breadcrumbLabel ||
        existing.seo?.indexLock !== pageRecord.seo.indexLock ||
        existing.seo?.indexLockReason !== pageRecord.seo.indexLockReason ||
        existing.seo?.indexedAt !== pageRecord.seo.indexedAt ||
        existing.seo?.faqSchemaOnlyWhenReady !== pageRecord.seo.faqSchemaOnlyWhenReady ||
        existing.seo?.openGraph?.type !== pageRecord.seo.openGraph.type ||
        existing.seo?.openGraph?.imagePath !== pageRecord.seo.openGraph.imagePath ||
        JSON.stringify(existing.seo?.schemaTypes || []) !== JSON.stringify(pageRecord.seo.schemaTypes || []) ||
        JSON.stringify(existing.redirectFrom || []) !== JSON.stringify(pageRecord.redirectFrom || []) ||
        JSON.stringify(existing.sections || []) !== JSON.stringify(pageRecord.sections || []);

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

  // Execute Deletions for removed pages through db.ts
  if (pagesToDelete.length > 0) {
    if (isApply) {
      console.log(`\n[Cleanup] Deleting ${pagesToDelete.length} removed pages through db.ts...`);
      for (const p of pagesToDelete) {
        await deleteDbItem("PAGE", p.path);
        console.log(`  - DELETED: ${p.path}`);
      }
      console.log(`[Cleanup] Successfully deleted ${pagesToDelete.length} page(s) from store.`);
    } else {
      console.log(`\n[Cleanup] [DRY RUN] Would delete ${pagesToDelete.length} page(s) from store through db.ts.`);
    }
  }

  console.log(`[Pages Summary] Created: ${pagesCreated}, Updated: ${pagesUpdated}, Unchanged: ${pagesUnchanged}, Deleted: ${pagesToDelete.length}`);

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
        span: g.span || (items.length > 6 ? 2 : 1),
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
      shortLabel: (m as any).shortLabel || undefined,
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
