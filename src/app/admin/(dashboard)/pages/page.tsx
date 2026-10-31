import { getAllPages } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PageStudioClient } from "./PageStudioClient";

export const metadata = {
  title: "Page Studio & Hierarchy | Beetrix360 Admin",
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
            Page &amp; Hierarchy Studio
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage 3-level page hierarchy, section blocks, paths, and dedicated SEO &amp; JSON-LD configurations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-medium">
            Total Pages: {pages.length}
          </span>
        </div>
      </div>

      <PageStudioClient
        initialPages={pages}
        userRole={user?.role || "editor"}
        userName={user?.name || user?.email || "Admin"}
      />
    </div>
  );
}
