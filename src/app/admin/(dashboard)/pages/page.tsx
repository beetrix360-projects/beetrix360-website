import { getAllPages } from "@/lib/page-manager";
import { getSessionUser } from "@/lib/auth";
import { PageManagerClient } from "./PageManagerClient";

export const metadata = {
  title: "Pages & Parent Hierarchy | Beetrix360 Admin",
};

export default async function AdminPagesPage() {
  const [pages, user] = await Promise.all([
    getAllPages(),
    getSessionUser(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900">
            Page & Parent Hierarchy Studio
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage top-level parent pages, child service hubs, subservices, and section blocks. Assign or change parents seamlessly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-medium">
            Total Pages: {pages.length}
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
        <div>
          <p className="font-semibold text-amber-950">Read-Only Notice (IA v2 Migration)</p>
          <p className="text-xs text-amber-800 mt-0.5">
            The legacy Page Management screen is temporarily disabled to prevent creating legacy slug-based records or conflicting with the new normalized page store. Full editing will be restored in Phase 6.
          </p>
        </div>
      </div>

      <PageManagerClient initialPages={pages} userRole="viewer" />
    </div>
  );
}
