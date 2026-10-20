import { getAllPages } from "@/lib/page-manager";
import { getSessionUser } from "@/lib/auth";
import { PageManagerClient } from "./PageManagerClient";

export const metadata = {
  title: "Pages & Parent Hierarchy | BeeTrix360 Admin",
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

      <PageManagerClient initialPages={pages} userRole={user?.role || "editor"} />
    </div>
  );
}
