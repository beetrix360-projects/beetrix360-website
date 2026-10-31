"use client";

import React, { useState, useMemo } from "react";
import {
  Code,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
  Filter,
  Save,
  Copy,
  Check,
  ExternalLink,
  Edit,
  Globe,
  Settings,
  ShieldCheck,
  Eye,
  Lock,
} from "lucide-react";
import type { PageRecordV2, SiteSettings } from "@/lib/types";
import { saveSiteSettingsAction } from "../../actions";
import { evaluatePageSeo } from "@/lib/seo-checklist";
import { buildPageJsonLd } from "@/lib/schema";

interface Props {
  initialSite: SiteSettings;
  pages: PageRecordV2[];
  userRole: string;
}

export function SeoStudioClient({ initialSite, pages, userRole }: Props) {
  const [site, setSite] = useState<SiteSettings>(initialSite);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Inspector Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [issueFilter, setIssueFilter] = useState<string>("all");

  // Inspected Page State for JSON-LD drawer
  const [inspectPageId, setInspectPageId] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const canEditGlobal = ["admin", "editor", "moderator"].includes(userRole);

  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditGlobal) return;
    setSavingGlobal(true);
    setGlobalMessage(null);
    try {
      await saveSiteSettingsAction(site);
      setGlobalMessage({ type: "success", text: "Global SEO metadata successfully saved!" });
    } catch (err: any) {
      setGlobalMessage({ type: "error", text: err?.message || "Failed to save global SEO." });
    } finally {
      setSavingGlobal(false);
    }
  };

  // Evaluate SEO for all pages
  const evaluatedPages = useMemo(() => {
    return pages.map((p) => {
      const evaluation = evaluatePageSeo(p, pages);
      return {
        page: p,
        evaluation,
        failedIssues: evaluation.items.filter((it) => !it.passed),
      };
    });
  }, [pages]);

  // Filtered pages based on checklist issues and search query
  const filteredPages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return evaluatedPages.filter(({ page, evaluation, failedIssues }) => {
      // 1. Issue filter
      if (issueFilter === "issues" && failedIssues.length === 0) return false;
      if (issueFilter === "title-length") {
        const item = evaluation.items.find((it) => it.id === "title-length");
        if (item?.passed) return false;
      }
      if (issueFilter === "desc-length") {
        const item = evaluation.items.find((it) => it.id === "description-length");
        if (item?.passed) return false;
      }
      if (issueFilter === "keyword-missing") {
        const h1Item = evaluation.items.find((it) => it.id === "keyword-h1");
        const titleItem = evaluation.items.find((it) => it.id === "keyword-title");
        if (h1Item?.passed && titleItem?.passed) return false;
      }
      if (issueFilter === "noindex") {
        if (page.seo?.robots?.index) return false;
      }
      if (issueFilter === "duplicate-kw") {
        const item = evaluation.items.find((it) => it.id === "unique-keyword");
        if (item?.passed) return false;
      }

      // 2. Search query
      if (q) {
        const inPath = (page.path || "").toLowerCase().includes(q);
        const inH1 = (page.h1 || "").toLowerCase().includes(q);
        const inKw = (page.targetKeyword || "").toLowerCase().includes(q);
        const inTitle = (page.seo?.titleTag || "").toLowerCase().includes(q);
        if (!inPath && !inH1 && !inKw && !inTitle) return false;
      }

      return true;
    });
  }, [evaluatedPages, searchQuery, issueFilter]);

  // Selected page for modal inspection
  const inspectedPage = useMemo(() => {
    return pages.find((p) => p.id === inspectPageId) || null;
  }, [pages, inspectPageId]);

  const inspectedJsonLd = useMemo(() => {
    if (!inspectedPage) return "[]";
    try {
      const nodes = buildPageJsonLd(inspectedPage, pages);
      return JSON.stringify(nodes, null, 2);
    } catch (e: any) {
      return `// Error: ${e.message}`;
    }
  }, [inspectedPage, pages]);

  const handleCopyInspected = () => {
    navigator.clipboard.writeText(inspectedJsonLd);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Global Site Metadata & Organization Schema */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-bx-pink" />
              Global Site Identity &amp; Organization Schema
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Defines canonical entity properties emitted in Schema.org JSON-LD graphs across all pages.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Schema.org Graph Active
          </span>
        </div>

        {globalMessage && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium ${
              globalMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-red-50 text-red-900 border-red-200"
            }`}
          >
            {globalMessage.text}
          </div>
        )}

        <form onSubmit={handleSaveGlobal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Organization Name
              </label>
              <input
                type="text"
                value={site.name}
                onChange={(e) => setSite({ ...site, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Former Legal Name
              </label>
              <input
                type="text"
                value={site.formerName}
                onChange={(e) => setSite({ ...site, formerName: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Founding Year
              </label>
              <input
                type="number"
                value={site.foundingYear}
                onChange={(e) => setSite({ ...site, foundingYear: parseInt(e.target.value, 10) || 2026 })}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
              Global Site Description
            </label>
            <textarea
              rows={2}
              value={site.description}
              onChange={(e) => setSite({ ...site, description: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingGlobal || !canEditGlobal}
              className="px-4 py-2 rounded-xl bg-bx-pink text-white font-semibold text-xs hover:bg-bx-pink/90 transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingGlobal ? "Saving..." : "Save Organization Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: All 159 Pages SEO Inspector Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-bx-pink" />
              Page SEO &amp; Structured Data Inspector ({pages.length} Pages)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Inspect meta tags, robots controls, canonical URLs, and Schema.org linked data graphs with live health check filters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg">
              Showing {filteredPages.length} of {pages.length}
            </span>
          </div>
        </div>

        {/* Search & Issue Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by path, title, or target keyword..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
            />
          </div>

          <div className="sm:col-span-7 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter by:
            </span>
            <button
              type="button"
              onClick={() => setIssueFilter("all")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                issueFilter === "all"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              All Pages
            </button>

            <button
              type="button"
              onClick={() => setIssueFilter("issues")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                issueFilter === "issues"
                  ? "bg-amber-500 text-white font-bold"
                  : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              Pages with Warnings
            </button>

            <button
              type="button"
              onClick={() => setIssueFilter("title-length")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                issueFilter === "title-length"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Title &gt; 60 chars
            </button>

            <button
              type="button"
              onClick={() => setIssueFilter("desc-length")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                issueFilter === "desc-length"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Description Out of Range
            </button>

            <button
              type="button"
              onClick={() => setIssueFilter("noindex")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                issueFilter === "noindex"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Noindex Pages
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase tracking-wider text-[10px] border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Page &amp; Path</th>
                <th className="py-3 px-3">Target Keyword</th>
                <th className="py-3 px-3">Title Tag</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Robots</th>
                <th className="py-3 px-3">Schema Types</th>
                <th className="py-3 px-3">Health Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-sans">
              {filteredPages.map(({ page, evaluation, failedIssues }) => {
                const titleLen = (page.seo?.titleTag || "").length;
                const descLen = (page.seo?.metaDescription || "").length;

                return (
                  <tr key={page.id} className="hover:bg-neutral-50/70 transition">
                    {/* Path & H1 */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-neutral-900 truncate" title={page.h1}>
                        {page.h1}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500 truncate" title={page.path}>
                        {page.path}
                      </div>
                    </td>

                    {/* Target Keyword */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono text-[11px]">
                        {page.targetKeyword || "—"}
                      </span>
                    </td>

                    {/* Title Tag */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="truncate text-neutral-800" title={page.seo?.titleTag}>
                        {page.seo?.titleTag}
                      </div>
                      <span
                        className={`text-[10px] font-mono font-semibold ${
                          titleLen > 60 ? "text-red-600 font-bold" : "text-neutral-400"
                        }`}
                      >
                        {titleLen} chars
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="truncate text-neutral-600" title={page.seo?.metaDescription || ""}>
                        {page.seo?.metaDescription || "—"}
                      </div>
                      <span
                        className={`text-[10px] font-mono font-semibold ${
                          descLen < 120 || descLen > 155 ? "text-amber-600" : "text-emerald-600"
                        }`}
                      >
                        {descLen} chars
                      </span>
                    </td>

                    {/* Robots */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {page.seo?.robots?.index ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          index, follow
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                          noindex, follow
                        </span>
                      )}
                    </td>

                    {/* Schema Types */}
                    <td className="py-3 px-3 max-w-[140px]">
                      <div className="flex flex-wrap gap-1">
                        {(page.seo?.schemaTypes || ["WebPage"]).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-50 text-cyan-700 border border-cyan-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Health Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {failedIssues.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> All Pass
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 cursor-pointer"
                          title={failedIssues.map((f) => f.label).join(", ")}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {failedIssues.length} warning{failedIssues.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectPageId(page.id)}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                        >
                          Inspect JSON-LD
                        </button>
                        <a
                          href={`/admin/pages`}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-bx-pink/10 text-bx-pink hover:bg-bx-pink/20 transition flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON-LD Inspector Modal */}
      {inspectedPage && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  JSON-LD Structured Data: {inspectedPage.path}
                </h3>
                <p className="text-xs text-neutral-500">
                  Exact schema graph compiled for public &lt;head&gt;
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyInspected}
                className="px-3 py-1 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-100 transition flex items-center gap-1.5"
              >
                {copiedJson ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON-LD</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto max-h-96 border border-neutral-800">
              <code>{inspectedJsonLd}</code>
            </pre>

            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setInspectPageId(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-neutral-200 text-neutral-800 hover:bg-neutral-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
