"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Tag,
  CheckCircle2,
  AlertCircle,
  Save,
  Code2,
  Plus,
  Trash2,
  Activity,
  ShieldCheck,
  Zap,
  Send,
} from "lucide-react";
import type { AnalyticsSettings, CustomConversionEvent } from "@/lib/types";
import { saveAnalyticsSettingsAction } from "../../actions";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

interface Props {
  initialSettings: AnalyticsSettings;
  userRole: string;
}

export function AnalyticsStudioClient({ initialSettings, userRole }: Props) {
  const [settings, setSettings] = useState<AnalyticsSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testLog, setTestLog] = useState<string[]>([]);

  // New custom event inputs
  const [newEvtName, setNewEvtName] = useState("");
  const [newEvtCode, setNewEvtCode] = useState("");
  const [newEvtSelector, setNewEvtSelector] = useState("");

  const canEdit = ["admin", "editor", "moderator"].includes(userRole);

  const isGaValid = !settings.gaMeasurementId || /^G-[A-Z0-9]+$/i.test(settings.gaMeasurementId.trim());
  const isGtmValid = !settings.gtmContainerId || /^GTM-[A-Z0-9]+$/i.test(settings.gtmContainerId.trim());

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canEdit) return;

    if (!isGaValid) {
      setStatusMessage({ type: "error", text: "Invalid GA4 Measurement ID format. Expected format: G-XXXXXXXXXX" });
      return;
    }
    if (!isGtmValid) {
      setStatusMessage({ type: "error", text: "Invalid GTM Container ID format. Expected format: GTM-XXXXXXX" });
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      const cleaned: AnalyticsSettings = {
        ...settings,
        gaMeasurementId: settings.gaMeasurementId.trim().toUpperCase(),
        gtmContainerId: settings.gtmContainerId.trim().toUpperCase(),
      };
      await saveAnalyticsSettingsAction(cleaned);
      setSettings(cleaned);
      setStatusMessage({
        type: "success",
        text: `Google Analytics & Tag Manager settings saved & live at ${new Date().toLocaleTimeString()}!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to save analytics configuration.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomEvent = () => {
    if (!newEvtName.trim() || !newEvtCode.trim()) return;
    const item: CustomConversionEvent = {
      id: `evt-${Date.now()}`,
      name: newEvtName.trim(),
      eventName: newEvtCode.trim().replace(/\s+/g, "_").toLowerCase(),
      triggerSelector: newEvtSelector.trim() || undefined,
      enabled: true,
    };
    setSettings({
      ...settings,
      customConversionEvents: [...(settings.customConversionEvents || []), item],
    });
    setNewEvtName("");
    setNewEvtCode("");
    setNewEvtSelector("");
  };

  const handleRemoveCustomEvent = (id: string) => {
    setSettings({
      ...settings,
      customConversionEvents: (settings.customConversionEvents || []).filter((e) => e.id !== id),
    });
  };

  const handleToggleCustomEvent = (id: string) => {
    setSettings({
      ...settings,
      customConversionEvents: (settings.customConversionEvents || []).map((e) =>
        e.id === id ? { ...e, enabled: !e.enabled } : e
      ),
    });
  };

  const handleFireTestEvent = (eventName: string, label: string) => {
    trackAnalyticsEvent(eventName, {
      test_mode: true,
      event_label: label,
      timestamp: new Date().toISOString(),
    });
    const entry = `[${new Date().toLocaleTimeString()}] Pushed -> dataLayer.push({ event: "${eventName}", event_label: "${label}", test_mode: true })`;
    setTestLog((prev) => [entry, ...prev.slice(0, 7)]);
  };

  const gaIdPreview = settings.gaMeasurementId.trim() || "G-XXXXXXXXXX";
  const gtmIdPreview = settings.gtmContainerId.trim() || "GTM-XXXXXXX";

  const generatedSnippetPreview = `<!-- 1. Google Consent Mode v2 Default -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': '${settings.consentModeDefault}',
    'ad_user_data': '${settings.consentModeDefault}',
    'ad_personalization': '${settings.consentModeDefault}',
    'analytics_storage': '${settings.consentModeDefault}'
  });
</script>

${
  settings.gtmEnabled
    ? `<!-- 2. Google Tag Manager (${gtmIdPreview}) -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmIdPreview}');</script>

<!-- GTM <noscript> Fallback in <body> -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmIdPreview}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
    : `<!-- 2. Google Tag Manager (Disabled) -->`
}

${
  settings.gaEnabled
    ? `<!-- 3. Google Analytics 4 (${gaIdPreview}) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaIdPreview}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaIdPreview}', {
    page_path: window.location.pathname,
    anonymize_ip: ${settings.anonymizeIp ? "true" : "false"}
  });
</script>`
    : `<!-- 3. Google Analytics 4 Direct Script (Disabled) -->`
}`;

  return (
    <div className="space-y-6">
      {/* Top Sticky Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs sticky top-20 z-10">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                settings.gaEnabled && settings.gaMeasurementId ? "bg-emerald-500" : "bg-neutral-300"
              }`}
            />
            <span className="font-semibold text-neutral-700">
              GA4: {settings.gaEnabled && settings.gaMeasurementId ? settings.gaMeasurementId : "Inactive"}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                settings.gtmEnabled && settings.gtmContainerId ? "bg-blue-500" : "bg-neutral-300"
              }`}
            />
            <span className="font-semibold text-neutral-700">
              GTM: {settings.gtmEnabled && settings.gtmContainerId ? settings.gtmContainerId : "Inactive"}
            </span>
          </div>

          {statusMessage && (
            <div
              className={`text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono font-medium ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving || !canEdit}
          className="px-5 py-2.5 bg-bx-pink hover:bg-pink-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Configuration..." : "Save & Publish Analytics"}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: GA4 & GTM Credentials + Event Toggles (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Google Analytics 4 (GA4) */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 font-heading">
                    Google Analytics 4 (GA4) Module
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Direct gtag.js measurement stream for pageviews, traffic attribution, and conversions.
                  </p>
                </div>
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.gaEnabled}
                  disabled={!canEdit}
                  onChange={(e) => setSettings({ ...settings, gaEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all relative peer-checked:bg-emerald-600" />
                <span className="text-xs font-mono font-semibold text-neutral-700">
                  {settings.gaEnabled ? "ENABLED" : "DISABLED"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 mb-1.5 font-semibold">
                  GA4 Measurement ID
                </label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.gaMeasurementId}
                  disabled={!canEdit}
                  onChange={(e) => setSettings({ ...settings, gaMeasurementId: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-neutral-900 text-xs font-mono focus:bg-white focus:outline-none ${
                    isGaValid ? "border-neutral-300 focus:border-orange-500" : "border-red-400 bg-red-50/30"
                  }`}
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Found in Google Analytics Admin &rarr; Data Streams &rarr; Web Stream Details.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 mb-1.5 font-semibold">
                  Consent Mode v2 Default
                </label>
                <select
                  value={settings.consentModeDefault}
                  disabled={!canEdit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      consentModeDefault: e.target.value as "granted" | "denied",
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:bg-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="granted">granted (Standard global tracking)</option>
                  <option value="denied">denied (Strict GDPR wait-for-banner)</option>
                </select>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Controls default `analytics_storage` and `ad_storage` signals.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-2.5 text-xs text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.anonymizeIp}
                  disabled={!canEdit}
                  onChange={(e) => setSettings({ ...settings, anonymizeIp: e.target.checked })}
                  className="rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="font-medium">Enable IP Anonymization (`anonymize_ip: true`)</span>
              </label>

              <span className="text-[11px] font-mono text-neutral-400">
                Env fallback: NEXT_PUBLIC_GA_MEASUREMENT_ID
              </span>
            </div>
          </div>

          {/* Card 2: Google Tag Manager (GTM) */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 font-heading">
                    Google Tag Manager (GTM) Container
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Injects GTM head script, body `&lt;noscript&gt;` iframe, and pushes structured `dataLayer` events.
                  </p>
                </div>
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.gtmEnabled}
                  disabled={!canEdit}
                  onChange={(e) => setSettings({ ...settings, gtmEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all relative peer-checked:bg-blue-600" />
                <span className="text-xs font-mono font-semibold text-neutral-700">
                  {settings.gtmEnabled ? "ENABLED" : "DISABLED"}
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-neutral-600 font-semibold">
                GTM Container ID
              </label>
              <input
                type="text"
                placeholder="GTM-XXXXXXX"
                value={settings.gtmContainerId}
                disabled={!canEdit}
                onChange={(e) => setSettings({ ...settings, gtmContainerId: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl text-neutral-900 text-xs font-mono focus:bg-white focus:outline-none ${
                  isGtmValid ? "border-neutral-300 focus:border-blue-600" : "border-red-400 bg-red-50/30"
                }`}
              />
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <span>Found in Google Tag Manager Workspace top bar (e.g. GTM-ABC1234).</span>
                <span className="font-mono">Env fallback: NEXT_PUBLIC_GTM_ID</span>
              </div>
            </div>
          </div>

          {/* Card 3: Automatic Event & Conversion Listeners */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="pb-4 border-b border-neutral-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-bx-pink border border-pink-200 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900 font-heading">
                  Automatic Behavioral &amp; Conversion Tracking
                </h2>
                <p className="text-xs text-neutral-500">
                  Zero-code listeners wired into Beetrix360 components that push to both `gtag` and GTM `dataLayer`.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  key: "trackPageViews" as const,
                  title: "SPA Virtual Pageviews",
                  desc: "Fires `page_view` on Next.js App Router route transitions",
                },
                {
                  key: "trackCtaClicks" as const,
                  title: "CTA & Strategy Modal Clicks",
                  desc: "Fires `cta_click` with `cta_tag` on any `[data-cta]` button",
                },
                {
                  key: "trackFormSubmissions" as const,
                  title: "Lead & Audit Form Submits",
                  desc: "Fires `generate_lead` & `audit_domain_submit` on form completions",
                },
                {
                  key: "trackVideoPlays" as const,
                  title: "Showreel & Video Opens",
                  desc: "Fires `video_play` when `[data-video]` modals are opened",
                },
                {
                  key: "trackRoiCalculator" as const,
                  title: "ROI Calculator Engagement",
                  desc: "Fires `roi_calculator_interaction` when team/cost sliders adjust",
                },
                {
                  key: "trackPhoneClicks" as const,
                  title: "Phone Call Clicks (`tel:`)",
                  desc: "Fires `phone_call_click` when visitors tap the sales phone number",
                },
                {
                  key: "trackOutboundLinks" as const,
                  title: "Outbound Link Clicks",
                  desc: "Fires `outbound_click` when clicking external partner URLs",
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200 hover:border-neutral-300 transition-colors flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    disabled={!canEdit}
                    onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                    className="mt-0.5 rounded border-neutral-300 text-bx-pink focus:ring-bx-pink"
                  />
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{item.title}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Card 4: Custom Selector Conversion Events */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="pb-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 font-heading">
                  Custom CSS Selector Conversion Rules
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Map any CSS selector click (e.g. `#cta-form button`, `[data-cta=&quot;Strategy call&quot;]`) to a custom GA4/GTM event name.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 font-semibold">
                {settings.customConversionEvents?.length || 0} Rules
              </span>
            </div>

            <div className="space-y-2.5">
              {(settings.customConversionEvents || []).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={evt.enabled}
                        disabled={!canEdit}
                        onChange={() => handleToggleCustomEvent(evt.id)}
                        className="rounded border-neutral-300 text-emerald-600"
                      />
                      <span className="text-xs font-bold text-neutral-900">{evt.name}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                        {evt.eventName}
                      </span>
                    </div>
                    {evt.triggerSelector && (
                      <p className="text-[11px] font-mono text-neutral-500 pl-6">
                        Selector: <code className="text-neutral-700">{evt.triggerSelector}</code>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleFireTestEvent(evt.eventName, evt.name)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 text-[11px] font-mono text-neutral-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-bx-blue" />
                      Test
                    </button>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomEvent(evt.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        aria-label="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {canEdit && (
              <div className="p-4 rounded-xl bg-neutral-50/70 border border-dashed border-neutral-300 space-y-3">
                <p className="text-xs font-mono uppercase text-neutral-600 font-semibold">
                  + Add Custom Conversion Event Rule
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    placeholder="Label (e.g. Pricing CTA)"
                    value={newEvtName}
                    onChange={(e) => setNewEvtName(e.target.value)}
                    className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-bx-pink"
                  />
                  <input
                    type="text"
                    placeholder="GA4 Event (e.g. pricing_click)"
                    value={newEvtCode}
                    onChange={(e) => setNewEvtCode(e.target.value)}
                    className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono focus:outline-none focus:border-bx-pink"
                  />
                  <input
                    type="text"
                    placeholder="CSS Selector (e.g. #roi button)"
                    value={newEvtSelector}
                    onChange={(e) => setNewEvtSelector(e.target.value)}
                    className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono focus:outline-none focus:border-bx-pink"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomEvent}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Conversion Rule</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Script Compiler & DataLayer Test Console (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live DataLayer & GTM Diagnostic Tester */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-bold text-neutral-900 font-heading">
                  Live `dataLayer` &amp; Event Tester
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                Interactive
              </span>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Dispatch a synthetic conversion event to verify your browser&apos;s Google Tag Assistant or GA4 DebugView stream.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFireTestEvent("generate_lead", "Diagnostic Lead Test")}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Fire `generate_lead`
              </button>
              <button
                type="button"
                onClick={() => handleFireTestEvent("cta_click", "Strategy Call Test")}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Fire `cta_click`
              </button>
              <button
                type="button"
                onClick={() => handleFireTestEvent("roi_calculator_interaction", "ROI Slider Test")}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Fire `roi_calculator`
              </button>
            </div>

            {testLog.length > 0 && (
              <div className="p-3 rounded-xl bg-neutral-950 text-emerald-400 font-mono text-[11px] space-y-1 max-h-40 overflow-y-auto">
                {testLog.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            )}
          </div>

          {/* Live Compiled Tag Preview */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-neutral-200">
              <h2 className="text-base font-bold text-neutral-900 font-heading">
                Compiled `&lt;head&gt;` &amp; `&lt;body&gt;` Injection Preview
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Automatically injected on all public marketing routes (excluded from `/admin` routes to keep analytics clean).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-neutral-900">Admin Excluded</p>
                  <p className="text-[10px] text-neutral-500">No internal traffic pollution</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-neutral-900">Next/Script</p>
                  <p className="text-[10px] text-neutral-500">`afterInteractive` non-blocking</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono text-orange-700 mb-2 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  <span>Rendered HTML Script Tags</span>
                </span>
                <span className="text-neutral-400 text-[10px]">Live Preview</span>
              </div>

              <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-200 overflow-x-auto max-h-[420px] leading-relaxed shadow-inner">
                {generatedSnippetPreview}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

