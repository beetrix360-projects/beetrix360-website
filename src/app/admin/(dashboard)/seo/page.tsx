import { getSiteSettings } from "@/lib/content";
import { getAllPages } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { SeoStudioClient } from "./SeoStudioClient";

export const metadata = {
  title: "SEO & JSON-LD Structured Data Studio | Beetrix360 Admin",
};

export default async function AdminSeoPage() {
  const [site, pages, user] = await Promise.all([
    getSiteSettings(),
    getAllPages(),
    getSessionUser(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900">
            SEO &amp; JSON-LD Structured Data Studio
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Global entity schema properties and 159-page structured data inspector with real-time SEO health check audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-mono font-medium">
            Structured Data v3.1 Compliant
          </span>
        </div>
      </div>

      <SeoStudioClient
        initialSite={site}
        pages={pages}
        userRole={user?.role || "viewer"}
      />
    </div>
  );
}
