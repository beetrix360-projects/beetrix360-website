import { getAnalyticsSettings } from "@/lib/content";
import { getSessionUser } from "@/lib/auth";
import { AnalyticsStudioClient } from "./AnalyticsStudioClient";

export const metadata = {
  title: "Google Analytics & Tag Manager Studio | Beetrix360 Admin",
};

export default async function AdminAnalyticsPage() {
  const [settings, user] = await Promise.all([
    getAnalyticsSettings(),
    getSessionUser(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900">
            Google Analytics (GA4) &amp; Tag Manager (GTM)
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure GA4 Measurement IDs, Google Tag Manager containers, Consent Mode v2 defaults, and automatic conversion event tracking across the entire website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-mono font-medium">
            GA4 + GTM DataLayer Ready
          </span>
        </div>
      </div>

      <AnalyticsStudioClient initialSettings={settings} userRole={user?.role || "editor"} />
    </div>
  );
}

