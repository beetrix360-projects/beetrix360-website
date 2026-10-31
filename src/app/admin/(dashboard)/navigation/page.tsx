import { getSiteNavigation } from "@/lib/navigation";
import { getSessionUser } from "@/lib/auth";
import { MenuArrangementClient } from "./MenuArrangementClient";

export const metadata = {
  title: "Menu Arrangement Studio | Beetrix360 Admin",
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

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
        <div>
          <p className="font-semibold text-amber-950">Read-Only Notice (IA v2 Migration)</p>
          <p className="text-xs text-amber-800 mt-0.5">
            The legacy Menu Arrangement screen is temporarily disabled to prevent overwriting the new 7-menu IA v2 architecture. Full editing capabilities will be restored in Phase 6.
          </p>
        </div>
      </div>

      <MenuArrangementClient initialNav={nav} userRole="viewer" />
    </div>
  );
}
