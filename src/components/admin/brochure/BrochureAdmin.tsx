"use client";

import React, { useState, useRef } from "react";
import {
  FileDown,
  UploadCloud,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCode,
  Globe,
  ExternalLink,
  Eye,
  RefreshCw,
  Trash2,
  Link as LinkIcon,
  Download,
  Sparkles,
} from "lucide-react";
import type { BrochureConfig } from "@/lib/brochure";

interface Props {
  initialConfig: BrochureConfig;
}

export function BrochureAdmin({ initialConfig }: Props) {
  const [config, setConfig] = useState<BrochureConfig>(initialConfig);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to determine if the active file is HTML or PDF
  const isHtml = Boolean(
    config.fileType === "html" ||
      config.fileName?.toLowerCase().endsWith(".html") ||
      config.fileName?.toLowerCase().endsWith(".htm") ||
      config.fileUrl?.toLowerCase().endsWith(".html") ||
      config.fileUrl?.toLowerCase().endsWith(".htm")
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload file");
      }

      const data = await res.json();
      const lowerName = file.name.toLowerCase();
      const fileIsHtml = lowerName.endsWith(".html") || lowerName.endsWith(".htm");
      const fileIsPdf = lowerName.endsWith(".pdf");

      const sizeInKb = file.size / 1024;
      const formattedSize =
        sizeInKb < 1024
          ? `${fileIsHtml ? "HTML" : fileIsPdf ? "PDF" : "Doc"} • ${Math.round(sizeInKb)} KB`
          : `${fileIsHtml ? "HTML" : fileIsPdf ? "PDF" : "Doc"} • ${(sizeInKb / 1024).toFixed(1)} MB`;

      setConfig((prev) => ({
        ...prev,
        fileUrl: data.url,
        fileName: file.name,
        fileSize: formattedSize,
        fileType: fileIsHtml ? "html" : fileIsPdf ? "pdf" : "other",
      }));
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/brochure", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save brochure settings");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Marketing Assets &amp; Collateral</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900 tracking-tight flex items-center gap-2.5">
            <FileDown className="w-6 h-6 text-rose-500" />
            <span>E-Brochure &amp; Capabilities Collateral</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Upload and manage the corporate brochure (PDF or interactive HTML) viewed across the website footer in a new tab.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-heading font-semibold text-sm shadow-sm transition-colors self-start sm:self-center"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Brochure settings updated successfully and active on the website footer.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Config & Upload (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Status Switch */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="font-heading font-bold text-neutral-900 text-base">Show E-Brochure in Footer</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Displays the 1-click button under the company branding in the website footer to open the brochure in a new tab.
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

          {/* Upload & Current File Card */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-neutral-900 text-base flex items-center gap-2">
                {isHtml ? (
                  <FileCode className="w-5 h-5 text-indigo-600" />
                ) : (
                  <FileText className="w-5 h-5 text-rose-500" />
                )}
                <span>Brochure Document {isHtml ? "(HTML File)" : "(PDF File)"}</span>
              </h2>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                Supports PDF &amp; HTML
              </span>
            </div>

            {/* Current Active File Banner */}
            {config.fileUrl ? (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isHtml ? "bg-indigo-100 text-indigo-600" : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {isHtml ? <FileCode className="w-5 h-5" /> : <FileDown className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {config.fileName || "Uploaded Brochure"}
                      </p>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                          isHtml
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {isHtml ? "HTML" : "PDF"}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-neutral-400 mt-0.5">
                      {config.fileSize || (isHtml ? "HTML File" : "PDF Document")} · Active
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  {/* View/Preview in browser */}
                  <a
                    href={
                      config.fileUrl.startsWith("http")
                        ? config.fileUrl
                        : `/api/brochure/download?view=1`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-medium text-neutral-700 transition-colors"
                    title={isHtml ? "Preview interactive HTML page" : "Preview PDF document"}
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-500" />
                    <span>View / Test</span>
                  </a>

                  {/* Direct Download Test */}
                  <a
                    href="/api/brochure/download?download=1"
                    download={config.fileName || (isHtml ? "brochure.html" : "brochure.pdf")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-white transition-colors"
                    title="Download file to test visitor experience"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                No brochure file has been uploaded yet. Upload a PDF or HTML file below, or enter a hosted URL.
              </div>
            )}

            {/* Upload Area */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf,.html,.htm,text/html"
                onChange={handleFileUpload}
                className="hidden"
                id="brochure-file-upload"
              />
              <label
                htmlFor="brochure-file-upload"
                className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isUploading
                    ? "border-neutral-300 bg-neutral-50 cursor-not-allowed"
                    : "border-neutral-300 hover:border-rose-400 hover:bg-rose-50/20"
                }`}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
                    <p className="text-sm font-semibold text-neutral-700">Uploading brochure file...</p>
                    <p className="text-xs text-neutral-400 mt-1">Streaming to storage</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-rose-500 mb-2" />
                    <p className="text-sm font-semibold text-neutral-900">
                      Click to upload new Brochure (PDF or HTML)
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Supports PDF files (.pdf) and interactive HTML files (.html, .htm) up to 25MB
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                        PDF (.pdf)
                      </span>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                        HTML (.html, .htm)
                      </span>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Direct URL input fallback */}
            <div className="pt-2">
              <label className="block text-xs font-mono uppercase text-neutral-500 font-semibold mb-1">
                Or Host External URL (CloudFront, S3, Google Drive, CDN)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={config.fileUrl}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    const urlIsHtml =
                      newUrl.toLowerCase().endsWith(".html") || newUrl.toLowerCase().endsWith(".htm");
                    setConfig({
                      ...config,
                      fileUrl: newUrl,
                      fileType: urlIsHtml ? "html" : "pdf",
                    });
                  }}
                  placeholder="https://cdn.beetrix360.com/brochures/deck.pdf or .html"
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Button Display Options */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
            <h2 className="font-heading font-bold text-neutral-900 text-base">Button &amp; Label Details</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-500 font-semibold mb-1">
                  Footer Button Label
                </label>
                <input
                  type="text"
                  value={config.buttonLabel}
                  onChange={(e) => setConfig({ ...config, buttonLabel: e.target.value })}
                  placeholder="Download E-Brochure"
                  className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-500 font-semibold mb-1">
                  Download File Name
                </label>
                <input
                  type="text"
                  value={config.fileName}
                  onChange={(e) => setConfig({ ...config, fileName: e.target.value })}
                  placeholder={
                    isHtml
                      ? "Beetrix360-Corporate-Capabilities.html"
                      : "Beetrix360-Corporate-Brochure.pdf"
                  }
                  className="w-full px-4 py-2.5 text-sm font-mono text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-500 font-semibold mb-1">
                Short Description / Subtitle
              </label>
              <input
                type="text"
                value={config.description || ""}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Comprehensive overview of Beetrix360 growth systems and capabilities"
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Footer Preview (1 col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4 sticky top-6">
            <h3 className="font-heading font-bold text-neutral-900 text-sm uppercase tracking-wider text-neutral-400 font-mono">
              Live Footer Preview
            </h3>

            <div className="p-6 rounded-2xl bg-[#fafafa] border border-neutral-200 space-y-4">
              <div className="font-heading font-extrabold text-xl tracking-tight text-neutral-900">
                Beetrix<span className="text-bx-pink">360</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Revenue architects since 2016 — started as Bee Social.
              </p>

              <div className="flex gap-1.5" aria-hidden="true">
                <span className="w-6 h-1 rounded bg-bx-green" />
                <span className="w-6 h-1 rounded bg-bx-pink" />
                <span className="w-6 h-1 rounded bg-bx-yellow" />
                <span className="w-6 h-1 rounded bg-bx-blue" />
              </div>

              {config.enabled ? (
                <div className="pt-2">
                  <div className="inline-flex items-center justify-center gap-3 px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-heading font-semibold shadow-xs whitespace-nowrap">
                    <FileDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="whitespace-nowrap">{config.buttonLabel || "Download E-Brochure"}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2 font-mono">
                    ● Active in live website footer ({isHtml ? "HTML file" : "PDF file"})
                  </p>
                </div>
              ) : (
                <div className="pt-2 text-xs text-neutral-400 italic font-mono">
                  (Brochure button is currently disabled)
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Visitor Experience:</span>
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                When visitors click the footer button, their browser will open the brochure in a new tab:{" "}
                <span className="font-semibold text-neutral-900">
                  {config.fileName || (isHtml ? "brochure.html" : "brochure.pdf")}
                </span>
                . Both PDF documents and interactive single-page HTML decks render directly in the new browser tab with clean controls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
