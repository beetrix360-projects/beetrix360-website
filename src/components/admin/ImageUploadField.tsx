"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  accept?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  helperText,
  accept = "image/png,image/jpeg,image/webp,image/svg+xml,image/avif,image/gif",
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccessInfo(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file.");
      }

      onChange(data.url);
      setSuccessInfo(
        data.storage === "s3"
          ? "Uploaded successfully to Amazon S3!"
          : "Uploaded locally (S3 bucket not set in env)."
      );
    } catch (err: any) {
      setError(err?.message || "Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-700 tracking-wide uppercase">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setError(null);
              setSuccessInfo(null);
            }}
            className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>

      {/* Image Preview & Upload Container */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Preview Box */}
        {value ? (
          <div className="relative w-full sm:w-44 h-32 rounded-xl border border-neutral-200 overflow-hidden bg-neutral-900/5 group flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                // fallback if image fails to render
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white/95 text-neutral-900 text-xs font-medium shadow-sm hover:bg-white"
              >
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full sm:w-44 h-32 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 shrink-0 bg-neutral-50/50">
            <ImageIcon className="w-7 h-7 mb-1 stroke-[1.5]" />
            <span className="text-[11px] font-medium">No Image</span>
          </div>
        )}

        {/* Dropzone & Manual URL Input */}
        <div className="flex-1 w-full space-y-2">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-amber-500 bg-amber-50/50"
                : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
            />
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-amber-600 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading to storage...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 py-1">
                <Upload className="w-5 h-5 text-neutral-500 mb-0.5" />
                <p className="text-xs font-medium text-neutral-700">
                  <span className="text-amber-600 font-semibold underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-[11px] text-neutral-400">PNG, JPG, WebP, SVG, AVIF up to 10MB</p>
              </div>
            )}
          </div>

          {/* Direct URL input fallback */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Or paste an image URL (https://...)"
              className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-mono text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {helperText && !error && !successInfo && (
        <p className="text-[11px] text-neutral-400">{helperText}</p>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}

      {successInfo && (
        <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium mt-1">
          <CheckCircle className="w-3.5 h-3.5" /> {successInfo}
        </p>
      )}
    </div>
  );
}
