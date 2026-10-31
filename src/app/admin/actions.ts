"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticateUser,
  clearSessionCookie,
  createSessionToken,
  createUser,
  deleteUser,
  getSessionUser,
  setSessionCookie,
  updateUserRole,
  UserRole,
} from "@/lib/auth";
import { saveAnalyticsSettings, saveHomepageContent, saveSiteSettings } from "@/lib/content";
import { deletePageBySlug, getAllPages as getLegacyAllPages, getPageBySlug, PageRecord, savePage as saveLegacyPage } from "@/lib/page-manager";
import { NavigationConfig, saveSiteNavigation } from "@/lib/navigation";
import {
  deletePageByPath,
  deleteRedirect,
  getAllPages,
  getAllRedirects,
  getPageByPath,
  savePage,
  saveRedirect,
} from "@/lib/db";
import type { AnalyticsSettings, HomepageContent, PageRecordV2, PageTypeV2, SiteSettings } from "@/lib/types";

function safeRevalidate(path: string, type?: "layout" | "page") {
  try {
    revalidatePath(path, type);
  } catch {
    // Graceful fallback when called outside active request context (e.g. test scripts)
  }
}

/**
 * Authentication Actions
 */
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return { error: "Invalid email or password. Please verify your credentials." };
  }

  const token = await createSessionToken(user);
  await setSessionCookie(token);

  return { success: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

/**
 * Requirement 1: Homepage Component-by-Component Save Action
 */
export async function saveHomepageAction(content: HomepageContent) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (!["admin", "editor", "moderator"].includes(user.role)) {
    throw new Error("Forbidden: You do not have permission to update content.");
  }

  await saveHomepageContent(content);
  safeRevalidate("/");
  return { success: true, timestamp: new Date().toISOString() };
}

/**
 * Requirement 2: Pages & Parents CRUD Actions (Read-Only Guarded)
 */
export async function savePageAction(page: PageRecord) {
  throw new Error("Disabled until the new editor (Phase 6) is ready");
}

export async function deletePageAction(slug: string) {
  throw new Error("Disabled until the new editor (Phase 6) is ready");
}

/**
 * Requirement 3: Menu Arrangement Save Action (Read-Only Guarded)
 */
export async function saveNavigationAction(nav: NavigationConfig) {
  throw new Error("Disabled until the new editor (Phase 6) is ready");
}

/**
 * ============================================================================
 * Phase 6A: IA v2 Page Editor Studio Server Actions
 * ============================================================================
 */

/**
 * Save or update a PageRecordV2.
 * RBAC: admin, moderator, editor. (Editor cannot rename slug or change parentId).
 * Enforces slug uniqueness among siblings, max depth <= 3, and seo.indexLock.
 */
export async function savePageV2Action(page: PageRecordV2) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (!["admin", "editor", "moderator"].includes(user.role)) {
    throw new Error("Forbidden: You do not have permission to edit pages.");
  }

  // 1. Validate slug
  const cleanSlug = (page.slug || "").trim().toLowerCase();
  if (!cleanSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
    throw new Error("Invalid slug format. Must be lowercase alphanumeric characters and hyphens.");
  }
  page.slug = cleanSlug;

  // 2. Fetch all pages for validation
  const allPages = await getAllPages();
  const existing = allPages.find((p) => p.id === page.id);

  // 3. Editors cannot move or rename pages
  if (user.role === "editor" && existing) {
    if (existing.slug !== page.slug || existing.parentId !== page.parentId) {
      throw new Error("Forbidden: Editors cannot move or rename pages. Contact an Administrator.");
    }
  }

  // 4. Slug uniqueness among siblings
  const sibling = allPages.find(
    (p) => p.parentId === page.parentId && p.id !== page.id && p.slug.toLowerCase() === cleanSlug
  );
  if (sibling) {
    throw new Error(`Slug '${cleanSlug}' is already used by a sibling page under the same parent.`);
  }

  // 5. Max depth <= 3
  const segments = page.path.split("/").filter(Boolean);
  if (segments.length > 3) {
    throw new Error("Path depth exceeds maximum limit of 3 segments.");
  }

  // 6. seo.indexLock enforcement
  if (page.seo?.indexLock && page.seo.robots.index === true) {
    throw new Error("Cannot set robots index to true: Indexing is locked for this page.");
  }

  // 7. Record audit trail
  page.updatedBy = user.name || user.email;
  page.updatedAt = new Date().toISOString();

  // 8. Save via path-based DB store
  await savePage(page);

  safeRevalidate(page.path);
  safeRevalidate("/");

  return { success: true, page };
}

/**
 * One-click "Mark ready" action.
 * Sets contentStatus: "ready" and seo.robots to seo.robotsAfterContentReady.
 */
export async function markPageReadyV2Action(pageId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (!["admin", "editor", "moderator"].includes(user.role)) {
    throw new Error("Forbidden: You do not have permission to mark pages ready.");
  }

  const allPages = await getAllPages();
  const page = allPages.find((p) => p.id === pageId);
  if (!page) throw new Error(`Page '${pageId}' not found.`);

  page.contentStatus = "ready";
  if (!page.seo?.indexLock) {
    page.seo.robots = { ...(page.seo.robotsAfterContentReady || { index: true, follow: true }) };
  }
  page.updatedBy = user.name || user.email;
  page.updatedAt = new Date().toISOString();

  await savePage(page);

  safeRevalidate(page.path);
  safeRevalidate("/");

  return { success: true, page };
}

/**
 * Bulk "Mark ready" for selected page IDs.
 */
export async function bulkMarkPagesReadyAction(pageIds: string[]) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (!["admin", "editor", "moderator"].includes(user.role)) {
    throw new Error("Forbidden: You do not have permission to mark pages ready.");
  }

  const allPages = await getAllPages();
  const pageMap = new Map(allPages.map((p) => [p.id, p]));
  const updatedPages: PageRecordV2[] = [];

  for (const id of pageIds) {
    const page = pageMap.get(id);
    if (!page) continue;
    page.contentStatus = "ready";
    if (!page.seo?.indexLock) {
      page.seo.robots = { ...(page.seo.robotsAfterContentReady || { index: true, follow: true }) };
    }
    page.updatedBy = user.name || user.email;
    page.updatedAt = new Date().toISOString();
    await savePage(page);
    safeRevalidate(page.path);
    updatedPages.push(page);
  }

  safeRevalidate("/");
  return { success: true, count: updatedPages.length };
}

/**
 * Move or rename a page.
 * Recomputes paths for the page and all descendants, creates single-hop 301 redirects,
 * collapses redirect chains, and prevents loops.
 * RBAC: Strictly restricted to 'admin'.
 */
export async function movePageV2Action(pageId: string, newParentId: string | null, newSlug: string) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: Only Full Administrators can move or rename pages.");
  }

  const cleanSlug = newSlug.trim().toLowerCase();
  if (!cleanSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
    throw new Error("Invalid slug format. Must be lowercase alphanumeric and hyphens.");
  }

  const allPages = await getAllPages();
  const pageById = new Map(allPages.map((p) => [p.id, p]));
  const targetPage = pageById.get(pageId);
  if (!targetPage) throw new Error("Target page not found.");

  // Check sibling uniqueness
  const sibling = allPages.find(
    (p) => p.parentId === newParentId && p.id !== pageId && p.slug === cleanSlug
  );
  if (sibling) {
    throw new Error(`Slug '${cleanSlug}' is already used by a sibling page under the target parent.`);
  }

  // Prevent moving under self or descendants
  if (newParentId) {
    if (newParentId === pageId) {
      throw new Error("Cannot move a page under itself.");
    }
    let curParentId: string | null = newParentId;
    while (curParentId) {
      if (curParentId === pageId) {
        throw new Error("Cannot move a page under one of its descendants.");
      }
      const parent = pageById.get(curParentId);
      curParentId = parent ? parent.parentId : null;
    }
  }

  // Compute new path
  let newPath = "";
  if (!newParentId) {
    newPath = "/" + cleanSlug;
  } else {
    const parent = pageById.get(newParentId);
    if (!parent) throw new Error("Selected parent page does not exist.");
    newPath = parent.path === "/" ? "/" + cleanSlug : `${parent.path}/${cleanSlug}`;
  }

  // Max depth check
  if (newPath.split("/").filter(Boolean).length > 3) {
    throw new Error("Moving this page exceeds maximum depth of 3 segments.");
  }

  // Find all descendants
  const oldPathPrefix = targetPage.path;
  const descendants = allPages.filter((p) => p.path.startsWith(oldPathPrefix + "/"));

  // Check descendant depths
  for (const desc of descendants) {
    const rel = desc.path.slice(oldPathPrefix.length);
    const descNewPath = newPath + rel;
    if (descNewPath.split("/").filter(Boolean).length > 3) {
      throw new Error(`Moving would cause descendant '${desc.path}' to exceed max path depth of 3 segments.`);
    }
  }

  // Collect all moves
  const moves: { oldPath: string; newPath: string; page: PageRecordV2 }[] = [
    { oldPath: targetPage.path, newPath, page: targetPage },
  ];
  for (const desc of descendants) {
    moves.push({
      oldPath: desc.path,
      newPath: newPath + desc.path.slice(oldPathPrefix.length),
      page: desc,
    });
  }

  const allRedirects = await getAllRedirects();

  // Execute atomic moves
  for (const m of moves) {
    if (m.oldPath === m.newPath) continue;

    // 1. Delete old path key
    await deletePageByPath(m.oldPath);

    // 2. Update page fields
    m.page.path = m.newPath;
    if (m.page.id === pageId) {
      m.page.slug = cleanSlug;
      m.page.parentId = newParentId;
    }
    m.page.updatedBy = user.name || user.email;
    m.page.updatedAt = new Date().toISOString();
    await savePage(m.page);

    // 3. Clean up reverse redirects if moving back (prevents cycles like A -> B -> A)
    await deleteRedirect(m.newPath);

    // 4. Save new 301 redirect
    await saveRedirect({
      from: m.oldPath,
      to: m.newPath,
      status: 301,
      createdAt: new Date().toISOString(),
    });

    // 5. Collapse existing redirect chains pointing to m.oldPath
    for (const r of allRedirects) {
      if (r.to === m.oldPath && r.from !== m.newPath) {
        await saveRedirect({
          from: r.from,
          to: m.newPath,
          status: 301,
          createdAt: new Date().toISOString(),
        });
      }
    }

    safeRevalidate(m.oldPath);
    safeRevalidate(m.newPath);
  }

  safeRevalidate("/");
  return { success: true, newPath };
}

/**
 * Create a new PageRecordV2.
 * RBAC: Strictly restricted to 'admin'.
 */
export async function createPageV2Action(data: {
  h1: string;
  slug: string;
  parentId: string | null;
  pageType: PageTypeV2;
  division: string;
  targetKeyword: string;
  menuLabel?: string;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: Only Full Administrators can create pages.");
  }

  const cleanSlug = (data.slug || "").trim().toLowerCase();
  if (!cleanSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
    throw new Error("Invalid slug format. Must be lowercase alphanumeric and hyphens.");
  }

  const allPages = await getAllPages();
  const pageById = new Map(allPages.map((p) => [p.id, p]));

  // Check sibling uniqueness
  const sibling = allPages.find(
    (p) => p.parentId === data.parentId && p.slug === cleanSlug
  );
  if (sibling) {
    throw new Error(`Slug '${cleanSlug}' is already used by a sibling page under the target parent.`);
  }

  // Compute new path
  let newPath = "";
  if (!data.parentId) {
    newPath = "/" + cleanSlug;
  } else {
    const parent = pageById.get(data.parentId);
    if (!parent) throw new Error("Selected parent page does not exist.");
    newPath = parent.path === "/" ? "/" + cleanSlug : `${parent.path}/${cleanSlug}`;
  }

  if (newPath.split("/").filter(Boolean).length > 3) {
    throw new Error("Path depth exceeds maximum limit of 3 segments.");
  }

  const id = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newPage: PageRecordV2 = {
    id,
    path: newPath,
    parentId: data.parentId || null,
    slug: cleanSlug,
    h1: data.h1,
    menuLabel: data.menuLabel || data.h1,
    targetKeyword: data.targetKeyword,
    pageType: data.pageType,
    division: data.division,
    origin: "new",
    contentStatus: "placeholder",
    published: true,
    redirectFrom: [],
    seo: {
      titleTag: `${data.h1} | Beetrix360`,
      metaDescription: `Discover professional ${data.h1.toLowerCase()} capabilities designed to accelerate organizational performance and measurable growth.`,
      canonicalPath: newPath,
      breadcrumbLabel: data.menuLabel || data.h1,
      robots: { index: false, follow: true },
      robotsAfterContentReady: { index: true, follow: true },
      faqSchemaOnlyWhenReady: true,
      schemaTypes: ["WebPage"],
      openGraph: {
        type: "website",
        imagePath: null,
        title: `${data.h1} | Beetrix360`,
        description: `Discover professional ${data.h1.toLowerCase()} capabilities designed to accelerate organizational performance and measurable growth.`,
      },
      twitter: {
        card: "summary_large_image",
        title: `${data.h1} | Beetrix360`,
        description: `Discover professional ${data.h1.toLowerCase()} capabilities designed to accelerate organizational performance and measurable growth.`,
      },
    },
    sections: [],
    updatedBy: user.name || user.email,
    updatedAt: new Date().toISOString(),
  };

  await savePage(newPage);
  safeRevalidate(newPage.path);
  safeRevalidate("/");

  return { success: true, page: newPage };
}

/**
 * Delete a PageRecordV2 by its path.
 * RBAC: 'admin' and 'moderator'. Fails for 'editor'.
 */
export async function deletePageV2Action(path: string) {
  const user = await getSessionUser();
  if (!user || !["admin", "moderator"].includes(user.role)) {
    throw new Error("Forbidden: You do not have permission to delete pages.");
  }

  const page = await getPageByPath(path);
  if (!page) throw new Error(`Page '${path}' not found.`);

  const allPages = await getAllPages();
  const hasChildren = allPages.some((p) => p.parentId === page.id);
  if (hasChildren) {
    throw new Error("Cannot delete page with sub-pages. Please re-parent or delete child pages first.");
  }

  await deletePageByPath(path);
  safeRevalidate(path);
  safeRevalidate("/");

  return { success: true };
}

/**
 * Requirement 4: User & Role Management Actions
 */
export async function createUserAction(data: {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: Only Full Administrators can manage users.");
  }

  const created = await createUser(data);
  return { success: true, user: created };
}

export async function updateUserRoleAction(id: string, role: UserRole) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: Only Full Administrators can change roles.");
  }

  await updateUserRole(id, role);
  return { success: true };
}

export async function deleteUserAction(id: string) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: Only Full Administrators can delete users.");
  }

  if (user.id === id) {
    throw new Error("You cannot delete your own active administrator account.");
  }

  await deleteUser(id);
  return { success: true };
}

/**
 * Requirement 5: Global Site Identity & SEO Save Action
 */
export async function saveSiteSettingsAction(settings: SiteSettings) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (!["admin", "editor", "moderator"].includes(user.role)) {
    throw new Error("Forbidden: You do not have permission to update global site settings.");
  }

  await saveSiteSettings(settings);
  safeRevalidate("/", "layout");
  return { success: true, timestamp: new Date().toISOString() };
}

/**
 * Requirement 6: Google Analytics (GA4) & Google Tag Manager (GTM) Save Action
 */
export async function saveAnalyticsSettingsAction(settings: AnalyticsSettings) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (!["admin", "editor", "moderator"].includes(user.role)) {
    throw new Error("Forbidden: You do not have permission to update analytics settings.");
  }

  await saveAnalyticsSettings(settings);
  safeRevalidate("/", "layout");
  return { success: true, timestamp: new Date().toISOString() };
}
