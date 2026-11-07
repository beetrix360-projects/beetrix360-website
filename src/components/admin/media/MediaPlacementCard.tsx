"use client";

import React, { useState, useRef } from "react";
import type { MediaPlaceholderSlotView, MediaSourceType, MediaType } from "@/lib/types";

interface MediaPlacementCardProps {
  slot: MediaPlaceholderSlotView;
  categoryLabel: string;
  onSaved: (updatedSlot: MediaPlaceholderSlotView, applyScope: "page" | "category" | "all", updatedCount: number) => void;
  onReset: (slotId: string) => void;
}

export function MediaPlacementCard({
  slot,
  categoryLabel,
  onSaved,
  onReset,
}: MediaPlacementCardProps) {
  const [mediaType, setMediaType] = useState<MediaType>(slot.mediaType || "IMAGE");
  const [sourceType, setSourceType] = useState<MediaSourceType>(slot.sourceType || "UPLOAD");
  const [mediaUrl, setMediaUrl] = useState<string>(slot.mediaUrl || "");
  const [altText, setAltText] = useState<string>(slot.altText || slot.defaultAltText || "");
  const [seoTitle, setSeoTitle] = useState<string>(slot.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState<string>(slot.seoDescription || "");
  const [seoExpanded, setSeoExpanded] = useState<boolean>(
    Boolean(slot.seoTitle || slot.seoDescription)
  );
  const [applyScope, setApplyScope] = useState<"page" | "category" | "all">("page");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when switching page tabs
  React.useEffect(() => {
    setMediaType(slot.mediaType || "IMAGE");
    setSourceType(slot.sourceType || "UPLOAD");
    setMediaUrl(slot.mediaUrl || "");
    setAltText(slot.altText || slot.defaultAltText || "");
    setSeoTitle(slot.seoTitle || "");
    setSeoDescription(slot.seoDescription || "");
    setSeoExpanded(Boolean(slot.seoTitle || slot.seoDescription));
    setApplyScope("page");
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [slot]);

  async function handleFileUpload(file: File) {
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media-placements/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "File upload failed");
      }

      setMediaUrl(data.url);
      setSourceType("UPLOAD");
      if (data.mediaType === "VIDEO" || data.mediaType === "IMAGE") {
        setMediaType(data.mediaType);
      }
      setSuccessMsg("File uploaded — click Save Placement to publish.");
    } catch (err: any) {
      setErrorMsg(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }

  async function handleSave() {
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedUrl = mediaUrl.trim();
    const trimmedAlt = altText.trim();

    if (!trimmedUrl) {
      setErrorMsg("Please upload a file or enter a valid external media URL first.");
      return;
    }
    if (!trimmedAlt) {
      setErrorMsg("ALT text is required for accessibility and search engine indexing.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/media-placements/${encodeURIComponent(slot.id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageSlug: slot.pageSlug,
            placeholderKey: slot.placeholderKey,
            label: slot.label,
            mediaType,
            sourceType,
            mediaUrl: trimmedUrl,
            altText: trimmedAlt,
            seoTitle: seoTitle.trim(),
            seoDescription: seoDescription.trim(),
            dimensions: slot.dimensions,
            applyScope,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save placement");
      }

      const updatedSlot: MediaPlaceholderSlotView = {
        ...slot,
        ...data.placement,
        isConfigured: Boolean(data.placement.mediaUrl),
      };

      onSaved(updatedSlot, applyScope, data.updatedCount || 1);
      setSuccessMsg(
        data.updatedCount > 1
          ? `Saved & synced across ${data.updatedCount} pages!`
          : "Saved & indexed in page <head> + JSON-LD!"
      );
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save placement");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveMedia() {
    setErrorMsg(null);
    setSuccessMsg(null);
    setRemoving(true);
    try {
      const res = await fetch(
        `/api/admin/media-placements/${encodeURIComponent(slot.id)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset media placement");
      }
      setMediaUrl("");
      onReset(slot.id);
      setSuccessMsg("Media cleared — reverted to placeholder.");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to remove media");
    } finally {
      setRemoving(false);
    }
  }

  const altLength = altText.trim().length;
  const altStatusColor =
    altLength === 0
      ? "text-red-400"
      : altLength >= 30 && altLength <= 135
        ? "text-[#00c864]"
        : "text-amber-400";

  const hasActiveMedia = Boolean(mediaUrl.trim());

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        hasActiveMedia
          ? "border-[#00c864]/40 bg-[#14141d] shadow-lg shadow-[#00c864]/5"
          : "border-white/10 bg-[#12121a] hover:border-white/20"
      }`}
    >
      {/* Card Header */}
      <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#ff2d78]/15 text-[#ff2d78] border border-[#ff2d78]/30">
              {slot.placeholderKey}
            </span>
            {slot.dimensions && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/5 text-white/60 border border-white/10">
                {slot.dimensions}
              </span>
            )}
            {slot.isCustomSlot && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#2d7aff]/15 text-[#2d7aff] border border-[#2d7aff]/30">
                Custom Key
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white leading-snug break-words">
            {slot.label}
          </h3>
        </div>

        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            hasActiveMedia
              ? "bg-[#00c864]/15 text-[#00c864] border border-[#00c864]/30"
              : "bg-white/5 text-white/45 border border-white/10"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              hasActiveMedia ? "bg-[#00c864]" : "bg-white/30"
            }`}
          />
          {hasActiveMedia ? "Mapped" : "Placeholder"}
        </span>
      </div>

      {/* Live Preview Box */}
      <div className="p-5 space-y-4 flex-1">
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center group">
          {hasActiveMedia ? (
            mediaType === "VIDEO" ? (
              <video
                src={mediaUrl}
                controls
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt={altText || slot.label}
                title={seoTitle || undefined}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="text-center px-4 py-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2 text-white/40 text-lg">
                {mediaType === "VIDEO" ? "🎬" : "🖼️"}
              </div>
              <p className="text-xs font-medium text-white/60">{slot.label}</p>
              <p className="text-[11px] font-mono text-white/35 mt-0.5">
                {slot.dimensions || "1200 × 900"} · Empty Placeholder
              </p>
            </div>
          )}

          {hasActiveMedia && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono uppercase tracking-wider text-white/90 border border-white/15">
                {mediaType} · {sourceType}
              </span>
            </div>
          )}
        </div>

        {/* Media Type & Source Mode Toggles */}
        <div className="grid grid-cols-2 gap-2">
          {/* Media Type Toggle: IMAGE vs VIDEO */}
          <div className="flex rounded-lg bg-black/40 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setMediaType("IMAGE")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                mediaType === "IMAGE"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              🖼️ Image
            </button>
            <button
              type="button"
              onClick={() => setMediaType("VIDEO")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                mediaType === "VIDEO"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              🎬 Video
            </button>
          </div>

          {/* Source Type Toggle: UPLOAD vs URL */}
          <div className="flex rounded-lg bg-black/40 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setSourceType("UPLOAD")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                sourceType === "UPLOAD"
                  ? "bg-[#ff2d78] text-white shadow-sm"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              ⬆️ File Upload
            </button>
            <button
              type="button"
              onClick={() => setSourceType("URL")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                sourceType === "URL"
                  ? "bg-[#ff2d78] text-white shadow-sm"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              🔗 External URL
            </button>
          </div>
        </div>

        {/* File Upload Dropzone OR External URL Input */}
        {sourceType === "UPLOAD" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-3.5 text-center transition ${
              dragActive
                ? "border-[#ff2d78] bg-[#ff2d78]/10"
                : "border-white/15 bg-black/30 hover:border-white/30 hover:bg-white/[0.03]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg,.avif,.gif,.mp4,.webm,image/*,video/mp4,video/webm"
              onChange={onFileInputChange}
              className="hidden"
            />
            <div className="text-xs font-medium text-white/80">
              {uploading ? (
                <span className="text-[#ff2d78] animate-pulse">
                  Uploading media asset...
                </span>
              ) : (
                <>
                  <span className="text-[#ff2d78] font-semibold">Click to upload</span>{" "}
                  or drag & drop file here
                </>
              )}
            </div>
            <p className="text-[11px] text-white/40 mt-1">
              Supports .jpg, .png, .webp, .svg (up to 15MB) & .mp4, .webm (up to 60MB)
            </p>
            {mediaUrl && (
              <p className="text-[11px] font-mono text-[#00c864] truncate mt-1.5 px-2">
                {mediaUrl}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">
              External Media URL (CDN / S3 / Direct Asset Link)
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={
                mediaType === "VIDEO"
                  ? "https://cdn.example.com/videos/showreel.mp4"
                  : "https://cdn.example.com/images/hero-banner.webp"
              }
              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d78]"
            />
          </div>
        )}

        {/* ALT Text Input (Required for Accessibility & Image/Video Bot Indexing) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
              ALT Text <span className="text-[#ff2d78]">*</span>
            </label>
            <span className={`text-[11px] font-mono ${altStatusColor}`}>
              {altLength} chars{" "}
              {altLength >= 30 && altLength <= 135
                ? "✓ Optimal SEO"
                : "(Aim for 50–125)"}
            </span>
          </div>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Descriptive ALT text for screen readers & Google Image/Video bots..."
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff2d78]"
          />
          <p className="text-[10px] text-white/40 mt-1">
            Injected into DOM <code className="text-white/60">alt</code> /{" "}
            <code className="text-white/60">aria-label</code>, OpenGraph image alt, and Schema.org{" "}
            <code className="text-white/60">caption</code>.
          </p>
        </div>

        {/* Expandable SEO Metadata (<head> & JSON-LD Schema) */}
        <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
          <button
            type="button"
            onClick={() => setSeoExpanded((prev) => !prev)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-medium text-white/80 hover:bg-white/5 transition"
          >
            <span className="flex items-center gap-2">
              <span className="text-[#00c864]">🔍</span>
              <span>Search Engine Bot Metadata (&lt;head&gt; &amp; JSON-LD)</span>
            </span>
            <span className="text-white/40 text-[11px] font-mono">
              {seoExpanded ? "Hide ▲" : "Configure ▼"}
            </span>
          </button>

          {seoExpanded && (
            <div className="p-3.5 pt-2 border-t border-white/10 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-1">
                  SEO Title (Attribute &amp; Schema Name)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={`${slot.label} | Beetrix360`}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#00c864]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-1">
                  SEO Caption / Description (JSON-LD ImageObject / VideoObject)
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Detailed context indexed by Googlebot in application/ld+json structured data..."
                  className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#00c864] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Apply Scope Selector (Single Page vs Category-Wide vs Site-Wide matching slot) */}
        {slot.pageSlug !== "home" && (
          <div className="pt-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/45 mb-1">
              Placement Sync Scope
            </label>
            <select
              value={applyScope}
              onChange={(e) =>
                setApplyScope(e.target.value as "page" | "category" | "all")
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white/80 focus:outline-none focus:border-[#ff2d78]"
            >
              <option value="page">This page only ({slot.pageSlug})</option>
              <option value="category">
                All pages in {categoryLabel} with slot &ldquo;{slot.placeholderKey}&rdquo;
              </option>
              <option value="all">
                All website pages with slot &ldquo;{slot.placeholderKey}&rdquo;
              </option>
            </select>
          </div>
        )}

        {/* Status Feedback Messages */}
        {errorMsg && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="px-3 py-2 rounded-lg bg-[#00c864]/10 border border-[#00c864]/30 text-xs text-[#00c864]">
            {successMsg}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleRemoveMedia}
          disabled={removing || (!hasActiveMedia && !slot.isCustomSlot)}
          className="px-3 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition disabled:opacity-30 disabled:pointer-events-none"
        >
          {removing
            ? "Resetting..."
            : slot.isCustomSlot
              ? "Delete Slot"
              : "Remove / Reset"}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#ff2d78] hover:bg-[#ff2d78]/90 text-white shadow-md shadow-[#ff2d78]/20 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Placement"}
        </button>
      </div>
    </div>
  );
}

