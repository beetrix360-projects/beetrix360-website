"use client";

import React, { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Menu,
  Columns,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { NavigationConfig, NavItem, NavColumn } from "@/lib/navigation";
import { saveNavigationAction } from "../../actions";

interface Props {
  initialNav: NavigationConfig;
  userRole: string;
}

export function MenuArrangementClient({ initialNav, userRole }: Props) {
  const [nav, setNav] = useState<NavigationConfig>(initialNav);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isAdmin = userRole === "admin";

  const moveTab = (index: number, direction: "up" | "down") => {
    const newItems = [...nav.header];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[target];
    newItems[target] = temp;

    newItems.forEach((item, i) => {
      item.order = i + 1;
    });

    setNav({ ...nav, header: newItems });
    setSelectedItemIndex(target);
  };

  const addTab = () => {
    const newItem: NavItem = {
      id: `nav_${Date.now()}`,
      label: "New Menu Tab",
      href: "/custom",
      type: "link",
      order: nav.header.length + 1,
    };
    setNav({ ...nav, header: [...nav.header, newItem] });
    setSelectedItemIndex(nav.header.length);
  };

  const removeTab = (index: number) => {
    if (nav.header.length <= 1) return;
    const newItems = nav.header.filter((_, i) => i !== index);
    newItems.forEach((item, i) => {
      item.order = i + 1;
    });
    setNav({ ...nav, header: newItems });
    setSelectedItemIndex(Math.max(0, index - 1));
  };

  const handleSave = async () => {
    if (!isAdmin) {
      setStatusMessage({ type: "error", text: "Forbidden: Only Full Administrators can modify navigation arrangements." });
      return;
    }
    setSaving(true);
    setStatusMessage(null);
    try {
      await saveNavigationAction(nav);
      setStatusMessage({ type: "success", text: "Navigation arrangement successfully saved and live updated!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to save navigation arrangement." });
    } finally {
      setSaving(false);
    }
  };

  const currentItem = nav.header[selectedItemIndex];

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs sticky top-20 z-10">
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <div className="text-xs px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-2 font-mono font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Read-Only Mode: Full Admin role required to rearrange navigation.</span>
            </div>
          )}
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
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Inspect Header
          </a>

          <button
            onClick={handleSave}
            disabled={saving || !isAdmin}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-bx-pink text-white font-semibold text-xs hover:opacity-95 active:scale-[0.98] transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Menu Arrangement</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Reorderable Header Tabs (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-600 font-semibold">
              <Menu className="w-4 h-4 text-amber-600" />
              <span>Header Tabs Ordering</span>
            </div>
            {isAdmin && (
              <button
                onClick={addTab}
                className="text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tab
              </button>
            )}
          </div>

          <div className="space-y-2">
            {nav.header.map((item, idx) => {
              const isSelected = selectedItemIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemIndex(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-amber-50/80 border-amber-300 shadow-xs"
                      : "bg-neutral-50/50 border-neutral-200/70 hover:bg-neutral-100/70 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">{item.label}</p>
                      <p className="text-[10px] font-mono text-neutral-500 truncate">{item.href}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white text-neutral-600 border border-neutral-200 mr-1">
                      {item.type}
                    </span>
                    <button
                      type="button"
                      disabled={idx === 0 || !isAdmin}
                      onClick={() => moveTab(idx, "up")}
                      className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === nav.header.length - 1 || !isAdmin}
                      onClick={() => moveTab(idx, "down")}
                      className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => removeTab(idx)}
                        className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 cursor-pointer ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Tab Details & Columns / Links Editor (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6">
          {currentItem ? (
            <>
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 font-heading">
                  Edit Tab: &quot;{currentItem.label}&quot;
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Configure tab target, presentation type, and nested mega-menu subcategories.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Display Label
                  </label>
                  <input
                    type="text"
                    value={currentItem.label}
                    disabled={!isAdmin}
                    onChange={(e) => {
                      const newItems = [...nav.header];
                      newItems[selectedItemIndex].label = e.target.value;
                      setNav({ ...nav, header: newItems });
                    }}
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Target URL / Route
                  </label>
                  <input
                    type="text"
                    value={currentItem.href}
                    disabled={!isAdmin}
                    onChange={(e) => {
                      const newItems = [...nav.header];
                      newItems[selectedItemIndex].href = e.target.value;
                      setNav({ ...nav, header: newItems });
                    }}
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:bg-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                  Menu Interaction Style
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="menuType"
                      checked={currentItem.type === "mega"}
                      disabled={!isAdmin}
                      onChange={() => {
                        const newItems = [...nav.header];
                        newItems[selectedItemIndex].type = "mega";
                        if (!newItems[selectedItemIndex].columns) {
                          newItems[selectedItemIndex].columns = [];
                        }
                        setNav({ ...nav, header: newItems });
                      }}
                      className="accent-amber-500"
                    />
                    <span>Full-Width Mega Menu (Multi-Column)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="menuType"
                      checked={currentItem.type === "link"}
                      disabled={!isAdmin}
                      onChange={() => {
                        const newItems = [...nav.header];
                        newItems[selectedItemIndex].type = "link";
                        setNav({ ...nav, header: newItems });
                      }}
                      className="accent-amber-500"
                    />
                    <span>Direct Single Link</span>
                  </label>
                </div>
              </div>

              {/* Mega Menu Columns Editor */}
              {currentItem.type === "mega" && (
                <div className="space-y-4 pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-700 uppercase font-semibold">
                      <Columns className="w-4 h-4 text-amber-600" />
                      <span>Mega Menu Columns ({currentItem.columns?.length || 0})</span>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          const newCol: NavColumn = {
                            id: `col_${Date.now()}`,
                            title: "New Category Column",
                            accent: "pink",
                            hubHref: "/services",
                            links: [{ id: `l_${Date.now()}`, name: "Example Service Link", href: "/example" }],
                          };
                          const newItems = [...nav.header];
                          newItems[selectedItemIndex].columns = [
                            ...(newItems[selectedItemIndex].columns || []),
                            newCol,
                          ];
                          setNav({ ...nav, header: newItems });
                        }}
                        className="text-xs px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Column
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    {(currentItem.columns || []).map((col, cIdx) => (
                      <div key={col.id} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-amber-700">
                            Column #{cIdx + 1}: {col.title}
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...nav.header];
                                newItems[selectedItemIndex].columns = (
                                  newItems[selectedItemIndex].columns || []
                                ).filter((_, i) => i !== cIdx);
                                setNav({ ...nav, header: newItems });
                              }}
                              className="text-red-500 hover:text-red-700 text-[10px]"
                            >
                              Remove Column
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Column Heading"
                            value={col.title}
                            disabled={!isAdmin}
                            onChange={(e) => {
                              const newItems = [...nav.header];
                              newItems[selectedItemIndex].columns![cIdx].title = e.target.value;
                              setNav({ ...nav, header: newItems });
                            }}
                            className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Hub Link (e.g. /seo-services)"
                            value={col.hubHref || ""}
                            disabled={!isAdmin}
                            onChange={(e) => {
                              const newItems = [...nav.header];
                              newItems[selectedItemIndex].columns![cIdx].hubHref = e.target.value;
                              setNav({ ...nav, header: newItems });
                            }}
                            className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs font-mono"
                          />
                        </div>

                        {/* Child Links */}
                        <div className="space-y-2 pt-2 border-t border-neutral-200">
                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                            <span>Child Links ({col.links.length})</span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = [...nav.header];
                                  newItems[selectedItemIndex].columns![cIdx].links.push({
                                    id: `link_${Date.now()}`,
                                    name: "New Sub-Service",
                                    href: "/services/sub",
                                  });
                                  setNav({ ...nav, header: newItems });
                                }}
                                className="text-amber-600 hover:underline font-medium"
                              >
                                + Add Link
                              </button>
                            )}
                          </div>

                          {col.links.map((link, lIdx) => (
                            <div key={link.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Link Name"
                                value={link.name}
                                disabled={!isAdmin}
                                onChange={(e) => {
                                  const newItems = [...nav.header];
                                  newItems[selectedItemIndex].columns![cIdx].links[lIdx].name = e.target.value;
                                  setNav({ ...nav, header: newItems });
                                }}
                                className="flex-1 px-2.5 py-1 bg-white border border-neutral-300 rounded text-neutral-900 text-xs"
                              />
                              <input
                                type="text"
                                placeholder="/path"
                                value={link.href}
                                disabled={!isAdmin}
                                onChange={(e) => {
                                  const newItems = [...nav.header];
                                  newItems[selectedItemIndex].columns![cIdx].links[lIdx].href = e.target.value;
                                  setNav({ ...nav, header: newItems });
                                }}
                                className="flex-1 px-2.5 py-1 bg-white border border-neutral-300 rounded text-neutral-900 text-xs font-mono"
                              />
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItems = [...nav.header];
                                    newItems[selectedItemIndex].columns![cIdx].links = newItems[
                                      selectedItemIndex
                                    ].columns![cIdx].links.filter((_, i) => i !== lIdx);
                                    setNav({ ...nav, header: newItems });
                                  }}
                                  className="text-neutral-400 hover:text-red-500 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-neutral-400 text-xs">
              Select a navigation tab on the left to edit its layout.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
