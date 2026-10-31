import type { NavigationRecord, NavigationMenu, PageRecordV2 } from "./types";
import { computeGroupSpan, computeMenuTracks } from "./types";

export interface NavigationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  trackCounts: Record<string, number>;
  topBarMeasurement: {
    fits: boolean;
    estimatedMenuWidth: number;
    availableMiddle: number;
    room: number;
  };
}

/**
 * Calculates top-bar menu width and room at 1440px desktop viewport
 * following the exact layout model from src/components/site/Navbar.tsx.
 */
export function calculateTopBarFit(menus: NavigationMenu[]): {
  fits: boolean;
  estimatedMenuWidth: number;
  availableMiddle: number;
  room: number;
} {
  // At 1440px viewport width:
  // Container: max-w-[1760px] mx-auto px-6 sm:px-8 xl:px-10 => xl:px-10 is 40px left & right = 80px total padding.
  const containerWidth = 1440 - 80; // 1360px
  const logoWidth = 160;
  const ctaWidth = 160;
  const availableMiddle = containerWidth - logoWidth - ctaWidth; // 1040px

  // Estimate width for each menu trigger item
  // Markup: <div className="px-3 py-2 text-sm font-semibold tracking-tight flex items-center gap-1">
  // px-3 (12px * 2 = 24px) + chevron (14px) + gap-1 (4px) = 42px chrome per item.
  // 14px font-semibold character width averages ~7.5px in sans-serif / Inter.
  let itemsWidth = 0;
  for (const menu of menus) {
    const displayLabel = menu.shortLabel || menu.label;
    const textWidth = displayLabel.length * 7.5;
    const itemWidth = textWidth + 42;
    itemsWidth += itemWidth;
  }

  // <nav className="flex items-center gap-1.5 flex-nowrap shrink-0">
  // gap-1.5 is 6px between items
  const gapsWidth = menus.length > 1 ? (menus.length - 1) * 6 : 0;
  const estimatedMenuWidth = Math.round(itemsWidth + gapsWidth);

  // Navbar requires at least 32px between logo and first item, and between last item and button (plus 8px safety):
  // const fits = availableMiddle >= menuWidth + 72;
  const requiredMiddle = estimatedMenuWidth + 72;
  const room = availableMiddle - requiredMiddle;
  const fits = room >= 0;

  return {
    fits,
    estimatedMenuWidth,
    availableMiddle,
    room,
  };
}

/**
 * Validates a NavigationRecord against all Phase 6B structural & SEO rules.
 */
export function validateNavigationRecord(
  nav: NavigationRecord,
  allPages: PageRecordV2[]
): NavigationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const trackCounts: Record<string, number> = {};

  const pageById = new Map<string, PageRecordV2>();
  const pageByPath = new Map<string, PageRecordV2>();

  for (const p of allPages) {
    if (p.id) pageById.set(p.id, p);
    if (p.path) pageByPath.set(p.path, p);
  }

  // 1. Validate top-bar width fit at 1440px
  const topBarFit = calculateTopBarFit(nav.menus || []);
  if (!topBarFit.fits) {
    warnings.push(
      `Top-bar labels exceed available space at 1440px (needs ~${topBarFit.estimatedMenuWidth + 72}px, available ${topBarFit.availableMiddle}px). Desktop visitors at 1440px will see the mobile menu button instead.`
    );
  }

  // 2. Validate each menu dropdown
  for (const menu of nav.menus || []) {
    const menuName = menu.label || "Untitled Menu";
    const tracks = computeMenuTracks(menu);
    trackCounts[menuName] = tracks;

    // Rule: Dropdown must fill exactly 5 column tracks
    if (tracks !== 5) {
      errors.push(
        `Menu "${menuName}": currently spans ${tracks} tracks (must equal exactly 5 tracks).`
      );
    }

    // Rule: Duplicate pages in one dropdown
    const seenPageIds = new Set<string>();

    for (const group of menu.groups || []) {
      const heading = group.heading || "Untitled Group";

      // Rule: Group with > 12 items
      if (group.items && group.items.length > 12) {
        errors.push(
          `Menu "${menuName}", Group "${heading}": contains ${group.items.length} items (maximum allowed is 12).`
        );
      }

      // Check items for duplicates and unpublished/noindex status
      for (const item of group.items || []) {
        if ("dynamic" in item) continue;

        let page: PageRecordV2 | undefined;
        if (item.pageId) {
          page = pageById.get(item.pageId);
        } else if (item.path) {
          page = pageByPath.get(item.path);
        }

        if (item.pageId) {
          if (seenPageIds.has(item.pageId)) {
            const pageName = page?.menuLabel || page?.h1 || item.label || item.pageId;
            errors.push(
              `Menu "${menuName}": page "${pageName}" is included multiple times in this dropdown.`
            );
          } else {
            seenPageIds.add(item.pageId);
          }
        }

        // Check page status warnings
        if (page) {
          if (!page.published) {
            warnings.push(
              `Link to "${page.path}" (${page.menuLabel || page.h1}) in Menu "${menuName}" is unpublished.`
            );
          } else if (page.seo?.robots?.index === false) {
            warnings.push(
              `Link to "${page.path}" (${page.menuLabel || page.h1}) in Menu "${menuName}" has robots index set to false.`
            );
          }
        } else if (item.path && !item.path.startsWith("http") && item.path !== "/") {
          warnings.push(
            `Link to "${item.path}" in Menu "${menuName}" references an unknown page.`
          );
        }
      }
    }

    // Check bottomBarLinks for unpublished/noindex
    for (const link of menu.bottomBarLinks || []) {
      const page = pageByPath.get(link.path);
      if (page) {
        if (!page.published) {
          warnings.push(
            `Bottom bar link to "${page.path}" in Menu "${menuName}" is unpublished.`
          );
        } else if (page.seo?.robots?.index === false) {
          warnings.push(
            `Bottom bar link to "${page.path}" in Menu "${menuName}" has robots index set to false.`
          );
        }
      }
    }

    // Check proofCard path
    if (menu.proofCard?.path) {
      const page = pageByPath.get(menu.proofCard.path);
      if (page) {
        if (!page.published) {
          warnings.push(
            `Proof card link to "${page.path}" in Menu "${menuName}" is unpublished.`
          );
        } else if (page.seo?.robots?.index === false) {
          warnings.push(
            `Proof card link to "${page.path}" in Menu "${menuName}" has robots index set to false.`
          );
        }
      }
    }
  }

  // Check footer legal links
  for (const legalPath of nav.footerLegal || []) {
    const page = pageByPath.get(legalPath);
    if (page && !page.published) {
      warnings.push(`Footer legal link to "${legalPath}" is unpublished.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    trackCounts,
    topBarMeasurement: topBarFit,
  };
}

