"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  Settings,
  Layers,
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon,
  X,
  ExternalLink,
  Search,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Monitor,
} from "lucide-react";
import type {
  NavigationRecord,
  NavigationMenu,
  NavigationGroup,
  NavigationItem,
  NavigationProofCard,
  PageRecordV2,
  SiteSettings,
} from "@/lib/types";
import { computeGroupSpan, computeMenuTracks } from "@/lib/types";
import {
  validateNavigationRecord,
  calculateTopBarFit,
} from "@/lib/navigation-validation";
import {
  saveNavigationV2Action,
  restorePreviousNavigationAction,
} from "../../actions";

interface Props {
  initialNav: NavigationRecord;
  hasPreviousVersion: boolean;
  allPages: PageRecordV2[];
  siteSettings: SiteSettings;
  userRole: string;
  currentUser: string;
}

export function MenuStudioClient({
  initialNav,
  hasPreviousVersion: initialHasPrevious,
  allPages,
  siteSettings,
  userRole,
  currentUser,
}: Props) {
  const [nav, setNav] = useState<NavigationRecord>(initialNav);
  const [hasPrevious, setHasPrevious] = useState(initialHasPrevious);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"editor" | "preview-desktop" | "preview-mobile">("editor");
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Page picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    menuIndex: number;
    groupIndex: number;
    itemIndex?: number; // undefined if adding new item
  } | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  // Preview interactive state
  const [previewOpenDropdown, setPreviewOpenDropdown] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<number | null>(0);

  const isAdmin = userRole === "admin";

  // Fast page lookup maps
  const { pageById, pageByPath } = useMemo(() => {
    const byId = new Map<string, PageRecordV2>();
    const byPath = new Map<string, PageRecordV2>();
    for (const p of allPages) {
      if (p.id) byId.set(p.id, p);
      if (p.path) byPath.set(p.path, p);
    }
    return { pageById: byId, pageByPath: byPath };
  }, [allPages]);

  // Live validation
  const validation = useMemo(() => {
    return validateNavigationRecord(nav, allPages);
  }, [nav, allPages]);

  const activeMenu = nav.menus[activeMenuIndex] || nav.menus[0];

  // Top Bar measurement
  const topBarFit = useMemo(() => {
    return calculateTopBarFit(nav.menus);
  }, [nav.menus]);

  // Page Picker filtered results
  const filteredPages = useMemo(() => {
    if (!pickerSearch.trim()) return allPages.slice(0, 50);
    const q = pickerSearch.toLowerCase().trim();
    return allPages.filter(
      (p) =>
        p.path.toLowerCase().includes(q) ||
        p.h1.toLowerCase().includes(q) ||
        p.menuLabel.toLowerCase().includes(q) ||
        p.targetKeyword.toLowerCase().includes(q) ||
        p.division.toLowerCase().includes(q)
    );
  }, [allPages, pickerSearch]);

  // Save handler
  const handleSave = async () => {
    if (!isAdmin) {
      setStatusMessage({
        type: "error",
        text: "Forbidden: Only administrators can save navigation changes.",
      });
      return;
    }

    if (!validation.isValid) {
      setStatusMessage({
        type: "error",
        text: `Cannot save: ${validation.errors[0]}`,
      });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await saveNavigationV2Action(nav);
      setStatusMessage({
        type: "success",
        text: `Navigation changes saved successfully. Updated at ${new Date(
          res.timestamp || ""
        ).toLocaleTimeString()} by ${res.updatedBy || currentUser}.`,
      });
      setHasPrevious(true);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to save navigation.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Restore handler
  const handleRestore = async () => {
    if (!isAdmin) return;
    if (!confirm("Are you sure you want to restore the previous navigation version? Current changes will be archived.")) {
      return;
    }

    setRestoring(true);
    setStatusMessage(null);

    try {
      const res = await restorePreviousNavigationAction();
      setNav(res.nav);
      setStatusMessage({
        type: "success",
        text: `Previous navigation version restored successfully by ${res.updatedBy || currentUser}.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to restore previous navigation version.",
      });
    } finally {
      setRestoring(false);
    }
  };

  // Reorder menus
  const moveMenu = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= nav.menus.length) return;
    const updated = [...nav.menus];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setNav({ ...nav, menus: updated });
    setActiveMenuIndex(target);
  };

  // Menu property updates
  const updateMenu = (index: number, patch: Partial<NavigationMenu>) => {
    const updated = [...nav.menus];
    updated[index] = { ...updated[index], ...patch };
    setNav({ ...nav, menus: updated });
  };

  // Groups updates
  const addGroup = (menuIdx: number) => {
    const updated = [...nav.menus];
    const menu = { ...updated[menuIdx] };
    menu.groups = [
      ...menu.groups,
      {
        heading: "New Group",
        headingPath: null,
        items: [],
      },
    ];
    updated[menuIdx] = menu;
    setNav({ ...nav, menus: updated });
  };

  const removeGroup = (menuIdx: number, groupIdx: number) => {
    const updated = [...nav.menus];
    const menu = { ...updated[menuIdx] };
    menu.groups = menu.groups.filter((_, idx) => idx !== groupIdx);
    updated[menuIdx] = menu;
    setNav({ ...nav, menus: updated });
  };

  const moveGroup = (menuIdx: number, groupIdx: number, direction: "up" | "down") => {
    const menu = { ...nav.menus[menuIdx] };
    const target = direction === "up" ? groupIdx - 1 : groupIdx + 1;
    if (target < 0 || target >= menu.groups.length) return;
    const groups = [...menu.groups];
    const temp = groups[groupIdx];
    groups[groupIdx] = groups[target];
    groups[target] = temp;
    menu.groups = groups;
    const updated = [...nav.menus];
    updated[menuIdx] = menu;
    setNav({ ...nav, menus: updated });
  };

  const updateGroup = (
    menuIdx: number,
    groupIdx: number,
    patch: Partial<NavigationGroup>
  ) => {
    const menu = { ...nav.menus[menuIdx] };
    const groups = [...menu.groups];
    groups[groupIdx] = { ...groups[groupIdx], ...patch };
    menu.groups = groups;
    const updated = [...nav.menus];
    updated[menuIdx] = menu;
    setNav({ ...nav, menus: updated });
  };

  // Items updates
  const removeItem = (menuIdx: number, groupIdx: number, itemIdx: number) => {
    const menu = { ...nav.menus[menuIdx] };
    const groups = [...menu.groups];
    const group = { ...groups[groupIdx] };
    group.items = group.items.filter((_, idx) => idx !== itemIdx);
    groups[groupIdx] = group;
    menu.groups = groups;
    const updated = [...nav.menus];
    updated[menuIdx] = menu;
    setNav({ ...nav, menus: updated });
  };

  const moveItem = (
    menuIdx: number,
    groupIdx: number,
    itemIdx: number,
    direction: "up" | "down"
  ) => {
    const menu = { ...nav.menus[menuIdx] };
    const groups = [...menu.groups];
    const group = { ...groups[groupIdx] };
    const target = direction === "up" ? itemIdx - 1 : itemIdx + 1;
    if (target < 0 || target >= group.items.length) return;
    const items = [...group.items];
    const temp = items[itemIdx];
    items[itemIdx] = items[target];
    items[target] = temp;
    group.items = items;
    groups[groupIdx] = group;
    menu.groups = groups;
    const updated = [...nav.menus];
    updated[menuIdx] = menu;
    setNav({ ...nav, menus: updated });
  };

  // Page selection from Picker
  const handleSelectPageForPicker = (page: PageRecordV2) => {
    if (!pickerTarget) return;
    const { menuIndex, groupIndex, itemIndex } = pickerTarget;
    const menu = { ...nav.menus[menuIndex] };
    const groups = [...menu.groups];
    const group = { ...groups[groupIndex] };
    const items = [...group.items];

    const newItem: NavigationItem = {
      pageId: page.id,
      path: page.path,
      label: page.menuLabel || page.h1,
    };

    if (itemIndex !== undefined) {
      items[itemIndex] = newItem;
    } else {
      items.push(newItem);
    }

    group.items = items;
    groups[groupIndex] = group;
    menu.groups = groups;
    const updated = [...nav.menus];
    updated[menuIndex] = menu;
    setNav({ ...nav, menus: updated });

    setPickerOpen(false);
    setPickerTarget(null);
    setPickerSearch("");
  };

  // Proof card toggle
  const toggleProofCard = (menuIdx: number) => {
    const menu = { ...nav.menus[menuIdx] };
    if (menu.proofCard) {
      menu.proofCard = null;
    } else {
      menu.proofCard = {
        text: "Featured Client Transformation Result",
        cta: "Read Case Study",
        path: "/case-studies",
      };
    }
    const updated = [...nav.menus];
    updated[menuIdx] = menu;
    setNav({ ...nav, menus: updated });
  };

  // Bottom bar links
  const addBottomBarLink = (menuIdx: number) => {
    const menu = { ...nav.menus[menuIdx] };
    menu.bottomBarLinks = [
      ...(menu.bottomBarLinks || []),
      { label: "New Pricing Guide", path: "/pricing" },
    ];
    const updated = [...nav.menus];
    updated[menuIdx] = menu;
    setNav({ ...nav, menus: updated });
  };

  const removeBottomBarLink = (menuIdx: number, linkIdx: number) => {
    const menu = { ...nav.menus[menuIdx] };
    menu.bottomBarLinks = menu.bottomBarLinks.filter((_, idx) => idx !== linkIdx);
    const updated = [...nav.menus];
    updated[menuIdx] = menu;
    setNav({ ...nav, menus: updated });
  };

  const updateBottomBarLink = (
    menuIdx: number,
    linkIdx: number,
    patch: { label?: string; path?: string }
  ) => {
    const menu = { ...nav.menus[menuIdx] };
    const links = [...menu.bottomBarLinks];
    links[linkIdx] = { ...links[linkIdx], ...patch };
    menu.bottomBarLinks = links;
    const updated = [...nav.menus];
    updated[menuIdx] = menu;
    setNav({ ...nav, menus: updated });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-neutral-900">
              Navigation Menu Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bx-pink/10 text-bx-pink border border-bx-pink/20">
              Phase 6B
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Visual editor for header mega menus, group track spans, proof cards, and live 1440px / 390px preview.
            {nav.updatedAt && (
              <span className="ml-2 font-mono text-[11px] text-neutral-400">
                Last updated {new Date(nav.updatedAt).toLocaleString()}{" "}
                {nav.updatedBy ? `by ${nav.updatedBy}` : ""}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === "editor"
                  ? "bg-white text-neutral-900 shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview-desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === "preview-desktop"
                  ? "bg-white text-neutral-900 shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop 1440px
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview-mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === "preview-mobile"
                  ? "bg-white text-neutral-900 shadow-sm font-semibold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile 390px
            </button>
          </div>

          {/* Restore Previous Button */}
          {hasPrevious && (
            <button
              type="button"
              onClick={handleRestore}
              disabled={restoring || !isAdmin}
              title={isAdmin ? "Restore previous navigation version" : "Admin role required"}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-50 flex items-center gap-1.5 transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${restoring ? "animate-spin" : ""}`} />
              Restore Previous
            </button>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !validation.isValid || !isAdmin}
            title={
              !isAdmin
                ? "Admin role required to save"
                : !validation.isValid
                ? "Fix validation errors before saving"
                : "Save Navigation"
            }
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm ${
              validation.isValid && isAdmin
                ? "bg-bx-dark text-white hover:bg-neutral-800"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            <Save className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
            {saving ? "Saving..." : "Save Navigation"}
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium whitespace-pre-line">{statusMessage.text}</span>
        </div>
      )}

      {/* Live Validation Panel */}
      <div className="space-y-3">
        {/* Errors (Block Save) */}
        {validation.errors.length > 0 && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-950">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Validation Errors ({validation.errors.length}) — Save is Blocked</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-red-800">
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings (Informational) */}
        {validation.warnings.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Validation Warnings ({validation.warnings.length})</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-amber-800 max-h-36 overflow-y-auto">
              {validation.warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Validation */}
        {validation.isValid && validation.warnings.length === 0 && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All 7 mega menus strictly conform to the 5-track layout rule and item bounds.</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700">
              1440px Room: +{topBarFit.room}px (fits {topBarFit.estimatedMenuWidth + 72}px of {topBarFit.availableMiddle}px)
            </span>
          </div>
        )}
      </div>

      {/* MAIN VIEW: EDITOR */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Menu Tabs List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <span className="text-xs font-bold font-heading text-neutral-700 uppercase tracking-wider">
                Mega Menus ({nav.menus.length})
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                Order in Header
              </span>
            </div>

            <div className="space-y-2">
              {nav.menus.map((menu, idx) => {
                const tracks = computeMenuTracks(menu);
                const isSelected = activeMenuIndex === idx;
                const isTrackValid = tracks === 5;
                const displayLabel = menu.shortLabel || menu.label;

                return (
                  <div
                    key={menu.label || idx}
                    onClick={() => setActiveMenuIndex(idx)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "bg-white border-bx-pink shadow-md ring-1 ring-bx-pink/30"
                        : "bg-white/80 hover:bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-heading font-bold text-sm text-neutral-900 truncate">
                            {menu.label}
                          </span>
                        </div>
                        {menu.shortLabel && (
                          <div className="ml-7 text-[11px] text-neutral-500 font-medium">
                            Top-bar: <span className="font-mono text-neutral-700">{menu.shortLabel}</span>
                          </div>
                        )}
                        <div className="ml-7 mt-1.5 flex items-center gap-2 text-[11px] text-neutral-500">
                          <span>{menu.groups.length} groups</span>
                          <span>•</span>
                          <span>
                            {menu.groups.reduce((acc, g) => acc + g.items.length, 0)} links
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {/* Track Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            isTrackValid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {tracks} / 5 Tracks
                        </span>

                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => moveMenu(idx, "up")}
                            disabled={idx === 0}
                            title="Move menu up"
                            className="p-1 rounded hover:bg-neutral-100 text-neutral-500 disabled:opacity-20"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMenu(idx, "down")}
                            disabled={idx === nav.menus.length - 1}
                            title="Move menu down"
                            className="p-1 rounded hover:bg-neutral-100 text-neutral-500 disabled:opacity-20"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Global Navigation Settings Card */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4 mt-6">
              <div className="flex items-center gap-2 text-xs font-bold font-heading text-neutral-800">
                <Settings className="w-3.5 h-3.5 text-neutral-500" />
                <span>Global Header & Footer</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Header CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={nav.cta.label}
                    onChange={(e) =>
                      setNav({
                        ...nav,
                        cta: { ...nav.cta, label: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs focus:ring-1 focus:ring-bx-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Header CTA Target Path
                  </label>
                  <input
                    type="text"
                    value={nav.cta.path}
                    onChange={(e) =>
                      setNav({
                        ...nav,
                        cta: { ...nav.cta, path: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-1 focus:ring-bx-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                    Footer Legal Links
                  </label>
                  <div className="space-y-1.5">
                    {nav.footerLegal.map((path, lIdx) => (
                      <div key={lIdx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={path}
                          onChange={(e) => {
                            const updated = [...nav.footerLegal];
                            updated[lIdx] = e.target.value;
                            setNav({ ...nav, footerLegal: updated });
                          }}
                          className="flex-1 px-2 py-1 rounded border border-neutral-300 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = nav.footerLegal.filter((_, i) => i !== lIdx);
                            setNav({ ...nav, footerLegal: updated });
                          }}
                          className="p-1 text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setNav({
                          ...nav,
                          footerLegal: [...nav.footerLegal, "/privacy-policy"],
                        })
                      }
                      className="text-[11px] text-bx-pink hover:underline font-semibold flex items-center gap-1 mt-1"
                    >
                      <Plus className="w-3 h-3" /> Add legal link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Menu Inspector */}
          <div className="lg:col-span-8 space-y-6">
            {activeMenu ? (
              <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                {/* Menu Header Configuration */}
                <div className="space-y-4 pb-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold font-heading text-neutral-900">
                        {activeMenu.label}
                      </h2>
                      <p className="text-xs text-neutral-500">
                        Configure label, top-bar display, target division hub, proof card, and column tracks.
                      </p>
                    </div>

                    {/* Track Indicator */}
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold font-mono px-3 py-1 rounded-lg border inline-flex items-center gap-1.5 ${
                          computeMenuTracks(activeMenu) === 5
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-red-50 text-red-800 border-red-200"
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>{computeMenuTracks(activeMenu)} / 5 Column Tracks</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {activeMenu.proofCard ? "Proof card (1) + " : ""}
                        {activeMenu.groups.map((g, i) => `${computeGroupSpan(g)}`).join(" + ")} ={" "}
                        {computeMenuTracks(activeMenu)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Dropdown Label
                      </label>
                      <input
                        type="text"
                        value={activeMenu.label}
                        onChange={(e) =>
                          updateMenu(activeMenuIndex, { label: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:ring-1 focus:ring-bx-pink focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Short Label (Top-Bar Display)
                      </label>
                      <input
                        type="text"
                        placeholder={activeMenu.label}
                        value={activeMenu.shortLabel || ""}
                        onChange={(e) =>
                          updateMenu(activeMenuIndex, {
                            shortLabel: e.target.value || undefined,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium focus:ring-1 focus:ring-bx-pink focus:outline-none"
                      />
                      <span className="text-[10px] text-neutral-400 mt-1 block">
                        Keeps desktop bar compact at 1440px
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        &quot;View All&quot; Hub Path
                      </label>
                      <input
                        type="text"
                        value={activeMenu.viewAllPath}
                        onChange={(e) =>
                          updateMenu(activeMenuIndex, {
                            viewAllPath: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono focus:ring-1 focus:ring-bx-pink focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Groups Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-heading text-neutral-900">
                        Content Groups ({activeMenu.groups.length})
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Groups with $\le 6$ items take 1 track; 7–12 items take 2 tracks.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addGroup(activeMenuIndex)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Group
                    </button>
                  </div>

                  {activeMenu.groups.map((group, gIdx) => {
                    const span = computeGroupSpan(group);
                    const isExceeding = group.items.length > 12;

                    return (
                      <div
                        key={gIdx}
                        className={`p-4 rounded-xl border ${
                          isExceeding
                            ? "bg-red-50/30 border-red-300"
                            : "bg-neutral-50/60 border-neutral-200"
                        } space-y-3`}
                      >
                        {/* Group Header Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-neutral-700 mb-0.5">
                                Group Heading
                              </label>
                              <input
                                type="text"
                                value={group.heading}
                                onChange={(e) =>
                                  updateGroup(activeMenuIndex, gIdx, {
                                    heading: e.target.value,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium focus:ring-1 focus:ring-bx-pink focus:outline-none bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-neutral-700 mb-0.5">
                                Optional Heading Link Path
                              </label>
                              <input
                                type="text"
                                placeholder="/path or leave blank"
                                value={group.headingPath || ""}
                                onChange={(e) =>
                                  updateGroup(activeMenuIndex, gIdx, {
                                    headingPath: e.target.value.trim() || null,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-1 focus:ring-bx-pink focus:outline-none bg-white"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Track Span Badge */}
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                isExceeding
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : span === 2
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-neutral-100 text-neutral-700 border-neutral-200"
                              }`}
                            >
                              {group.items.length} links • {span} {span === 1 ? "track" : "tracks"}
                            </span>

                            {/* Reorder Group */}
                            <button
                              type="button"
                              onClick={() => moveGroup(activeMenuIndex, gIdx, "up")}
                              disabled={gIdx === 0}
                              className="p-1 rounded hover:bg-neutral-200 text-neutral-500 disabled:opacity-20"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveGroup(activeMenuIndex, gIdx, "down")}
                              disabled={gIdx === activeMenu.groups.length - 1}
                              className="p-1 rounded hover:bg-neutral-200 text-neutral-500 disabled:opacity-20"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Group */}
                            <button
                              type="button"
                              onClick={() => removeGroup(activeMenuIndex, gIdx)}
                              className="p-1 rounded hover:bg-red-100 text-neutral-400 hover:text-red-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-600">
                            <span>Navigation Links</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPickerTarget({
                                  menuIndex: activeMenuIndex,
                                  groupIndex: gIdx,
                                });
                                setPickerOpen(true);
                              }}
                              className="text-bx-pink hover:underline flex items-center gap-1 font-bold"
                            >
                              <Plus className="w-3 h-3" /> Add Page Link
                            </button>
                          </div>

                          {group.items.length === 0 ? (
                            <p className="text-xs text-neutral-400 italic py-2">
                              No links in this group yet. Click &quot;Add Page Link&quot; to pick from the page store.
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {group.items.map((item, itIdx) => {
                                if ("dynamic" in item) return null;
                                const page = pageById.get(item.pageId) || pageByPath.get(item.path || "");
                                const isUnpublished = page && !page.published;
                                const isNoIndex = page && page.seo?.robots?.index === false;

                                return (
                                  <div
                                    key={item.pageId || itIdx}
                                    className="p-2 bg-white rounded-lg border border-neutral-200 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="min-w-0 flex items-center gap-2">
                                      <span className="w-4 text-[10px] text-neutral-400 font-mono text-center">
                                        {itIdx + 1}
                                      </span>
                                      <div className="truncate">
                                        <span className="font-semibold text-neutral-800">
                                          {item.label || page?.menuLabel || page?.h1 || "Untitled Page"}
                                        </span>
                                        <span className="ml-2 font-mono text-[11px] text-neutral-400">
                                          {item.path || page?.path}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {/* Status Badges */}
                                      {isUnpublished && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                                          Draft
                                        </span>
                                      )}
                                      {isNoIndex && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                          noindex
                                        </span>
                                      )}

                                      {/* Swap Page Picker */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPickerTarget({
                                            menuIndex: activeMenuIndex,
                                            groupIndex: gIdx,
                                            itemIndex: itIdx,
                                          });
                                          setPickerOpen(true);
                                        }}
                                        title="Change linked page"
                                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                                      >
                                        <Search className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Reorder Item */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          moveItem(activeMenuIndex, gIdx, itIdx, "up")
                                        }
                                        disabled={itIdx === 0}
                                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-20"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          moveItem(activeMenuIndex, gIdx, itIdx, "down")
                                        }
                                        disabled={itIdx === group.items.length - 1}
                                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-20"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>

                                      {/* Delete Item */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeItem(activeMenuIndex, gIdx, itIdx)
                                        }
                                        className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Proof Card Configuration */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold font-heading text-neutral-900 uppercase tracking-wider">
                        Proof Card (Occupies 1 Column Track)
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Highlighted case study or client result featured on the right side of the dropdown.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleProofCard(activeMenuIndex)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        activeMenu.proofCard
                          ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          : "bg-bx-dark text-white hover:bg-neutral-800"
                      }`}
                    >
                      {activeMenu.proofCard ? "Remove Proof Card" : "+ Add Proof Card"}
                    </button>
                  </div>

                  {activeMenu.proofCard && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                          Proof Card Headline Text
                        </label>
                        <input
                          type="text"
                          value={activeMenu.proofCard.text}
                          onChange={(e) =>
                            updateMenu(activeMenuIndex, {
                              proofCard: {
                                ...activeMenu.proofCard!,
                                text: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium focus:ring-1 focus:ring-bx-pink focus:outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                          CTA Button Label
                        </label>
                        <input
                          type="text"
                          value={activeMenu.proofCard.cta}
                          onChange={(e) =>
                            updateMenu(activeMenuIndex, {
                              proofCard: {
                                ...activeMenu.proofCard!,
                                cta: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-medium focus:ring-1 focus:ring-bx-pink focus:outline-none bg-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                          Target URL Path
                        </label>
                        <input
                          type="text"
                          value={activeMenu.proofCard.path}
                          onChange={(e) =>
                            updateMenu(activeMenuIndex, {
                              proofCard: {
                                ...activeMenu.proofCard!,
                                path: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono focus:ring-1 focus:ring-bx-pink focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Bar Links Configuration */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold font-heading text-neutral-900 uppercase tracking-wider">
                        Bottom Bar Links ({activeMenu.bottomBarLinks?.length || 0})
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Horizontal links in the dropdown footer (e.g., pricing guides, calculators).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addBottomBarLink(activeMenuIndex)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" /> Add Link
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(activeMenu.bottomBarLinks || []).map((bLink, bIdx) => (
                      <div
                        key={bIdx}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-white p-2 rounded-lg border border-neutral-200"
                      >
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Link Label"
                            value={bLink.label}
                            onChange={(e) =>
                              updateBottomBarLink(activeMenuIndex, bIdx, {
                                label: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 text-xs rounded border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-bx-pink"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="/path"
                            value={bLink.path}
                            onChange={(e) =>
                              updateBottomBarLink(activeMenuIndex, bIdx, {
                                path: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 text-xs font-mono rounded border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-bx-pink"
                          />
                        </div>
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() =>
                              removeBottomBarLink(activeMenuIndex, bIdx)
                            }
                            className="p-1 text-neutral-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* VIEW: LIVE DESKTOP PREVIEW (1440px) */}
      {activeTab === "preview-desktop" && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-900 text-white rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4 text-bx-pink" />
              <span className="font-semibold font-heading">
                Interactive Public Header Preview (1440px Desktop Viewport)
              </span>
            </div>
            <div className="font-mono text-[11px] text-neutral-400">
              Middle space available: {topBarFit.availableMiddle}px • Estimated nav width: {topBarFit.estimatedMenuWidth + 72}px
            </div>
          </div>

          <div className="border border-neutral-300 rounded-2xl shadow-xl overflow-x-auto bg-neutral-100 p-6 min-h-[500px]">
            {/* 1440px Simulated Frame */}
            <div className="w-[1440px] mx-auto bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden relative min-h-[480px]">
              {/* Header Bar */}
              <div className="h-[76px] px-10 grid grid-cols-[auto_1fr_auto] items-center border-b border-neutral-100 bg-white/95">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <span className="font-heading font-black text-xl tracking-tight text-neutral-950">
                    Beetrix<span className="text-bx-pink">360</span>
                  </span>
                </div>

                {/* Middle Menu Row */}
                <div className="flex justify-center items-center px-8">
                  <div className="flex items-center gap-1.5 flex-nowrap">
                    {nav.menus.map((m, mIdx) => {
                      const isOpen = previewOpenDropdown === mIdx;
                      const displayLabel = m.shortLabel || m.label;

                      return (
                        <button
                          key={m.label || mIdx}
                          type="button"
                          onClick={() =>
                            setPreviewOpenDropdown(isOpen ? null : mIdx)
                          }
                          className={`px-3 py-2 text-sm font-semibold tracking-tight rounded-lg flex items-center gap-1 transition ${
                            isOpen
                              ? "text-bx-pink bg-bx-pink/5"
                              : "text-neutral-800 hover:text-bx-pink hover:bg-neutral-50"
                          }`}
                        >
                          <span>{displayLabel}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              isOpen ? "rotate-180 text-bx-pink" : "text-neutral-400"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Header CTA */}
                <div>
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-bx-pink text-white shadow-sm"
                  >
                    {nav.cta.label}
                  </button>
                </div>
              </div>

              {/* Active Dropdown Panel Preview */}
              {previewOpenDropdown !== null && nav.menus[previewOpenDropdown] && (
                <div className="border-b border-neutral-200 bg-white shadow-2xl p-8">
                  <div className="max-w-[1360px] mx-auto">
                    {/* Header info */}
                    <div className="pb-4 mb-6 border-b border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-bold text-lg text-neutral-950">
                          {nav.menus[previewOpenDropdown].label}
                        </span>
                        <span className="text-xs text-neutral-400">
                          5-Track Standardized Layout
                        </span>
                      </div>
                      <Link
                        href={nav.menus[previewOpenDropdown].viewAllPath}
                        className="text-xs font-bold text-bx-pink hover:underline flex items-center gap-1"
                      >
                        View all in {nav.menus[previewOpenDropdown].label} <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* 5 Column Grid */}
                    <div className="grid grid-cols-5 gap-8 items-start">
                      {nav.menus[previewOpenDropdown].groups.map((group, gIdx) => {
                        const span = computeGroupSpan(group);
                        const isSpan2 = span === 2;

                        return (
                          <div
                            key={gIdx}
                            className={isSpan2 ? "col-span-2 space-y-4" : "col-span-1 space-y-4"}
                          >
                            <div className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-900 pb-2 border-b border-neutral-100">
                              {group.heading}
                            </div>

                            {isSpan2 ? (
                              <div className="grid grid-cols-2 gap-6">
                                <ul className="space-y-2 list-none p-0 m-0">
                                  {group.items
                                    .slice(0, Math.ceil(group.items.length / 2))
                                    .map((it, idx) => {
                                      if ("dynamic" in it) return null;
                                      return (
                                        <li key={idx}>
                                          <span className="text-xs text-neutral-600 hover:text-bx-pink block font-medium cursor-pointer">
                                            {it.label}
                                          </span>
                                        </li>
                                      );
                                    })}
                                </ul>
                                <ul className="space-y-2 list-none p-0 m-0">
                                  {group.items
                                    .slice(Math.ceil(group.items.length / 2))
                                    .map((it, idx) => {
                                      if ("dynamic" in it) return null;
                                      return (
                                        <li key={idx}>
                                          <span className="text-xs text-neutral-600 hover:text-bx-pink block font-medium cursor-pointer">
                                            {it.label}
                                          </span>
                                        </li>
                                      );
                                    })}
                                </ul>
                              </div>
                            ) : (
                              <ul className="space-y-2 list-none p-0 m-0">
                                {group.items.map((it, idx) => {
                                  if ("dynamic" in it) return null;
                                  return (
                                    <li key={idx}>
                                      <span className="text-xs text-neutral-600 hover:text-bx-pink block font-medium cursor-pointer">
                                        {it.label}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        );
                      })}

                      {/* Optional Proof Card (1 track) */}
                      {nav.menus[previewOpenDropdown].proofCard && (
                        <div className="col-span-1 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 flex flex-col justify-between shadow-md min-h-[220px]">
                          <div>
                            <div className="w-8 h-8 rounded-lg bg-bx-pink/20 text-bx-pink flex items-center justify-center mb-3">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                              {nav.menus[previewOpenDropdown].proofCard!.text}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/10">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-bx-pink">
                              {nav.menus[previewOpenDropdown].proofCard!.cta}{" "}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Bar */}
                    {nav.menus[previewOpenDropdown].bottomBarLinks?.length > 0 && (
                      <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center gap-6 text-xs text-neutral-500 font-medium">
                        {nav.menus[previewOpenDropdown].bottomBarLinks.map(
                          (bLink, bIdx) => (
                            <span
                              key={bIdx}
                              className="hover:text-bx-pink cursor-pointer"
                            >
                              {bLink.label}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: LIVE MOBILE PREVIEW (390px) */}
      {activeTab === "preview-mobile" && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-900 text-white rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-bx-pink" />
              <span className="font-semibold font-heading">
                Interactive Public Drawer Preview (390px Mobile Viewport)
              </span>
            </div>
            <div className="font-mono text-[11px] text-neutral-400">
              iPhone 14 / Standard Mobile Canvas
            </div>
          </div>

          <div className="flex justify-center p-6 bg-neutral-100 rounded-2xl">
            {/* 390px Device Frame */}
            <div className="w-[390px] bg-white rounded-[32px] shadow-2xl border-4 border-neutral-800 overflow-hidden min-h-[640px] flex flex-col">
              {/* Top Notch / Header Bar */}
              <div className="h-[64px] px-5 flex items-center justify-between border-b border-neutral-100 bg-white shrink-0">
                <span className="font-heading font-black text-lg tracking-tight text-neutral-950">
                  Beetrix<span className="text-bx-pink">360</span>
                </span>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-bx-pink text-white">
                    Proposal
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-1.5 text-neutral-800 hover:text-bx-pink"
                  >
                    {mobileMenuOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <MenuIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              {mobileMenuOpen ? (
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
                  <div className="space-y-2 pb-6">
                    {nav.menus.map((menu, mIdx) => {
                      const isAccordionOpen = mobileAccordion === mIdx;

                      return (
                        <div
                          key={menu.label || mIdx}
                          className="border-b border-neutral-100 pb-2"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setMobileAccordion(isAccordionOpen ? null : mIdx)
                            }
                            className="w-full flex items-center justify-between py-2 text-left font-heading font-bold text-sm text-neutral-900"
                          >
                            <span>{menu.label}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-neutral-400 transition-transform ${
                                isAccordionOpen ? "rotate-180 text-bx-pink" : ""
                              }`}
                            />
                          </button>

                          {isAccordionOpen && (
                            <div className="pt-2 pb-2 pl-2 space-y-4">
                              {menu.groups.map((group, gIdx) => (
                                <div key={gIdx} className="space-y-1.5">
                                  <span className="font-heading font-semibold text-[11px] uppercase tracking-wider text-neutral-400 block">
                                    {group.heading}
                                  </span>
                                  <ul className="space-y-1 list-none p-0 m-0">
                                    {group.items.map((it, itIdx) => {
                                      if ("dynamic" in it) return null;
                                      return (
                                        <li key={itIdx}>
                                          <span className="text-xs text-neutral-700 block py-0.5">
                                            {it.label}
                                          </span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              ))}

                              <div className="pt-2 border-t border-neutral-100">
                                <span className="text-xs font-bold text-bx-pink block">
                                  View all in {menu.label} →
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-neutral-400">
                  Tap the hamburger icon above to open and test the mobile drawer navigation.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAGE PICKER MODAL */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-base font-bold font-heading text-neutral-900">
                  Select Page from Store
                </h3>
                <p className="text-xs text-neutral-500">
                  Links are stored strictly by unique Page ID to preserve integrity across URL renames.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPickerOpen(false);
                  setPickerTarget(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by path, title, keyword or division..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-bx-pink focus:outline-none"
              />
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPages.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-8">
                  No matching pages found in the store.
                </p>
              ) : (
                filteredPages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => handleSelectPageForPicker(page)}
                    className="p-3 rounded-xl border border-neutral-200 hover:border-bx-pink hover:bg-bx-pink/5 cursor-pointer transition flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-xs text-neutral-900 truncate">
                          {page.menuLabel || page.h1}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-neutral-500 bg-neutral-100">
                          {page.division}
                        </span>
                        {!page.published && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-600">
                            Draft
                          </span>
                        )}
                        {page.seo?.robots?.index === false && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">
                            noindex
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                        {page.path}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-bx-pink hover:text-white transition shrink-0"
                    >
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
