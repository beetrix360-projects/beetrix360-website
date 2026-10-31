import React from "react";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { Breadcrumbs } from "@/components/pages/InnerPage";

interface HeroSectionProps {
  h1: string;
  badge?: string;
  tagline?: string;
  crumbItems?: { name: string; path: string }[];
  contentStatus?: string;
  primaryCta?: { label: string; path: string };
  secondaryCta?: { label: string; path: string };
}

export function HeroSection({
  h1,
  badge,
  tagline,
  crumbItems,
  contentStatus,
  primaryCta = { label: "Get a proposal", path: "/get-a-proposal" },
  secondaryCta = { label: "Schedule Strategy Call", path: "/contact" },
}: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-16 sm:pt-36 lg:pt-40 lg:pb-20 bg-grid overflow-hidden px-5 sm:px-8 lg:px-12 2xl:px-20 border-b border-neutral-100">
      <div
        className="absolute -top-24 right-[10%] w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none opacity-20 bg-bx-pink"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-6xl mx-auto">
        {crumbItems && crumbItems.length > 0 && <Breadcrumbs items={crumbItems} />}

        <div className="mt-8 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-bx-pink/10 text-bx-pink border border-bx-pink/20">
            <Layers className="w-3.5 h-3.5" />
            {badge || "Beetrix360"}
          </span>
          {contentStatus === "placeholder" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
              Placeholder Spec
            </span>
          )}
        </div>

        <h1 className="font-heading font-extrabold tracking-tight text-4xl sm:text-6xl lg:text-7xl leading-[1.05] mt-6 text-bx-dark">
          {h1}
        </h1>

        {tagline && (
          <p className="mt-6 text-lg sm:text-xl text-neutral-600 max-w-3xl leading-relaxed">
            {tagline}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={primaryCta.path}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-bx-pink text-white font-semibold text-sm hover:bg-bx-pink/90 transition shadow-sm"
          >
            {primaryCta.label} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={secondaryCta.path}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-neutral-800 border border-neutral-200 font-semibold text-sm hover:bg-neutral-50 transition"
          >
            {secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
