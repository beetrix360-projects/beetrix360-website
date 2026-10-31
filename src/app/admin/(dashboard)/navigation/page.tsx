import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  getNavigation,
  getPreviousNavigation,
  getAllPages,
  getSiteSettings,
} from "@/lib/content";
import { MenuStudioClient } from "./MenuStudioClient";

export const metadata = {
  title: "Navigation Menu Studio | Beetrix360 Admin",
};

export default async function AdminNavigationPage() {
  const [nav, previousNav, allPages, siteSettings, user] = await Promise.all([
    getNavigation(),
    getPreviousNavigation(),
    getAllPages(),
    getSiteSettings(),
    getSessionUser(),
  ]);

  if (!user) {
    redirect("/admin/login");
  }

  if (!nav) {
    return (
      <div className="p-8 text-center text-sm text-neutral-500">
        No active navigation configuration found in store. Please run the database migration.
      </div>
    );
  }

  return (
    <MenuStudioClient
      initialNav={nav}
      hasPreviousVersion={Boolean(previousNav)}
      allPages={allPages}
      siteSettings={siteSettings}
      userRole={user.role}
      currentUser={user.name || user.email}
    />
  );
}
