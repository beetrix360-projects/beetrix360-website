"use client";

import React, { useState } from "react";
import {
  Plus,
  FileText,
  FolderTree,
  ChevronRight,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Layers,
  Sparkles,
} from "lucide-react";
import { PageRecord, PageType, SectionBlock } from "@/lib/page-manager";
import { deletePageAction, savePageAction } from "../../actions";

interface Props {
  initialPages: PageRecord[];
  userRole: string;
}

export function PageManagerClient({ initialPages, userRole }: Props) {
  const [pages, setPages] = useState<PageRecord[]>(initialPages);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<PageRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const canDelete = ["admin", "moderator"].includes(userRole);
  const canEdit = ["admin", "editor", "moderator"].includes(userRole);

  const [newPage, setNewPage] = useState<Partial<PageRecord>>({
    title: "",
    slug: "",
    parentId: null,
    pageType: "service",
    status: "published",
    keyword: "",
    seo: { title: "", description: "" },
    sections: [],
  });

  const parentOptions = pages.filter((p) => p.parentId === null);

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveSelected = async () => {
    if (!selectedPage || !canEdit) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      await savePageAction(selectedPage);
      setPages(pages.map((p) => (p.slug === selectedPage.slug ? selectedPage : p)));
      setStatusMessage({ type: "success", text: `Page /${selectedPage.slug} updated successfully!` });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to update page." });
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.title || !newPage.slug) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const formattedSlug = newPage.slug
        .toLowerCase()
        .replace(/[^a-z0-9-/]/g, "-")
        .replace(/^-+|-+$/g, "");

      const pageToCreate: PageRecord = {
        id: `page_${Date.now()}`,
        slug: formattedSlug,
        title: newPage.title.trim(),
        parentId: newPage.parentId || null,
        pageType: (newPage.pageType as PageType) || "service",
        status: "published",
        keyword: newPage.keyword || newPage.title,
        order: pages.length + 1,
        seo: {
          title: newPage.seo?.title || `${newPage.title} | BeeTrix360`,
          description: newPage.seo?.description || `Discover enterprise ${newPage.title} capabilities.`,
        },
        sections: [
          {
            id: `sec_${Date.now()}`,
            type: "hero",
            title: newPage.title,
            content: { headline: newPage.title, description: `Comprehensive ${newPage.title} overview.` },
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      await savePageAction(pageToCreate);
      setPages([...pages, pageToCreate]);
      setIsCreating(false);
      setSelectedPage(pageToCreate);
      setStatusMessage({ type: "success", text: `Page /${pageToCreate.slug} created and live revalidated!` });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to create page." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!canDelete) {
      setStatusMessage({ type: "error", text: "Forbidden: Only Administrators and Moderators can delete pages." });
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete page "/${slug}"?`)) return;

    setSaving(true);
    try {
      await deletePageAction(slug);
      setPages(pages.filter((p) => p.slug !== slug));
      if (selectedPage?.slug === slug) setSelectedPage(null);
      setStatusMessage({ type: "success", text: `Page /${slug} successfully deleted.` });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to delete page." });
    } finally {
      setSaving(false);
    }
  };

  const addSectionToSelected = () => {
    if (!selectedPage) return;
    const newSec: SectionBlock = {
      id: `sec_${Date.now()}`,
      type: "faqs",
      title: "Frequently Asked Questions",
      content: { items: [{ question: "What results can we expect?", answer: "Measurable ROI within 30-60 days." }] },
      seoSchema: {
        schemaType: "FAQPage",
      },
    };
    setSelectedPage({
      ...selectedPage,
      sections: [...selectedPage.sections, newSec],
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <div
              className={`text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono font-medium ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {statusMessage.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <button
            onClick={() => {
              setIsCreating(true);
              setSelectedPage(null);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Page</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hierarchical Page Tree List (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs max-h-[750px] overflow-y-auto space-y-2">
          <div className="flex items-center justify-between pb-3 px-2 border-b border-neutral-100 text-xs text-neutral-500 font-mono font-semibold">
            <span>PAGE DIRECTORY ({filteredPages.length})</span>
            <span>TYPE / STATUS</span>
          </div>

          {filteredPages.map((page) => {
            const isSelected = selectedPage?.slug === page.slug;
            const isParent = page.parentId === null;

            return (
              <div
                key={page.slug}
                onClick={() => {
                  setSelectedPage(page);
                  setIsCreating(false);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-emerald-50/80 border-emerald-300 shadow-xs"
                    : "bg-neutral-50/50 border-neutral-200/70 hover:bg-neutral-100/70 hover:border-neutral-300"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {isParent ? (
                      <FolderTree className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 ml-2 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-neutral-900 truncate">{page.title}</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-500 mt-1 truncate">
                    /{page.slug}
                    {page.parentId && <span className="text-neutral-400 ml-1.5">(Parent: /{page.parentId})</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white text-neutral-600 border border-neutral-200">
                    {page.pageType}
                  </span>
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 hover:text-emerald-600 text-neutral-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Page & Parent Detail Editor (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
          {/* Create Page Mode */}
          {isCreating && (
            <form onSubmit={handleCreatePage} className="space-y-5">
              <div className="pb-4 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 font-heading">Create New Page</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Set title, slug URL, parent assignment, and initial SEO metadata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-800"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Workflow Optimization"
                  value={newPage.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    setNewPage({ ...newPage, title, slug });
                  }}
                  className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Slug Route (URL) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ai-workflow-optimization"
                    value={newPage.slug}
                    onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Parent Page Module
                  </label>
                  <select
                    value={newPage.parentId || ""}
                    onChange={(e) => setNewPage({ ...newPage, parentId: e.target.value || null })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">None (Top-Level Parent Division)</option>
                    {parentOptions.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.title} (/{p.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Page Type
                  </label>
                  <select
                    value={newPage.pageType}
                    onChange={(e) => setNewPage({ ...newPage, pageType: e.target.value as PageType })}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="division">Division Hub (Parent)</option>
                    <option value="service">Service Hub (Child)</option>
                    <option value="sub-service">Sub-Service Page (Grandchild)</option>
                    <option value="custom">Custom Landing Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Primary Target Keyword
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. enterprise ai automation services"
                    value={newPage.keyword}
                    onChange={(e) => setNewPage({ ...newPage, keyword: e.target.value })}
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {saving ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Publish New Page Module</span>
              </button>
            </form>
          )}

          {/* Edit Selected Page Mode */}
          {!isCreating && selectedPage && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 font-heading">{selectedPage.title}</h2>
                  <p className="text-xs font-mono text-neutral-500 mt-0.5">Route: /{selectedPage.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(selectedPage.slug)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                  <button
                    onClick={handleSaveSelected}
                    disabled={saving || !canEdit}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {saving ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Save Updates
                  </button>
                </div>
              </div>

              {/* Parent Assignment (Requirement 2) */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 uppercase tracking-wider font-semibold">
                  <FolderTree className="w-4 h-4" />
                  <span>Parent Hierarchy Module</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-600 mb-1 font-medium">
                      Assigned Parent Page
                    </label>
                    <select
                      value={selectedPage.parentId || ""}
                      onChange={(e) =>
                        setSelectedPage({
                          ...selectedPage,
                          parentId: e.target.value || null,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">None (Top-Level Parent Division)</option>
                      {parentOptions
                        .filter((p) => p.slug !== selectedPage.slug)
                        .map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.title} (/{p.slug})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-600 mb-1 font-medium">
                      Classification
                    </label>
                    <select
                      value={selectedPage.pageType}
                      onChange={(e) =>
                        setSelectedPage({
                          ...selectedPage,
                          pageType: e.target.value as PageType,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="division">Parent Division Hub</option>
                      <option value="service">Child Service</option>
                      <option value="sub-service">Sub-Service</option>
                      <option value="custom">Custom Landing Page</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEO & JSON-LD Section (Requirement 5) */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-700 uppercase tracking-wider font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>Page SEO & Head JSON-LD Fields</span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-600 mb-1 font-medium">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={selectedPage.seo.title}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        seo: { ...selectedPage.seo, title: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-600 mb-1 font-medium">
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={selectedPage.seo.description}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        seo: { ...selectedPage.seo, description: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-600 mb-1 font-medium">
                    Custom Schema.org Linked Data (JSON-LD)
                  </label>
                  <textarea
                    rows={3}
                    placeholder='{"@context": "https://schema.org", "@type": "Service", "name": "..."}'
                    value={selectedPage.seo.customJsonLd || ""}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        seo: { ...selectedPage.seo, customJsonLd: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-cyan-300 font-mono text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              {/* Section Blocks */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-700 uppercase tracking-wider font-semibold">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Page Sections ({selectedPage.sections.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={addSectionToSelected}
                    className="text-xs px-2.5 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Section
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedPage.sections.map((sec, sIdx) => (
                    <div key={sec.id} className="p-3 rounded-lg bg-white border border-neutral-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-600">
                        <span>Block #{sIdx + 1}: {sec.type.toUpperCase()}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newSecs = selectedPage.sections.filter((_, i) => i !== sIdx);
                            setSelectedPage({ ...selectedPage, sections: newSecs });
                          }}
                          className="text-red-600 hover:text-red-700 text-[10px]"
                        >
                          Remove Block
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Section Title"
                          value={sec.title || ""}
                          onChange={(e) => {
                            const newSecs = [...selectedPage.sections];
                            newSecs[sIdx].title = e.target.value;
                            setSelectedPage({ ...selectedPage, sections: newSecs });
                          }}
                          className="px-2.5 py-1 bg-neutral-50 border border-neutral-300 rounded text-neutral-900 text-xs"
                        />

                        <select
                          value={sec.seoSchema?.schemaType || "Service"}
                          onChange={(e) => {
                            const newSecs = [...selectedPage.sections];
                            newSecs[sIdx].seoSchema = {
                              ...newSecs[sIdx].seoSchema,
                              schemaType: e.target.value as any,
                            };
                            setSelectedPage({ ...selectedPage, sections: newSecs });
                          }}
                          className="px-2.5 py-1 bg-neutral-50 border border-neutral-300 rounded text-neutral-700 text-xs"
                        >
                          <option value="Service">JSON-LD: Service Schema</option>
                          <option value="FAQPage">JSON-LD: FAQPage Schema</option>
                          <option value="HowTo">JSON-LD: HowTo Schema</option>
                          <option value="Review">JSON-LD: Review Schema</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isCreating && !selectedPage && (
            <div className="h-96 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <FileText className="w-10 h-10 mb-3 opacity-30 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-700">Select a page from the tree to edit or manage its parent.</p>
              <p className="text-xs mt-1 text-neutral-400">Or click &quot;Create New Page&quot; to register a new division, service, or custom page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
