import { getSiteSettings } from "@/lib/content";
import { getAllPages } from "@/lib/page-manager";
import { getSessionUser } from "@/lib/auth";
import { SeoStudioClient } from "./SeoStudioClient";

export const metadata = {
  title: "SEO & JSON-LD Linked Data Studio | Beetrix360 Admin",
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
            SEO & JSON-LD Structured Data Studio
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage global and section-level SEO metadata. Inspect live Schema.org JSON-LD structured data compiled into each page&apos;s &lt;head&gt;.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-mono font-medium">
            Structured Data v3.1 Compliant
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
        <div>
          <p className="font-semibold text-amber-950">Read-Only Notice (IA v2 Migration)</p>
          <p className="text-xs text-amber-800 mt-0.5">
            The legacy SEO Studio screen is in read-only mode to prevent overwriting metadata during the IA v2 migration. Full editing will be restored in Phase 6.
          </p>
        </div>
      </div>

      <SeoStudioClient initialSite={site} pages={pages} userRole="viewer" />
    </div>
  );
}
