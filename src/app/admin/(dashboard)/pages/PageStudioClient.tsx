"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Move,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Check,
  Globe,
  Share2,
  Code,
  Sparkles,
  RefreshCw,
  Eye,
  Settings,
  Layers,
  Save,
  Undo2,
  Upload,
} from "lucide-react";
import type {
  PageRecordV2,
  PageTypeV2,
  PageOrigin,
  ContentStatus,
  SectionBlockV2,
  SectionBlockTypeV2,
} from "@/lib/types";
import type { UserRole } from "@/lib/auth";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  savePageV2Action,
  markPageReadyV2Action,
  bulkMarkPagesReadyAction,
  movePageV2Action,
  createPageV2Action,
  deletePageV2Action,
} from "@/app/admin/actions";
import { evaluatePageSeo } from "@/lib/seo-checklist";
import { buildPageJsonLd } from "@/lib/schema";

interface PageStudioClientProps {
  initialPages: PageRecordV2[];
  userRole: UserRole;
  userName?: string;
}

export function PageStudioClient({
  initialPages,
  userRole,
  userName = "Admin",
}: PageStudioClientProps) {
  const [pages, setPages] = useState<PageRecordV2[]>(initialPages);
  const [selectedId, setSelectedId] = useState<string>(
    initialPages[0]?.id || ""
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [robotsFilter, setRobotsFilter] = useState("all");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Tree expansion state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Default expand level 1
    return new Set(initialPages.filter((p) => !p.parentId).map((p) => p.id));
  });

  // Editor Tabs
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [activeSerpView, setActiveSerpView] = useState<"desktop" | "mobile">("desktop");

  // Form State for active selected page
  const activePage = useMemo(() => {
    return pages.find((p) => p.id === selectedId) || null;
  }, [pages, selectedId]);

  const [draftPage, setDraftPage] = useState<PageRecordV2 | null>(() => activePage);

  // Keep draftPage synced when switching page selection
  React.useEffect(() => {
    if (activePage) {
      setDraftPage(JSON.parse(JSON.stringify(activePage)));
    }
  }, [activePage?.id]);

  // UI state for operations
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Modals
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveParentId, setMoveParentId] = useState<string | null>(null);
  const [moveSlug, setMoveSlug] = useState("");
  const [moveError, setMoveError] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newH1, setNewH1] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const [newPageType, setNewPageType] = useState<PageTypeV2>("service");
  const [newDivision, setNewDivision] = useState("AI Search & SEO");
  const [newKeyword, setNewKeyword] = useState("");
  const [createError, setCreateError] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Distinct divisions
  const allDivisions = useMemo(() => {
    const set = new Set<string>();
    for (const p of pages) {
      if (p.division) set.add(p.division);
    }
    return Array.from(set).sort();
  }, [pages]);

  // Page hierarchy trees
  const { treePages, filteredCount } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const matchesFilter = (p: PageRecordV2): boolean => {
      if (divisionFilter !== "all" && p.division !== divisionFilter) return false;
      if (typeFilter !== "all" && p.pageType !== typeFilter) return false;
      if (originFilter !== "all" && p.origin !== originFilter) return false;
      if (statusFilter !== "all" && p.contentStatus !== statusFilter) return false;
      if (publishedFilter !== "all") {
        const isPub = publishedFilter === "published";
        if (p.published !== isPub) return false;
      }
      if (robotsFilter !== "all") {
        const isIndex = robotsFilter === "index";
        if ((p.seo?.robots?.index ?? false) !== isIndex) return false;
      }
      if (q) {
        const inPath = (p.path || "").toLowerCase().includes(q);
        const inH1 = (p.h1 || "").toLowerCase().includes(q);
        const inKw = (p.targetKeyword || "").toLowerCase().includes(q);
        if (!inPath && !inH1 && !inKw) return false;
      }
      return true;
    };

    const matchingIds = new Set(pages.filter(matchesFilter).map((p) => p.id));

    // Include ancestors so filtered nodes are visible in hierarchy
    const visibleIds = new Set<string>();
    const pageById = new Map(pages.map((p) => [p.id, p]));

    for (const id of matchingIds) {
      visibleIds.add(id);
      let curr = pageById.get(id);
      while (curr?.parentId) {
        visibleIds.add(curr.parentId);
        curr = pageById.get(curr.parentId);
      }
    }

    return {
      treePages: pages.filter((p) => visibleIds.has(p.id)),
      filteredCount: matchingIds.size,
    };
  }, [
    pages,
    searchQuery,
    divisionFilter,
    typeFilter,
    originFilter,
    statusFilter,
    publishedFilter,
    robotsFilter,
  ]);

  // Hierarchical node mapping
  const { rootNodes, childrenMap } = useMemo(() => {
    const roots: PageRecordV2[] = [];
    const map = new Map<string, PageRecordV2[]>();

    for (const p of treePages) {
      if (!p.parentId) {
        roots.push(p);
      } else {
        const arr = map.get(p.parentId) || [];
        arr.push(p);
        map.set(p.parentId, arr);
      }
    }

    // Sort roots & children by path
    roots.sort((a, b) => a.path.localeCompare(b.path));
    for (const arr of map.values()) {
      arr.sort((a, b) => a.path.localeCompare(b.path));
    }

    return { rootNodes: roots, childrenMap: map };
  }, [treePages]);

  // Expand / Collapse all
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(pages.map((p) => p.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Bulk actions
  const toggleSelectPage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(new Set(treePages.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkMarkReady = async () => {
    if (selectedIds.size === 0) return;
    setIsSaving(true);
    try {
      const res = await bulkMarkPagesReadyAction(Array.from(selectedIds));
      if (res.success) {
        setPages((prev) =>
          prev.map((p) =>
            selectedIds.has(p.id)
              ? {
                  ...p,
                  contentStatus: "ready",
                  seo: {
                    ...p.seo,
                    robots: p.seo.indexLock
                      ? p.seo.robots
                      : { ...(p.seo.robotsAfterContentReady || { index: true, follow: true }) },
                  },
                  updatedBy: userName,
                  updatedAt: new Date().toISOString(),
                }
              : p
          )
        );
        showToast("success", `Marked ${res.count} pages as Ready!`);
        clearSelection();
      }
    } catch (err: any) {
      showToast("error", err?.message || "Failed to mark pages ready.");
    } finally {
      setIsSaving(false);
    }
  };

  // Single "Mark Ready"
  const handleMarkReady = async () => {
    if (!draftPage) return;
    setIsSaving(true);
    try {
      const res = await markPageReadyV2Action(draftPage.id);
      if (res.success && res.page) {
        setPages((prev) => prev.map((p) => (p.id === res.page.id ? res.page : p)));
        setDraftPage(JSON.parse(JSON.stringify(res.page)));
        showToast("success", `Page marked Ready! Robots updated to index: ${res.page.seo.robots.index}`);
      }
    } catch (err: any) {
      showToast("error", err?.message || "Error marking page ready.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save current draft
  const handleSavePage = async () => {
    if (!draftPage) return;
    setIsSaving(true);
    try {
      const res = await savePageV2Action(draftPage);
      if (res.success && res.page) {
        setPages((prev) => prev.map((p) => (p.id === res.page.id ? res.page : p)));
        setDraftPage(JSON.parse(JSON.stringify(res.page)));
        showToast("success", `Page saved successfully! Last updated by ${userName}`);
      }
    } catch (err: any) {
      showToast("error", err?.message || "Error saving page.");
    } finally {
      setIsSaving(false);
    }
  };

  // Move page handler
  const handleOpenMoveModal = () => {
    if (!draftPage) return;
    setMoveParentId(draftPage.parentId);
    setMoveSlug(draftPage.slug);
    setMoveError("");
    setMoveModalOpen(true);
  };

  const handleExecuteMove = async () => {
    if (!draftPage) return;
    setMoveError("");
    setIsSaving(true);
    try {
      const res = await movePageV2Action(draftPage.id, moveParentId, moveSlug);
      if (res.success) {
        showToast("success", `Page moved to ${res.newPath}! 301 redirects created.`);
        setMoveModalOpen(false);
        // Refresh page tree by window reload or updated state
        window.location.reload();
      }
    } catch (err: any) {
      setMoveError(err?.message || "Failed to move page.");
    } finally {
      setIsSaving(false);
    }
  };

  // Create page handler
  const handleExecuteCreate = async () => {
    setCreateError("");
    setIsSaving(true);
    try {
      const res = await createPageV2Action({
        h1: newH1,
        slug: newSlug,
        parentId: newParentId,
        pageType: newPageType,
        division: newDivision,
        targetKeyword: newKeyword,
      });
      if (res.success && res.page) {
        setPages((prev) => [...prev, res.page]);
        setSelectedId(res.page.id);
        setCreateModalOpen(false);
        showToast("success", `Created new page at ${res.page.path}`);
      }
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create page.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete page handler
  const handleExecuteDelete = async () => {
    if (!draftPage) return;
    setDeleteError("");
    setIsSaving(true);
    try {
      const res = await deletePageV2Action(draftPage.path);
      if (res.success) {
        setPages((prev) => prev.filter((p) => p.id !== draftPage.id));
        setDeleteModalOpen(false);
        showToast("success", `Deleted page ${draftPage.path}`);
        const remaining = pages.filter((p) => p.id !== draftPage.id);
        if (remaining.length > 0) setSelectedId(remaining[0].id);
      }
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete page.");
    } finally {
      setIsSaving(false);
    }
  };

  // SEO evaluation for active draft
  const seoEval = useMemo(() => {
    if (!draftPage) return null;
    return evaluatePageSeo(draftPage, pages);
  }, [draftPage, pages]);

  // Read-only compiled JSON-LD for active draft
  const compiledJsonLd = useMemo(() => {
    if (!draftPage) return "[]";
    try {
      const nodes = buildPageJsonLd(draftPage, pages);
      return JSON.stringify(nodes, null, 2);
    } catch (e: any) {
      return `// Error compiling JSON-LD: ${e.message}`;
    }
  }, [draftPage, pages]);

  const handleCopyJsonLd = () => {
    navigator.clipboard.writeText(compiledJsonLd);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Helper for Section Block management
  const addSectionBlock = (type: SectionBlockTypeV2) => {
    if (!draftPage) return;
    const newBlock: SectionBlockV2 = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      headingLevel: "h2",
      title: `${type.toUpperCase()} Section`,
      content: { text: "Add section copy here." },
    };
    setDraftPage({
      ...draftPage,
      sections: [...(draftPage.sections || []), newBlock],
    });
  };

  const removeSectionBlock = (id: string) => {
    if (!draftPage) return;
    setDraftPage({
      ...draftPage,
      sections: (draftPage.sections || []).filter((s) => s.id !== id),
    });
  };

  const moveSectionBlock = (index: number, direction: "up" | "down") => {
    if (!draftPage || !draftPage.sections) return;
    const arr = [...draftPage.sections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= arr.length) return;
    const temp = arr[index];
    arr[index] = arr[targetIdx];
    arr[targetIdx] = temp;
    setDraftPage({ ...draftPage, sections: arr });
  };

  // Tree Node Renderer Component
  const renderTreeNode = (page: PageRecordV2, level: number = 0) => {
    const children = childrenMap.get(page.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(page.id);
    const isSelected = page.id === selectedId;
    const isChecked = selectedIds.has(page.id);

    return (
      <div key={`node-${page.id}`} className="select-none">
        <div
          onClick={() => setSelectedId(page.id)}
          className={`group flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer text-xs font-medium transition-all ${
            isSelected
              ? "bg-bx-pink/10 text-bx-pink font-semibold shadow-sm"
              : "hover:bg-neutral-100 text-neutral-700"
          }`}
          style={{ paddingLeft: `${Math.max(8, level * 16 + 8)}px` }}
        >
          {/* Checkbox for bulk */}
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => toggleSelectPage(page.id, e as any)}
            onClick={(e) => e.stopPropagation()}
            className="w-3.5 h-3.5 rounded border-neutral-300 text-bx-pink focus:ring-bx-pink"
          />

          {/* Expand Toggle */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(page.id);
              }}
              className="p-0.5 rounded hover:bg-neutral-200 text-neutral-500"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-4 inline-block" />
          )}

          {/* Icon */}
          {hasChildren ? (
            <Folder
              className={`w-3.5 h-3.5 ${
                isSelected ? "text-bx-pink" : "text-amber-500"
              }`}
            />
          ) : (
            <FileText
              className={`w-3.5 h-3.5 ${
                isSelected ? "text-bx-pink" : "text-neutral-400"
              }`}
            />
          )}

          {/* Title & Path */}
          <span className="truncate flex-1" title={`${page.h1} (${page.path})`}>
            {page.menuLabel || page.h1}
          </span>

          {/* Badges */}
          <div className="flex items-center gap-1 shrink-0">
            {page.contentStatus === "placeholder" && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Placeholder
              </span>
            )}
            {!page.published && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-600">
                Draft
              </span>
            )}
            {page.seo?.robots?.index ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Indexable" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" title="Noindex" />
            )}
          </div>
        </div>

        {/* Child Subtree */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Page Tree Explorer (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-bx-pink" />
                Page Tree ({pages.length} pages)
              </h2>
              <p className="text-[11px] text-neutral-500">
                3-level IA v2 hierarchy &amp; path controls
              </p>
            </div>
            {userRole === "admin" && (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-bx-pink text-white hover:bg-bx-pink/90 flex items-center gap-1 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                New Page
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by path, title, or keyword..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
            />
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-neutral-500 uppercase">Division</label>
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="w-full mt-0.5 px-2 py-1 text-xs rounded border border-neutral-200 bg-neutral-50"
              >
                <option value="all">All Divisions</option>
                {allDivisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-neutral-500 uppercase">Page Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full mt-0.5 px-2 py-1 text-xs rounded border border-neutral-200 bg-neutral-50"
              >
                <option value="all">All Types</option>
                <option value="hub">Hub</option>
                <option value="service">Service</option>
                <option value="sub">Sub-Service</option>
                <option value="challenge">Challenge</option>
                <option value="pricing">Pricing</option>
                <option value="company">Company</option>
                <option value="legal">Legal</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-neutral-500 uppercase">Content Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-0.5 px-2 py-1 text-xs rounded border border-neutral-200 bg-neutral-50"
              >
                <option value="all">All Statuses</option>
                <option value="placeholder">Placeholder</option>
                <option value="ready">Ready</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-neutral-500 uppercase">Robots Index</label>
              <select
                value={robotsFilter}
                onChange={(e) => setRobotsFilter(e.target.value)}
                className="w-full mt-0.5 px-2 py-1 text-xs rounded border border-neutral-200 bg-neutral-50"
              >
                <option value="all">All</option>
                <option value="index">Indexable</option>
                <option value="noindex">Noindex</option>
              </select>
            </div>
          </div>

          {/* Tree Control Bar */}
          <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="hover:text-neutral-800 underline text-[11px]"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="hover:text-neutral-800 underline text-[11px]"
              >
                Collapse All
              </button>
            </div>
            <span className="text-[11px] text-neutral-400">
              Showing {filteredCount} of {pages.length}
            </span>
          </div>

          {/* Bulk Selection Actions */}
          {selectedIds.size > 0 && (
            <div className="p-2.5 rounded-xl bg-bx-pink/5 border border-bx-pink/20 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-bx-pink">
                {selectedIds.size} pages selected
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleBulkMarkReady}
                  disabled={isSaving}
                  className="px-2 py-1 rounded bg-bx-pink text-white text-[11px] font-semibold hover:bg-bx-pink/90 transition"
                >
                  Mark Ready
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="px-2 py-1 rounded bg-neutral-200 text-neutral-700 text-[11px] font-semibold hover:bg-neutral-300 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Tree View Scroll Area */}
          <div className="max-h-[640px] overflow-y-auto space-y-0.5 pr-1">
            {rootNodes.map((root) => renderTreeNode(root, 0))}
          </div>
        </div>

        {/* Right Column: Page Editor (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
          {draftPage ? (
            <>
              {/* Top Editor Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold font-heading text-neutral-900 truncate">
                      {draftPage.h1}
                    </h1>
                    {draftPage.contentStatus === "placeholder" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        Placeholder
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                    <span>{draftPage.path}</span>
                    <span>•</span>
                    <a
                      href={draftPage.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bx-pink hover:underline inline-flex items-center gap-1"
                    >
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Mark Ready Button */}
                  {draftPage.contentStatus === "placeholder" && (
                    <button
                      type="button"
                      onClick={handleMarkReady}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-semibold text-xs hover:bg-amber-600 shadow-sm transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Mark Ready (1-Click)
                    </button>
                  )}

                  {/* Move Page Button (Admin only) */}
                  {userRole === "admin" && (
                    <button
                      type="button"
                      onClick={handleOpenMoveModal}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 font-semibold text-xs hover:bg-neutral-200 transition flex items-center gap-1.5"
                    >
                      <Move className="w-3.5 h-3.5" />
                      Move / Re-parent
                    </button>
                  )}

                  {/* Delete Page Button (Admin or Moderator) */}
                  {(userRole === "admin" || userRole === "moderator") && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setDeleteModalOpen(true);
                      }}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}

                  {/* Save Page Button */}
                  <button
                    type="button"
                    onClick={handleSavePage}
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-xl bg-bx-pink text-white font-semibold text-xs hover:bg-bx-pink/90 shadow-sm transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? "Saving..." : "Save Page"}
                  </button>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex items-center gap-4 border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
                    activeTab === "content"
                      ? "border-bx-pink text-bx-pink"
                      : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Content &amp; Structure
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("seo")}
                  className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
                    activeTab === "seo"
                      ? "border-bx-pink text-bx-pink"
                      : "border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  SEO, Meta &amp; JSON-LD
                  {seoEval && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        seoEval.hasErrors
                          ? "bg-red-100 text-red-700"
                          : seoEval.passedCount === seoEval.totalCount
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {seoEval.passedCount}/{seoEval.totalCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab 1: Content & Structure */}
              {activeTab === "content" && (
                <div className="space-y-6">
                  {/* General Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                        Main H1 Heading
                      </label>
                      <input
                        type="text"
                        value={draftPage.h1}
                        onChange={(e) =>
                          setDraftPage({ ...draftPage, h1: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                        Menu &amp; Nav Label
                      </label>
                      <input
                        type="text"
                        value={draftPage.menuLabel}
                        onChange={(e) =>
                          setDraftPage({ ...draftPage, menuLabel: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                        Target Keyword
                      </label>
                      <input
                        type="text"
                        value={draftPage.targetKeyword}
                        onChange={(e) =>
                          setDraftPage({ ...draftPage, targetKeyword: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                        Division
                      </label>
                      <input
                        type="text"
                        value={draftPage.division}
                        onChange={(e) =>
                          setDraftPage({ ...draftPage, division: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                        Page Type
                      </label>
                      <select
                        value={draftPage.pageType}
                        onChange={(e) =>
                          setDraftPage({
                            ...draftPage,
                            pageType: e.target.value as PageTypeV2,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 bg-white"
                      >
                        <option value="hub">Hub</option>
                        <option value="service">Service</option>
                        <option value="sub">Sub-Service</option>
                        <option value="platform">Platform</option>
                        <option value="challenge">Challenge</option>
                        <option value="pricing">Pricing</option>
                        <option value="company">Company</option>
                        <option value="legal">Legal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                        Published State
                      </label>
                      <div className="mt-1 flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftPage.published}
                            onChange={(e) =>
                              setDraftPage({
                                ...draftPage,
                                published: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded text-bx-pink focus:ring-bx-pink"
                          />
                          <span className="text-sm font-medium text-neutral-800">
                            Published (accessible publicly)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Audit Info Display */}
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 flex flex-wrap items-center justify-between gap-2 font-mono">
                    <div>
                      <span className="text-neutral-400">Storage Key:</span>{" "}
                      <span className="font-semibold text-neutral-800">
                        PAGE:{draftPage.path}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Last Modified:</span>{" "}
                      <span>{new Date(draftPage.updatedAt).toLocaleString()}</span>{" "}
                      {draftPage.updatedBy && (
                        <span className="text-bx-pink font-semibold">
                          by {draftPage.updatedBy}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Section Blocks Editor */}
                  <div className="space-y-4 pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-neutral-900">
                          Section Blocks ({draftPage.sections?.length || 0})
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Add, reorder, or customize page content blocks
                        </p>
                      </div>

                      {/* Add Block Dropdown */}
                      <div className="flex items-center gap-2">
                        <select
                          id="add-block-select"
                          className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-white"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              addSectionBlock(e.target.value as SectionBlockTypeV2);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="" disabled>
                            + Add Section Block...
                          </option>
                          <option value="hero">Hero Block</option>
                          <option value="intro">Intro / Lead Block</option>
                          <option value="richText">Rich Text Block</option>
                          <option value="bulletList">Deliverables Bullet List</option>
                          <option value="process">Step Process Block</option>
                          <option value="faq">FAQ Accordion Block</option>
                          <option value="cta">Call to Action Band</option>
                          <option value="relatedLinks">Related Links</option>
                        </select>
                      </div>
                    </div>

                    {/* Blocks List */}
                    <div className="space-y-3">
                      {(draftPage.sections || []).map((sec, idx) => (
                        <div
                          key={sec.id}
                          className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-200/60">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-200 text-neutral-700 uppercase">
                                {sec.type}
                              </span>
                              <input
                                type="text"
                                value={sec.title || ""}
                                onChange={(e) => {
                                  const updated = [...draftPage.sections];
                                  updated[idx] = { ...sec, title: e.target.value };
                                  setDraftPage({ ...draftPage, sections: updated });
                                }}
                                placeholder="Section Title..."
                                className="text-xs font-bold text-neutral-800 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-bx-pink focus:outline-none px-1 py-0.5"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Heading Level Selector */}
                              <select
                                value={sec.headingLevel || "h2"}
                                onChange={(e) => {
                                  const updated = [...draftPage.sections];
                                  updated[idx] = {
                                    ...sec,
                                    headingLevel: e.target.value as any,
                                  };
                                  setDraftPage({ ...draftPage, sections: updated });
                                }}
                                className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-neutral-200 bg-white"
                              >
                                <option value="h1">H1</option>
                                <option value="h2">H2</option>
                                <option value="h3">H3</option>
                              </select>

                              {/* Reorder Buttons */}
                              <button
                                type="button"
                                onClick={() => moveSectionBlock(idx, "up")}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-neutral-200 text-neutral-500 disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSectionBlock(idx, "down")}
                                disabled={idx === (draftPage.sections?.length || 0) - 1}
                                className="p-1 rounded hover:bg-neutral-200 text-neutral-500 disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Remove Block */}
                              <button
                                type="button"
                                onClick={() => removeSectionBlock(sec.id)}
                                className="p-1 rounded hover:bg-red-100 text-red-500 ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Block Content Editor */}
                          <div className="space-y-2">
                            {sec.type === "bulletList" && (
                              <div>
                                <label className="text-[10px] font-semibold text-neutral-500 uppercase">
                                  Items (one per line)
                                </label>
                                <textarea
                                  rows={4}
                                  value={(sec.content?.items || []).join("\n")}
                                  onChange={(e) => {
                                    const updated = [...draftPage.sections];
                                    updated[idx] = {
                                      ...sec,
                                      content: {
                                        ...sec.content,
                                        items: e.target.value.split("\n"),
                                      },
                                    };
                                    setDraftPage({ ...draftPage, sections: updated });
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white"
                                />
                              </div>
                            )}

                            {sec.type === "faq" && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-neutral-500 uppercase">
                                  FAQ Items
                                </label>
                                {(sec.content?.items || []).map((faq: any, fIdx: number) => (
                                  <div key={fIdx} className="p-2 rounded bg-white border border-neutral-200 space-y-1">
                                    <input
                                      type="text"
                                      value={faq.question || ""}
                                      onChange={(e) => {
                                        const updated = [...draftPage.sections];
                                        const items = [...(sec.content.items || [])];
                                        items[fIdx] = { ...faq, question: e.target.value };
                                        updated[idx] = { ...sec, content: { ...sec.content, items } };
                                        setDraftPage({ ...draftPage, sections: updated });
                                      }}
                                      placeholder="Question..."
                                      className="w-full text-xs font-semibold px-2 py-1 rounded border border-neutral-200"
                                    />
                                    <textarea
                                      rows={2}
                                      value={faq.answer || ""}
                                      onChange={(e) => {
                                        const updated = [...draftPage.sections];
                                        const items = [...(sec.content.items || [])];
                                        items[fIdx] = { ...faq, answer: e.target.value };
                                        updated[idx] = { ...sec, content: { ...sec.content, items } };
                                        setDraftPage({ ...draftPage, sections: updated });
                                      }}
                                      placeholder="Answer..."
                                      className="w-full text-xs px-2 py-1 rounded border border-neutral-200"
                                    />
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...draftPage.sections];
                                    const items = [
                                      ...(sec.content?.items || []),
                                      { question: "New Question?", answer: "New Answer." },
                                    ];
                                    updated[idx] = { ...sec, content: { ...sec.content, items } };
                                    setDraftPage({ ...draftPage, sections: updated });
                                  }}
                                  className="text-[11px] text-bx-pink font-semibold hover:underline"
                                >
                                  + Add FAQ Item
                                </button>
                              </div>
                            )}

                            {(sec.type === "richText" || sec.type === "intro" || sec.type === "hero") && (
                              <div>
                                <label className="text-[10px] font-semibold text-neutral-500 uppercase">
                                  Content Body / Description
                                </label>
                                <textarea
                                  rows={3}
                                  value={
                                    sec.content?.text ||
                                    sec.content?.description ||
                                    sec.content?.tagline ||
                                    (Array.isArray(sec.content?.paragraphs)
                                      ? sec.content.paragraphs.join("\n\n")
                                      : "")
                                  }
                                  onChange={(e) => {
                                    const updated = [...draftPage.sections];
                                    updated[idx] = {
                                      ...sec,
                                      content: {
                                        ...sec.content,
                                        text: e.target.value,
                                        paragraphs: e.target.value.split("\n\n"),
                                      },
                                    };
                                    setDraftPage({ ...draftPage, sections: updated });
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: SEO, Meta & JSON-LD */}
              {activeTab === "seo" && (
                <div className="space-y-6">
                  {/* SEO Health Warning Checklist */}
                  {seoEval && (
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          SEO &amp; Content Health Checklist
                        </h3>
                        <span className="text-xs font-semibold text-neutral-600">
                          {seoEval.passedCount} of {seoEval.totalCount} passed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {seoEval.items.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                              item.passed
                                ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                                : item.severity === "error"
                                ? "bg-red-50 border-red-200 text-red-900"
                                : "bg-amber-50 border-amber-200 text-amber-900"
                            }`}
                          >
                            {item.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : item.severity === "error" ? (
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="font-semibold">{item.label}</p>
                              <p className="text-[11px] opacity-85 mt-0.5">{item.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Core Meta Fields */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Title Tag */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                          Title Tag
                        </label>
                        <span
                          className={`text-xs font-mono font-medium ${
                            (draftPage.seo?.titleTag || "").length > 60
                              ? "text-red-600 font-bold"
                              : "text-neutral-500"
                          }`}
                        >
                          {(draftPage.seo?.titleTag || "").length} / 60 characters
                        </span>
                      </div>
                      <input
                        type="text"
                        value={draftPage.seo?.titleTag || ""}
                        onChange={(e) =>
                          setDraftPage({
                            ...draftPage,
                            seo: { ...draftPage.seo, titleTag: e.target.value },
                          })
                        }
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
                      />
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                          Meta Description
                        </label>
                        <span
                          className={`text-xs font-mono font-medium ${
                            (draftPage.seo?.metaDescription || "").length < 120 ||
                            (draftPage.seo?.metaDescription || "").length > 155
                              ? "text-amber-600 font-bold"
                              : "text-emerald-600 font-bold"
                          }`}
                        >
                          {(draftPage.seo?.metaDescription || "").length} characters (Recommended: 120–155)
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={draftPage.seo?.metaDescription || ""}
                        onChange={(e) =>
                          setDraftPage({
                            ...draftPage,
                            seo: { ...draftPage.seo, metaDescription: e.target.value },
                          })
                        }
                        className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-bx-pink/20 focus:border-bx-pink"
                      />
                    </div>

                    {/* Canonical & Breadcrumb */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                          Canonical Path
                        </label>
                        <input
                          type="text"
                          value={draftPage.seo?.canonicalPath || draftPage.path}
                          onChange={(e) =>
                            setDraftPage({
                              ...draftPage,
                              seo: { ...draftPage.seo, canonicalPath: e.target.value },
                            })
                          }
                          className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                          Breadcrumb Label
                        </label>
                        <input
                          type="text"
                          value={draftPage.seo?.breadcrumbLabel || ""}
                          onChange={(e) =>
                            setDraftPage({
                              ...draftPage,
                              seo: { ...draftPage.seo, breadcrumbLabel: e.target.value },
                            })
                          }
                          className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-neutral-200"
                        />
                      </div>
                    </div>

                    {/* Robots Directives & indexLock */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-900 uppercase">
                          Robots Indexation Directives
                        </label>
                        {draftPage.seo?.indexLock && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Robots Locked
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={draftPage.seo?.indexLock}
                            checked={draftPage.seo?.robots?.index ?? false}
                            onChange={(e) =>
                              setDraftPage({
                                ...draftPage,
                                seo: {
                                  ...draftPage.seo,
                                  robots: {
                                    ...draftPage.seo.robots,
                                    index: e.target.checked,
                                  },
                                },
                              })
                            }
                            className="w-4 h-4 rounded text-bx-pink focus:ring-bx-pink disabled:opacity-50"
                          />
                          <span className="text-xs font-semibold text-neutral-800">
                            Index (allow search engines to index)
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftPage.seo?.robots?.follow ?? true}
                            onChange={(e) =>
                              setDraftPage({
                                ...draftPage,
                                seo: {
                                  ...draftPage.seo,
                                  robots: {
                                    ...draftPage.seo.robots,
                                    follow: e.target.checked,
                                  },
                                },
                              })
                            }
                            className="w-4 h-4 rounded text-bx-pink focus:ring-bx-pink"
                          />
                          <span className="text-xs font-semibold text-neutral-800">
                            Follow (crawl outbound links)
                          </span>
                        </label>
                      </div>

                      {draftPage.seo?.indexLock && (
                        <p className="text-xs text-red-700 mt-1">
                          Indexing is locked by site policy or placeholder status. It cannot be enabled until unlocked or marked ready.
                        </p>
                      )}
                    </div>

                    {/* Open Graph Image Upload */}
                    <div className="pt-2">
                      <ImageUploadField
                        label="Open Graph & Social Share Image"
                        value={draftPage.seo?.openGraph?.imagePath || ""}
                        onChange={(url) =>
                          setDraftPage({
                            ...draftPage,
                            seo: {
                              ...draftPage.seo,
                              openGraph: {
                                ...draftPage.seo.openGraph,
                                imagePath: url,
                              },
                            },
                          })
                        }
                        helperText="Uploads to Amazon S3 or local storage. Recommended size: 1200x630px."
                      />
                    </div>
                  </div>

                  {/* Previews: SERP & Social Card */}
                  <div className="space-y-4 pt-4 border-t border-neutral-200">
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-bx-pink" />
                      Live Snippet &amp; Share Previews
                    </h3>

                    {/* Google SERP Snippet Preview */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                          Google Search Result (SERP) Preview
                        </span>
                        <div className="flex items-center gap-1 text-xs">
                          <button
                            type="button"
                            onClick={() => setActiveSerpView("desktop")}
                            className={`px-2 py-0.5 rounded font-semibold transition ${
                              activeSerpView === "desktop"
                                ? "bg-neutral-800 text-white"
                                : "text-neutral-500 hover:bg-neutral-100"
                            }`}
                          >
                            Desktop
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSerpView("mobile")}
                            className={`px-2 py-0.5 rounded font-semibold transition ${
                              activeSerpView === "mobile"
                                ? "bg-neutral-800 text-white"
                                : "text-neutral-500 hover:bg-neutral-100"
                            }`}
                          >
                            Mobile
                          </button>
                        </div>
                      </div>

                      {/* SERP Rendering */}
                      <div className="font-sans max-w-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-[12px] text-neutral-700">
                          <div className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center text-[9px] font-bold">
                            B
                          </div>
                          <span className="text-neutral-800 font-medium">beetrix360.com</span>
                          <span className="text-neutral-400">›</span>
                          <span className="text-neutral-500 truncate">
                            {draftPage.path.replace(/^\//, "").split("/").join(" › ")}
                          </span>
                        </div>

                        <h4 className="text-[18px] text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-1">
                          {draftPage.seo?.titleTag || `${draftPage.h1} | Beetrix360`}
                        </h4>

                        <p className="text-[13px] text-[#4d5156] line-clamp-2 leading-relaxed">
                          {draftPage.seo?.metaDescription ||
                            "Discover Beetrix360 capabilities and structured operational workflows designed for enterprise digital performance."}
                        </p>
                      </div>
                    </div>

                    {/* Social Share Card Preview */}
                    <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm space-y-2">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Social Share Card (Open Graph / Twitter) Preview
                      </span>

                      <div className="max-w-md rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50">
                        {draftPage.seo?.openGraph?.imagePath ? (
                          <img
                            src={draftPage.seo.openGraph.imagePath}
                            alt="OG Preview"
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-44 bg-neutral-200 flex items-center justify-center text-neutral-400 text-xs font-medium">
                            No image uploaded (falls back to default og:image)
                          </div>
                        )}
                        <div className="p-3 space-y-1 bg-white">
                          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                            BEETRIX360.COM
                          </span>
                          <h4 className="text-sm font-bold text-neutral-900 line-clamp-1">
                            {draftPage.seo?.openGraph?.title || draftPage.seo?.titleTag || draftPage.h1}
                          </h4>
                          <p className="text-xs text-neutral-600 line-clamp-2">
                            {draftPage.seo?.openGraph?.description ||
                              draftPage.seo?.metaDescription ||
                              "Beetrix360 enterprise digital capabilities."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Read-Only Compiled JSON-LD Graph */}
                  <div className="space-y-3 pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                          <Code className="w-4 h-4 text-bx-pink" />
                          Compiled JSON-LD Structured Data
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Exact read-only Schema.org graph generated by the public renderer
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyJsonLd}
                        className="px-3 py-1 rounded-lg border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 transition flex items-center gap-1.5"
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

                    <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto max-h-72 border border-neutral-800">
                      <code>{compiledJsonLd}</code>
                    </pre>
                  </div>

                  {/* Custom JSON-LD Injector */}
                  <div className="space-y-2 pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                        Custom JSON-LD Injection
                      </label>
                      <span className="text-[11px] text-neutral-400">
                        Appended to page structured data
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={draftPage.seo?.customJsonLd || ""}
                      onChange={(e) =>
                        setDraftPage({
                          ...draftPage,
                          seo: { ...draftPage.seo, customJsonLd: e.target.value },
                        })
                      }
                      placeholder='{ "@context": "https://schema.org", "@type": "CustomType", ... }'
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-200 bg-neutral-50"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-neutral-400 text-sm">
              Select a page from the tree to edit its contents and SEO.
            </div>
          )}
        </div>
      </div>

      {/* Move Page Modal */}
      {moveModalOpen && draftPage && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-neutral-900">
              Move / Re-parent Page: {draftPage.path}
            </h3>
            <p className="text-xs text-neutral-500">
              Select a new parent and slug. The path of this page and all descendant pages will be automatically recalculated, and single-hop 301 redirects will be generated.
            </p>

            {moveError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {moveError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 uppercase">
                  Target Parent Page
                </label>
                <select
                  value={moveParentId || ""}
                  onChange={(e) => setMoveParentId(e.target.value || null)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white"
                >
                  <option value="">[Root] Top-level (no parent)</option>
                  {pages
                    .filter((p) => p.id !== draftPage.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.path} ({p.h1})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 uppercase">
                  Page Slug
                </label>
                <input
                  type="text"
                  value={moveSlug}
                  onChange={(e) => setMoveSlug(e.target.value.toLowerCase().trim())}
                  className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-xl border border-neutral-200"
                />
              </div>

              {/* Calculated new path preview */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono space-y-1">
                <div className="text-neutral-500">New Path Preview:</div>
                <div className="text-bx-pink font-bold">
                  {moveParentId
                    ? `${pages.find((p) => p.id === moveParentId)?.path}/${moveSlug}`
                    : `/${moveSlug}`}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setMoveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteMove}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-bx-pink text-white hover:bg-bx-pink/90 transition shadow-sm"
              >
                {isSaving ? "Moving..." : "Confirm Move"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Page Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900">Create New Page</h3>

            {createError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {createError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 uppercase">
                  Page H1 Heading
                </label>
                <input
                  type="text"
                  value={newH1}
                  onChange={(e) => {
                    setNewH1(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Healthcare SEO Solutions"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 uppercase">
                  Slug
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().trim())}
                  placeholder="e.g. healthcare-seo"
                  className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-xl border border-neutral-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 uppercase">
                  Parent Page
                </label>
                <select
                  value={newParentId || ""}
                  onChange={(e) => setNewParentId(e.target.value || null)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white"
                >
                  <option value="">[Root] Top-level (no parent)</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.path} ({p.h1})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 uppercase">
                    Page Type
                  </label>
                  <select
                    value={newPageType}
                    onChange={(e) => setNewPageType(e.target.value as PageTypeV2)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white"
                  >
                    <option value="service">Service</option>
                    <option value="sub">Sub-Service</option>
                    <option value="hub">Hub</option>
                    <option value="platform">Platform</option>
                    <option value="challenge">Challenge</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 uppercase">
                    Division
                  </label>
                  <select
                    value={newDivision}
                    onChange={(e) => setNewDivision(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white"
                  >
                    {allDivisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 uppercase">
                  Target Keyword
                </label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. healthcare seo services"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCreate}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-bx-pink text-white hover:bg-bx-pink/90 transition shadow-sm"
              >
                {isSaving ? "Creating..." : "Create Page"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && draftPage && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Page Confirmation
            </h3>
            <p className="text-xs text-neutral-600">
              Are you sure you want to permanently delete page{" "}
              <span className="font-mono font-bold text-neutral-900">{draftPage.path}</span>?
              This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-600 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
              >
                {isSaving ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

