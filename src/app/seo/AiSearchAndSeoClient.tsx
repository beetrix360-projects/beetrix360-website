"use client";

import React, { useState, useEffect, useRef } from "react";
import "./ai-search.css";
import { getPageData } from "./data";
import { useAiSearchAnimations } from "./hooks/useAiSearchAnimations";
import { MarketeamHeader } from "./components/MarketeamHeader";
import { BandMarquee } from "./components/BandMarquee";
import { HeroSection } from "./components/HeroSection";
import { ScoreSection } from "./components/ScoreSection";
import { StrataSection } from "./components/StrataSection";
import { GuideSection } from "./components/GuideSection";
import { MoreSection } from "./components/MoreSection";
import { ReviewsSection } from "./components/ReviewsSection";
import { ClosingSection } from "./components/ClosingSection";
import { FaqSection } from "./components/FaqSection";
import { FloatingBar } from "./components/FloatingBar";
import { AiSearchFooter } from "./components/AiSearchFooter";

const topBandItems = [
  { label: "SEO", slug: "seo" },
  { label: "AEO", slug: "answer-engine-optimization" },
  { label: "GEO", slug: "generative-engine-optimization" },
  { label: "LLMO", slug: "generative-engine-optimization" },
  { label: "pSEO", slug: "programmatic-seo" },
  { label: "AI Overviews", slug: "answer-engine-optimization" },
];

const midBandItems = [
  { label: "Rank in Google", href: "#bx-score" },
  { label: "Win the snippet", href: "#bx-score" },
  { label: "Get cited by ChatGPT", href: "#bx-score" },
  { label: "Own the LLM answer", href: "#bx-score" },
];

const botBandItems = [
  { label: "Stop guessing", href: "#bx-close" },
  { label: "Get cited", href: "#bx-close" },
  { label: "Get ranked", href: "#bx-close" },
  { label: "Get chosen", href: "#bx-close" },
];

export function AiSearchAndSeoClient() {
  const [slug, setSlug] = useState("generative-engine-optimization");
  const progRef = useRef<HTMLDivElement>(null);
  const curRef = useRef<HTMLDivElement>(null);

  // Run all scroll-linked motion, entrance animations, and reveal observers
  useAiSearchAnimations(slug);

  // Ensure top-of-page scroll on fresh navigation
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  // Sync hash on mount and on change
  useEffect(() => {
    function handleHash() {
      const h = window.location.hash.slice(1);
      if (h && h !== slug) {
        const p = getPageData(h);
        if (p && h.length > 2 && !h.startsWith("bx-") && !h.startsWith("fx-")) {
          setSlug(h);
        }
      }
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [slug]);

  const handleSelectSlug = (newSlug: string) => {
    setSlug(newSlug);
    window.location.hash = newSlug;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const page = getPageData(slug);

  // Reading progress bar & custom cursor physics
  useEffect(() => {
    const isReduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isFine =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Reading progress bar
    function onScroll() {
      const d = document.documentElement;
      const y = window.scrollY;
      const maxScroll = Math.max(1, d.scrollHeight - d.clientHeight);
      if (progRef.current) {
        progRef.current.style.transform = `scaleX(${y / maxScroll})`;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Custom pointer logic
    let curAnim: number;
    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;
    let mag: HTMLElement | null = null;
    const cur = curRef.current;

    if (isFine && !isReduce && cur) {
      function loop() {
        cx += (tx - cx) * 0.22;
        cy += (ty - cy) * 0.22;
        if (cur) {
          cur.style.transform = `translate(${cx}px, ${cy}px)`;
        }
        curAnim = requestAnimationFrame(loop);
      }
      curAnim = requestAnimationFrame(loop);

      function onPointerMove(ev: PointerEvent) {
        tx = ev.clientX;
        ty = ev.clientY;
        if (cur) cur.classList.add("on");

        const target = ev.target as HTMLElement | null;
        if (!target) return;

        if (cur) {
          cur.classList.toggle("big", !!target.closest("a, button, summary, .mt-tile"));
        }

        // Tilt physics
        const tilt = target.closest(".fx-tilt") as HTMLElement | null;
        if (tilt) {
          const r = tilt.getBoundingClientRect();
          const x = (ev.clientX - r.left) / r.width;
          const y = (ev.clientY - r.top) / r.height;
          tilt.style.setProperty("--mx", `${x * 100}%`);
          tilt.style.setProperty("--my", `${y * 100}%`);
          tilt.style.setProperty("--rx", `${((0.5 - y) * 12).toFixed(2)}deg`);
          tilt.style.setProperty("--ry", `${((x - 0.5) * 12).toFixed(2)}deg`);
        }

        const flow = target.closest(".flow") as HTMLElement | null;
        if (flow) {
          const c = flow.querySelector(".card") as HTMLElement | null;
          if (c) {
            const q = c.getBoundingClientRect();
            c.style.setProperty("--rx", `${((0.5 - (ev.clientY - q.top) / q.height) * 14).toFixed(2)}deg`);
            c.style.setProperty("--ry", `${(((ev.clientX - q.left) / q.width - 0.5) * 14).toFixed(2)}deg`);
          }
        }

        // Magnetic button feel
        const m = target.closest(".btn, .s-btn, .btn-border-wrap, #stay a") as HTMLElement | null;
        if (mag && mag !== m) {
          mag.style.setProperty("--bx", "0px");
          mag.style.setProperty("--by", "0px");
        }
        mag = m;
        if (m) {
          const b = m.getBoundingClientRect();
          m.style.setProperty("--bx", `${((ev.clientX - b.left - b.width / 2) * 0.22).toFixed(1)}px`);
          m.style.setProperty("--by", `${((ev.clientY - b.top - b.height / 2) * 0.32).toFixed(1)}px`);
          if (m.matches("#stay a")) {
            m.style.translate = "var(--bx) var(--by)";
          }
        }

        const marketeamEl = document.getElementById("marketeam");
        if (target.closest("#marketeam") && marketeamEl) {
          marketeamEl.style.setProperty("--px", `${((ev.clientX / window.innerWidth - 0.5) * -34).toFixed(1)}px`);
          marketeamEl.style.setProperty("--py", `${((ev.clientY / window.innerHeight - 0.5) * -26).toFixed(1)}px`);
        }
      }

      function onPointerOut(ev: PointerEvent) {
        const target = (ev.target as HTMLElement | null)?.closest(".fx-tilt, .flow") as HTMLElement | null;
        if (target && !target.contains(ev.relatedTarget as Node)) {
          const el = target.matches(".flow") ? (target.querySelector(".card") as HTMLElement | null) : target;
          if (el) {
            el.style.setProperty("--rx", "0deg");
            el.style.setProperty("--ry", "0deg");
          }
        }
      }

      document.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerout", onPointerOut, { passive: true });

      return () => {
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(curAnim);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerout", onPointerOut);
      };
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="ai-search-wrapper bg-[#060607] text-white min-h-screen overflow-x-hidden relative selection:bg-[#DE2056] selection:text-white">
      {/* Reading Progress Indicator */}
      <div id="fx-prog" ref={progRef} aria-hidden="true" />

      {/* Custom Cursor */}
      <div id="fx-cur" ref={curRef} aria-hidden="true" />

      {/* 1. Header & Concentric Circles Hero */}
      <div className="mt-root" id="marketeam">
        <MarketeamHeader page={page} slug={slug} onSelectSlug={handleSelectSlug} />
      </div>

      {/* 2. Top Marquee Ribbon */}
      <BandMarquee items={topBandItems} onSelectSlug={handleSelectSlug} />

      {/* 3. Hero Section with Canvas Ribbon and Flow Card */}
      <HeroSection page={page} slug={slug} />

      {/* 4. 20-Second Self-Check Quiz */}
      <ScoreSection page={page} />

      {/* 5. Reverse Marquee Ribbon */}
      <BandMarquee items={midBandItems} rev onSelectSlug={handleSelectSlug} />

      {/* 6. Strata Section with Sediment Canvas Artwork */}
      <StrataSection page={page} />

      {/* 7. Comprehensive Guide Section */}
      <GuideSection page={page} />

      {/* 8. Process Rollout, Comparison Table, and Proof */}
      <MoreSection page={page} />

      {/* 9. Verified Client Reviews */}
      <ReviewsSection page={page} slug={slug} />

      {/* 10. Third Marquee Ribbon */}
      <BandMarquee items={botBandItems} onSelectSlug={handleSelectSlug} />

      {/* 11. Closing Hero Video Section */}
      <ClosingSection page={page} />

      {/* 12. FAQ Section */}
      <FaqSection page={page} slug={slug} onSelectSlug={handleSelectSlug} />

      {/* 13. Floating Sticky Bar */}
      <FloatingBar />

      {/* 14. Footer */}
      <AiSearchFooter />
    </div>
  );
}
