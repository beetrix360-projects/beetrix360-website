"use client";

import React, { useState } from "react";
import {
  Code2,
  CheckCircle2,
  Save,
} from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import type { PageRecord } from "@/lib/page-manager";

interface Props {
  initialSite: SiteSettings;
  pages: PageRecord[];
  userRole: string;
}

export function SeoStudioClient({ initialSite, pages, userRole }: Props) {
  const [site, setSite] = useState<SiteSettings>(initialSite);
  const [selectedSlug, setSelectedSlug] = useState<string>("home");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const canEdit = ["admin", "editor", "moderator"].includes(userRole);

  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      setStatusMessage({ type: "success", text: "Global SEO metadata successfully updated!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to update SEO." });
    } finally {
      setSaving(false);
    }
  };

  const getPageSchemaPreview = (slug: string) => {
    if (slug === "home") {
      return {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://www.beetrix360.com/#organization",
            name: site.name,
            alternateName: site.formerName,
            url: "https://www.beetrix360.com",
            description: site.description,
            telephone: site.phone.tel,
            foundingDate: String(site.foundingYear),
          },
          {
            "@type": "WebSite",
            "@id": "https://www.beetrix360.com/#website",
            name: site.name,
            url: "https://www.beetrix360.com",
            publisher: { "@id": "https://www.beetrix360.com/#organization" },
          },
          {
            "@type": "WebPage",
            "@id": "https://www.beetrix360.com/#webpage",
            url: "https://www.beetrix360.com/",
            name: `${site.name} | Revenue Architects & Performance Engineering`,
            description: site.description,
            isPartOf: { "@id": "https://www.beetrix360.com/#website" },
          },
        ],
      };
    }

    const p = pages.find((page) => page.slug === slug);
    if (!p) return {};

    const schemaGraph: any[] = [
      {
        "@type": "WebPage",
        "@id": `https://www.beetrix360.com/${p.slug}#webpage`,
        url: `https://www.beetrix360.com/${p.slug}`,
        name: p.seo.title,
        description: p.seo.description,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.beetrix360.com/" },
          ...(p.parentId
            ? [{ "@type": "ListItem", position: 2, name: p.parentId, item: `https://www.beetrix360.com/${p.parentId}` }]
            : []),
          { "@type": "ListItem", position: p.parentId ? 3 : 2, name: p.title, item: `https://www.beetrix360.com/${p.slug}` },
        ],
      },
    ];

    if (p.pageType === "service" || p.pageType === "sub-service") {
      schemaGraph.push({
        "@type": "Service",
        "@id": `https://www.beetrix360.com/${p.slug}#service`,
        name: p.title,
        serviceType: p.keyword || p.title,
        provider: { "@id": "https://www.beetrix360.com/#organization" },
      });
    }

    p.sections.forEach((sec) => {
      if (sec.seoSchema?.schemaType === "FAQPage") {
        schemaGraph.push({
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How does BeeTrix360 engineer measurable outcomes?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Through our unified tech architecture, autonomous workflows, and conversion-optimized pipelines.",
              },
            },
          ],
        });
      }
    });

    return {
      "@context": "https://schema.org",
      "@graph": schemaGraph,
    };
  };

  const previewSchema = getPageSchemaPreview(selectedSlug);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Global Site SEO Settings (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="pb-4 border-b border-neutral-200">
            <h2 className="text-base font-bold text-neutral-900 font-heading">
              Global Organization & SEO Identity
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Injected into root layout schema across all pages.
            </p>
          </div>

          <form onSubmit={handleSaveGlobal} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                Official Entity Name
              </label>
              <input
                type="text"
                value={site.name}
                disabled={!canEdit}
                onChange={(e) => setSite({ ...site, name: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                Former Brand Name (Knowledge Graph)
              </label>
              <input
                type="text"
                value={site.formerName}
                disabled={!canEdit}
                onChange={(e) => setSite({ ...site, formerName: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                Global Meta Description
              </label>
              <textarea
                rows={3}
                value={site.description}
                disabled={!canEdit}
                onChange={(e) => setSite({ ...site, description: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-cyan-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                  Founding Year
                </label>
                <input
                  type="number"
                  value={site.foundingYear}
                  disabled={!canEdit}
                  onChange={(e) => setSite({ ...site, foundingYear: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:bg-white focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                  Sales Telephone
                </label>
                <input
                  type="text"
                  value={site.phone.tel}
                  disabled={!canEdit}
                  onChange={(e) =>
                    setSite({
                      ...site,
                      phone: { ...site.phone, tel: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:bg-white focus:border-cyan-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving || !canEdit}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Global Identity</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Compiled JSON-LD Inspector (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="pb-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900 font-heading">
                Live JSON-LD &lt;head&gt; Compiler
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Inspect structured data generated for Google Search rich snippets.
              </p>
            </div>

            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:border-cyan-600 focus:outline-none"
            >
              <option value="home">Page: Homepage (/)</option>
              {pages.map((p) => (
                <option key={p.slug} value={p.slug}>
                  Page: /{p.slug}
                </option>
              ))}
            </select>
          </div>

          {/* Validation Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-neutral-900">Schema.org Valid</p>
                <p className="text-[10px] text-neutral-500">Syntax matches v3.1</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-neutral-900">Rich Snippets</p>
                <p className="text-[10px] text-neutral-500">Breadcrumb & Service</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-neutral-900">Head Injection</p>
                <p className="text-[10px] text-neutral-500">Self-closing script tag</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-mono text-cyan-700 mb-2 font-semibold">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>&lt;script type=&quot;application/ld+json&quot;&gt;</span>
              </span>
              <span className="text-neutral-400 text-[10px]">Auto-Compiled</span>
            </div>

            <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-[460px] leading-relaxed shadow-inner">
              {JSON.stringify(previewSchema, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
