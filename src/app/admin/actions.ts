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
import { deletePageBySlug, getAllPages, getPageBySlug, PageRecord, savePage } from "@/lib/page-manager";
import { NavigationConfig, saveSiteNavigation } from "@/lib/navigation";
import type { AnalyticsSettings, HomepageContent, SiteSettings } from "@/lib/types";

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
  revalidatePath("/");
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
  revalidatePath("/", "layout");
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
  revalidatePath("/", "layout");
  return { success: true, timestamp: new Date().toISOString() };
}
