"use client";

import React, { useState } from "react";
import { MessageSquare, Save, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from "lucide-react";
import type { ChatWidgetConfig } from "@/lib/chat-widget";
import { WhatsAppIcon } from "@/components/chat/WhatsAppIcon";

interface Props {
  initialConfig: ChatWidgetConfig;
}

export function ChatWidgetAdmin({ initialConfig }: Props) {
  const [config, setConfig] = useState<ChatWidgetConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/chat-widget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save settings");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update chat widget settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Global Site Widget
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-neutral-900 tracking-tight">
            WhatsApp &amp; Chat Widget Studio
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure the floating WhatsApp inquiry widget, 60% scroll trigger, and dynamic page message templates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-bx-pink text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? "Saving..." : saveSuccess ? "Saved Successfully" : "Save Changes"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Chat widget settings saved! Changes are live across all website pages.</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Activation Card */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-neutral-900">
                  Enable WhatsApp Widget
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  When enabled, the floating launcher automatically activates across public pages.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  WhatsApp Phone Number *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={config.whatsappNumber}
                    onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                    placeholder="+14244416042"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 font-mono">Include country code (e.g. +1...)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Scroll Trigger Threshold (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={config.scrollThreshold}
                    onChange={(e) => setConfig({ ...config, scrollThreshold: parseInt(e.target.value, 10) || 60 })}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200">
                    {config.scrollThreshold}%
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 font-mono">Default: 60% scroll display</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Widget Screen Position
                </label>
                <select
                  value={config.position}
                  onChange={(e) => setConfig({ ...config, position: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  <option value="bottom-right">Bottom Right (Recommended)</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Primary Theme Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor || "#25D366"}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-9 h-9 p-0.5 rounded-lg border border-neutral-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Popup Content & Agent Info */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-neutral-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Chat Popup &amp; Greetings Configuration
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Popup Header Title
                </label>
                <input
                  type="text"
                  value={config.headerTitle}
                  onChange={(e) => setConfig({ ...config, headerTitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Agent / Team Name
                </label>
                <input
                  type="text"
                  value={config.agentName}
                  onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Header Status Subtitle
              </label>
              <input
                type="text"
                value={config.headerSubtitle}
                onChange={(e) => setConfig({ ...config, headerSubtitle: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Welcome Message Bubble
              </label>
              <textarea
                rows={2}
                value={config.popupWelcome}
                onChange={(e) => setConfig({ ...config, popupWelcome: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-700">
                  Pre-filled Visitor Message Template
                </label>
                <span className="text-[11px] font-mono text-neutral-400">
                  Variables: &#123;pageTitle&#125;, &#123;pageUrl&#125;
                </span>
              </div>
              <textarea
                rows={3}
                value={config.defaultMessageTemplate}
                onChange={(e) => setConfig({ ...config, defaultMessageTemplate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none resize-none"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                When a visitor clicks the WhatsApp button from any service page, the template automatically substitutes the exact page name and full URL so you know where they arrived from.
              </p>
            </div>
          </div>
        </div>

        {/* Live Interactive Preview */}
        <div className="lg:col-span-5 sticky top-8 space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-between text-xs font-mono text-neutral-600">
            <span>LIVE INTERACTIVE PREVIEW</span>
            <span className="text-emerald-600 font-bold">● Active Spec</span>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden p-6 space-y-6">
            <p className="text-xs text-neutral-400 font-mono">Popup Card Preview (As Seen By Customer):</p>

            <div className="rounded-2xl border border-neutral-200 overflow-hidden shadow-md">
              {/* Preview Header */}
              <div
                className="p-4 text-white flex items-center gap-3"
                style={{ backgroundColor: config.primaryColor || "#25D366" }}
              >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-heading font-bold text-sm truncate">{config.headerTitle}</h4>
                  <p className="text-[10px] text-white/90 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
                    {config.headerSubtitle}
                  </p>
                </div>
              </div>

              {/* Preview Body */}
              <div className="p-4 space-y-3 bg-neutral-50/60">
                <div className="bg-white border border-neutral-200/80 rounded-xl p-3 shadow-2xs">
                  <div className="text-[10px] font-mono font-semibold uppercase text-neutral-400 mb-1">
                    {config.agentName}
                  </div>
                  <p className="text-xs text-neutral-700">{config.popupWelcome}</p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-600 italic">
                  &ldquo;{config.defaultMessageTemplate.replace(/{pageTitle}/g, "Ecommerce Website Design").replace(/{pageUrl}/g, "https://www.beetrix360.com/web-design/ecommerce")}&rdquo;
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl font-heading font-semibold text-xs text-white shadow-sm flex items-center justify-center gap-1.5 pointer-events-none"
                  style={{ backgroundColor: config.primaryColor || "#25D366" }}
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Start WhatsApp Chat</span>
                </button>
              </div>
            </div>

            {/* Launcher Button Preview */}
            <div className="pt-2">
              <p className="text-xs text-neutral-400 font-mono mb-3">Floating Launcher Button Preview:</p>
              <div className="p-4 rounded-2xl bg-neutral-900/5 flex items-center justify-center">
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-3 rounded-full text-white shadow-lg font-heading font-semibold text-xs"
                  style={{ backgroundColor: config.primaryColor || "#25D366" }}
                >
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                  <span>{config.buttonLabel || "Chat on WhatsApp"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

