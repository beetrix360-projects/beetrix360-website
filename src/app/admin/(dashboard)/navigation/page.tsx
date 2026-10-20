import { getSiteNavigation } from "@/lib/navigation";
import { getSessionUser } from "@/lib/auth";
import { MenuArrangementClient } from "./MenuArrangementClient";

export const metadata = {
  title: "Menu Arrangement Studio | BeeTrix360 Admin",
};

export default async function AdminNavigationPage() {
  const [nav, user] = await Promise.all([
    getSiteNavigation(),
    getSessionUser(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900">
            Navigation Menu Arrangement
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Reorder primary header tabs, organize mega menu columns, and manage child links dynamically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-medium">
            {nav.header.length} Navigation Items
          </span>
        </div>
      </div>

      <MenuArrangementClient initialNav={nav} userRole={user?.role || "editor"} />
    </div>
  );
}
