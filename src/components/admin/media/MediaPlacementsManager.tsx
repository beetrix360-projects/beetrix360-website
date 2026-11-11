"use client";

import React, { useState, useMemo } from "react";
import type {
  MediaPlaceholderSlotView,
  MediaType,
  PageMediaGroup,
} from "@/lib/types";
import { MediaPlacementCard } from "./MediaPlacementCard";

export interface CategorySummary {
  id: string;
  label: string;
  pageCount: number;
  configuredSlots: number;
  totalSlots: number;
}

interface MediaPlacementsManagerProps {
  initialCategories: CategorySummary[];
  initialGroups: PageMediaGroup[];
}

export function MediaPlacementsManager({
  initialCategories,
  initialGroups,
}: MediaPlacementsManagerProps) {
  const [groups, setGroups] = useState<PageMediaGroup[]>(initialGroups);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategories[0]?.id || "home"
  );
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>(
    initialGroups[0]?.pageSlug || "home"
  );
  const [pageSearch, setPageSearch] = useState<string>("");
  const [slotSearch, setSlotSearch] = useState<string>("");
  const [slotStatusFilter, setSlotStatusFilter] = useState<
    "all" | "configured" | "empty"
  >("all");

  // Modal state for registering a custom placeholderKey on the active page
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newDimensions, setNewDimensions] = useState("1200 × 900");
  const [newMediaType, setNewMediaType] = useState<MediaType>("IMAGE");
  const [newAltText, setNewAltText] = useState("");
  const [addingSlot, setAddingSlot] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Database Sync State
  const [syncingDb, setSyncingDb] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  async function handleSyncToDynamoDb() {
    setSyncingDb(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/media-placements/sync-dynamodb", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sync encountered an issue");
      }
      setSyncMessage(data.message || "DynamoDB synchronized successfully!");
      setTimeout(() => setSyncMessage(null), 6000);
    } catch (err: any) {
      setSyncMessage(`Database Notice: ${err?.message || "Could not sync to cloud DB"}`);
      setTimeout(() => setSyncMessage(null), 6000);
    } finally {
      setSyncingDb(false);
    }
  }

  // Recompute category summaries dynamically from current groups state
  const categories = useMemo(() => {
    return initialCategories.map((cat) => {
      const catGroups = groups.filter((g) => g.category === cat.id);
      const configuredSlots = catGroups.reduce(
        (acc, g) => acc + g.placements.filter((p) => p.isConfigured).length,
        0
      );
      const totalSlots = catGroups.reduce(
        (acc, g) => acc + g.placements.length,
        0
      );
      return {
        ...cat,
        pageCount: catGroups.length,
        configuredSlots,
        totalSlots,
      };
    });
  }, [groups, initialCategories]);

  // Filter pages by selected category (or global pageSearch if user types a search query)
  const filteredPages = useMemo(() => {
    const q = pageSearch.trim().toLowerCase();
    return groups.filter((g) => {
      const matchesCat = q ? true : g.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        g.pageTitle.toLowerCase().includes(q) ||
        g.pageSlug.toLowerCase().includes(q) ||
        g.pagePath.toLowerCase().includes(q)
      );
    });
  }, [groups, selectedCategory, pageSearch]);

  const activePageGroup = useMemo(() => {
    return (
      groups.find((g) => g.pageSlug === selectedPageSlug) ||
      filteredPages[0] ||
      groups[0]
    );
  }, [groups, selectedPageSlug, filteredPages]);

  const activeCategoryLabel = useMemo(() => {
    const found = categories.find((c) => c.id === activePageGroup?.category);
    return found?.label || "Category";
  }, [categories, activePageGroup]);

  const visibleSlots = useMemo(() => {
    if (!activePageGroup) return [];
    const q = slotSearch.trim().toLowerCase();
    return activePageGroup.placements.filter((slot) => {
      if (slotStatusFilter === "configured" && !slot.isConfigured) return false;
      if (slotStatusFilter === "empty" && slot.isConfigured) return false;
      if (!q) return true;
      return (
        slot.placeholderKey.toLowerCase().includes(q) ||
        slot.label.toLowerCase().includes(q) ||
        (slot.altText || "").toLowerCase().includes(q)
      );
    });
  }, [activePageGroup, slotSearch, slotStatusFilter]);

  function handleSelectCategory(catId: string) {
    setSelectedCategory(catId);
    setPageSearch("");
    const firstInCat = groups.find((g) => g.category === catId);
    if (firstInCat) {
      setSelectedPageSlug(firstInCat.pageSlug);
    }
  }

  function handleSlotSaved(
    updatedSlot: MediaPlaceholderSlotView,
    applyScope: "page" | "category" | "all",
    _updatedCount: number
  ) {
    setGroups((prev) =>
      prev.map((g) => {
        const shouldUpdate =
          g.pageSlug === updatedSlot.pageSlug ||
          (applyScope === "category" &&
            g.category === activePageGroup?.category &&
            g.placements.some(
              (p) => p.placeholderKey === updatedSlot.placeholderKey
            )) ||
          (applyScope === "all" &&
            g.placements.some(
              (p) => p.placeholderKey === updatedSlot.placeholderKey
            ));

        if (!shouldUpdate) return g;

        const nextPlacements = g.placements.map((p) => {
          if (p.placeholderKey !== updatedSlot.placeholderKey) return p;
          if (g.pageSlug === updatedSlot.pageSlug) return updatedSlot;
          return {
            ...p,
            mediaType: updatedSlot.mediaType,
            sourceType: updatedSlot.sourceType,
            mediaUrl: updatedSlot.mediaUrl,
            altText: updatedSlot.altText || p.defaultAltText || p.altText,
            seoTitle: updatedSlot.seoTitle,
            seoDescription: updatedSlot.seoDescription,
            updatedAt: updatedSlot.updatedAt,
            isConfigured: Boolean(updatedSlot.mediaUrl),
          };
        });

        return {
          ...g,
          placements: nextPlacements,
          configuredCount: nextPlacements.filter((p) => p.isConfigured).length,
          totalCount: nextPlacements.length,
        };
      })
    );
  }

  function handleSlotReset(slotId: string) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.pageSlug !== activePageGroup?.pageSlug) return g;
        const target = g.placements.find((p) => p.id === slotId);
        if (!target) return g;

        let nextPlacements: MediaPlaceholderSlotView[];
        if (target.isCustomSlot) {
          nextPlacements = g.placements.filter((p) => p.id !== slotId);
        } else {
          nextPlacements = g.placements.map((p) =>
            p.id === slotId
              ? {
                  ...p,
                  mediaUrl: "",
                  isConfigured: false,
                  altText: p.defaultAltText || p.altText,
                }
              : p
          );
        }

        return {
          ...g,
          placements: nextPlacements,
          configuredCount: nextPlacements.filter((p) => p.isConfigured).length,
          totalCount: nextPlacements.length,
        };
      })
    );
  }

  async function handleRegisterCustomSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!activePageGroup) return;
    setAddError(null);

    const cleanKey = newKey.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    if (!cleanKey) {
      setAddError("Please enter a valid placeholderKey (e.g., hero_banner_2).");
      return;
    }

    setAddingSlot(true);
    try {
      const res = await fetch("/api/admin/media-placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug: activePageGroup.pageSlug,
          placeholderKey: cleanKey,
          label: newLabel.trim() || cleanKey,
          mediaType: newMediaType,
          sourceType: "UPLOAD",
          mediaUrl: "",
          altText:
            newAltText.trim() ||
            `${activePageGroup.pageTitle} — ${newLabel.trim() || cleanKey}`,
          dimensions: newDimensions.trim() || "1200 × 900",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register placeholder");
      }

      const createdSlot: MediaPlaceholderSlotView = {
        ...data.placement,
        isConfigured: Boolean(data.placement.mediaUrl),
        isCustomSlot: true,
        defaultAltText: data.placement.altText,
      };

      setGroups((prev) =>
        prev.map((g) => {
          if (g.pageSlug !== activePageGroup.pageSlug) return g;
          const exists = g.placements.some(
            (p) => p.placeholderKey === createdSlot.placeholderKey
          );
          const nextPlacements = exists
            ? g.placements.map((p) =>
                p.placeholderKey === createdSlot.placeholderKey
                  ? createdSlot
                  : p
              )
            : [...g.placements, createdSlot];

          return {
            ...g,
            placements: nextPlacements,
            configuredCount: nextPlacements.filter((p) => p.isConfigured).length,
            totalCount: nextPlacements.length,
          };
        })
      );

      setNewKey("");
      setNewLabel("");
      setNewAltText("");
      setShowAddModal(false);
    } catch (err: any) {
      setAddError(err?.message || "Failed to register slot");
    } finally {
      setAddingSlot(false);
    }
  }

  const totalWebsitePages = groups.length;
  const totalWebsiteSlots = groups.reduce((acc, g) => acc + g.totalCount, 0);
  const totalConfiguredSlots = groups.reduce(
    (acc, g) => acc + g.placements.filter((p) => p.isConfigured).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Global Overview & Action Header */}
      <div className="rounded-2xl border border-white/10 bg-[#14141d] p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-[#ff2d78]/15 text-[#ff2d78] border border-[#ff2d78]/30">
              Media &amp; SEO Registry
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#00c864]/15 text-[#00c864] border border-[#00c864]/30">
              {totalConfiguredSlots} / {totalWebsiteSlots} Active Placements
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dynamic Page Media &amp; SEO Placement Manager
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-3xl">
            Upload images or videos (or attach external CDN URLs) to named placeholders across all{" "}
            <strong className="text-white">{totalWebsitePages}</strong> website pages. Every placement
            automatically injects <code className="text-[#00c864]">alt</code> text,{" "}
            <code className="text-[#00c864]">&lt;head&gt;</code> OpenGraph/Twitter tags, and{" "}
            <code className="text-[#00c864]">ImageObject</code> /{" "}
            <code className="text-[#00c864]">VideoObject</code> JSON-LD for search engine crawlers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSyncToDynamoDb}
            disabled={syncingDb}
            className="px-4 py-2.5 rounded-xl bg-[#00c864]/20 hover:bg-[#00c864]/30 border border-[#00c864]/40 text-xs font-semibold text-[#00c864] transition flex items-center gap-2 disabled:opacity-50"
            title="Ensures all 4,609 placements are stored in AWS DynamoDB"
          >
            <span>{syncingDb ? "Syncing to DynamoDB..." : "Sync Cloud Database"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition flex items-center gap-2"
          >
            <span className="text-[#ff2d78] text-base leading-none">+</span>
            <span>Register Custom Placeholder</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="rounded-xl border border-[#00c864]/30 bg-[#00c864]/10 p-4 text-xs font-mono text-[#00c864] flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#00c864] animate-pulse" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Step 1: Category Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id && !pageSearch.trim();
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-2.5 ${
                isActive
                  ? "bg-[#ff2d78] text-white border-[#ff2d78] shadow-lg shadow-[#ff2d78]/20"
                  : "bg-[#14141d] text-white/70 border-white/10 hover:border-white/25 hover:text-white"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive
                    ? "bg-black/30 text-white"
                    : cat.configuredSlots > 0
                      ? "bg-[#00c864]/15 text-[#00c864]"
                      : "bg-white/5 text-white/45"
                }`}
              >
                {cat.configuredSlots}/{cat.totalSlots}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step 2: Page-Based Tabs & Search Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#14141d] p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Website Page Tabs ({filteredPages.length} pages)
            </span>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="search"
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              placeholder="Search any page by title or URL slug..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-[#ff2d78]"
            />
          </div>
        </div>

        {/* Horizontal Scrollable Page Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
          {filteredPages.map((pg) => {
            const isSelected = activePageGroup?.pageSlug === pg.pageSlug;
            const configured = pg.placements.filter((p) => p.isConfigured).length;
            return (
              <button
                key={pg.pageSlug}
                type="button"
                onClick={() => setSelectedPageSlug(pg.pageSlug)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-left border transition flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-white text-black border-white font-semibold shadow-md"
                    : "bg-black/40 text-white/75 border-white/10 hover:border-white/25 hover:text-white"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs truncate max-w-[200px]">
                    {pg.pageTitle}
                  </div>
                  <div
                    className={`text-[10px] font-mono truncate max-w-[200px] ${
                      isSelected ? "text-black/60" : "text-white/40"
                    }`}
                  >
                    {pg.pagePath}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                    isSelected
                      ? configured > 0
                        ? "bg-[#00c864] text-black"
                        : "bg-black/15 text-black/80"
                      : configured > 0
                        ? "bg-[#00c864]/20 text-[#00c864]"
                        : "bg-white/5 text-white/40"
                  }`}
                >
                  {configured}/{pg.placements.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Active Page Banner & Slot Filters */}
      {activePageGroup && (
        <div className="rounded-2xl border border-white/10 bg-[#14141d] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white">
                  {activePageGroup.pageTitle}
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-white/5 text-white/70 border border-white/10">
                  pageSlug: &ldquo;{activePageGroup.pageSlug}&rdquo;
                </span>
                <a
                  href={activePageGroup.pagePath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#2d7aff]/15 text-[#2d7aff] border border-[#2d7aff]/30 hover:bg-[#2d7aff]/25 transition"
                >
                  <span>View Live Page</span>
                  <span>↗</span>
                </a>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Configure {activePageGroup.placements.length} media placeholders for{" "}
                <code className="text-white/75">{activePageGroup.pagePath}</code>. Mapped assets
                render automatically in the page body and inject into{" "}
                <code className="text-white/75">&lt;head&gt;</code> &amp;{" "}
                <code className="text-white/75">application/ld+json</code>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setSlotStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  slotStatusFilter === "all"
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                All ({activePageGroup.placements.length})
              </button>
              <button
                type="button"
                onClick={() => setSlotStatusFilter("configured")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  slotStatusFilter === "configured"
                    ? "bg-[#00c864]/20 text-[#00c864]"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                Mapped (
                {
                  activePageGroup.placements.filter((p) => p.isConfigured)
                    .length
                }
                )
              </button>
              <button
                type="button"
                onClick={() => setSlotStatusFilter("empty")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  slotStatusFilter === "empty"
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                Empty (
                {
                  activePageGroup.placements.filter((p) => !p.isConfigured)
                    .length
                }
                )
              </button>
            </div>

            <input
              type="search"
              value={slotSearch}
              onChange={(e) => setSlotSearch(e.target.value)}
              placeholder="Filter placeholders..."
              className="px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-[#ff2d78] w-48"
            />
          </div>
        </div>
      )}

      {/* Step 4: Placeholder Cards Grid */}
      {visibleSlots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleSlots.map((slot) => (
            <MediaPlacementCard
              key={slot.id}
              slot={slot}
              categoryLabel={activeCategoryLabel}
              onSaved={handleSlotSaved}
              onReset={handleSlotReset}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#14141d] p-12 text-center">
          <p className="text-sm text-white/60">
            No media placeholders match your current filter on this page.
          </p>
          <button
            type="button"
            onClick={() => {
              setSlotStatusFilter("all");
              setSlotSearch("");
            }}
            className="mt-3 px-4 py-2 rounded-lg bg-white/10 text-xs font-medium text-white hover:bg-white/15 transition"
          >
            Reset Slot Filters
          </button>
        </div>
      )}

      {/* Modal: Register New Custom Placeholder Key */}
      {showAddModal && activePageGroup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#161622] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Register Custom Placeholder Key
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Page: <span className="text-white/80">{activePageGroup.pageTitle}</span> (
                  <code className="text-[#ff2d78]">{activePageGroup.pageSlug}</code>)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterCustomSlot} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Placeholder Key <span className="text-[#ff2d78]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. hero_banner, about_team_video, feature_card_1"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-[#ff2d78]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Human-Readable Label <span className="text-[#ff2d78]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Hero Section Feature Video"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff2d78]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Default Media Type
                  </label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value as MediaType)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff2d78]"
                  >
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Aspect / Dimensions
                  </label>
                  <input
                    type="text"
                    value={newDimensions}
                    onChange={(e) => setNewDimensions(e.target.value)}
                    placeholder="1200 × 900"
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-[#ff2d78]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Default ALT Text
                </label>
                <input
                  type="text"
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  placeholder="Descriptive alt text for search bots & screen readers"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff2d78]"
                />
              </div>

              {addError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {addError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingSlot}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#ff2d78] text-white hover:bg-[#ff2d78]/90 transition disabled:opacity-50"
                >
                  {addingSlot ? "Registering..." : "Register Placeholder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

