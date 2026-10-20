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
import { saveHomepageContent } from "@/lib/content";
import { deletePageBySlug, getAllPages, getPageBySlug, PageRecord, savePage } from "@/lib/page-manager";
import { NavigationConfig, saveSiteNavigation } from "@/lib/navigation";
import type { HomepageContent } from "@/lib/types";

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
 * Requirement 2: Pages & Parents CRUD Actions
 */
export async function savePageAction(page: PageRecord) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (!["admin", "editor", "moderator"].includes(user.role)) {
    throw new Error("Forbidden: Insufficient permissions to save pages.");
  }

  await savePage(page);
  revalidatePath("/");
  revalidatePath("/[slug]", "page");
  revalidatePath(`/${page.slug}`);
  return { success: true };
}

export async function deletePageAction(slug: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  // Only Admin and Moderator have Delete access
  if (!["admin", "moderator"].includes(user.role)) {
    throw new Error("Forbidden: Only Administrators and Moderators can delete pages.");
  }

  await deletePageBySlug(slug);
  revalidatePath("/");
  revalidatePath("/[slug]", "page");
  return { success: true };
}

/**
 * Requirement 3: Menu Arrangement Save Action
 */
export async function saveNavigationAction(nav: NavigationConfig) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  // Only Admin has Menu arrangement access
  if (user.role !== "admin") {
    throw new Error("Forbidden: Only Full Administrators can modify navigation arrangements.");
  }

  await saveSiteNavigation(nav);
  revalidatePath("/", "layout");
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
