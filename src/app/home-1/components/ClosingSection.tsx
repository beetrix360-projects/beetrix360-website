"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { PageData } from "../data";

interface Props {
  page: PageData;
}

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

const focus =
  " focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const btnClass =
  "inline-flex items-center justify-center h-[52px] px-6 box-border rounded-[10px] font-['Cabin'] font-medium text-[16px] whitespace-nowrap transition-colors" +
  focus;

export function ClosingSection({ page }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      v.removeAttribute("autoplay");
    }
  }, []);

  const deliverables = [
    {
      title: "AI-search audit",
      desc: "See where you stand across SEO, AEO, GEO and LLMO, and which rivals AI names instead.",
    },
    {
      title: "Automation map",
      desc: "Find the manual steps that slow your leads down and what can run on its own.",
    },
    {
      title: "ROI model",
      desc: "Get a clear estimate of what fixing each gap could add to your pipeline.",
    },
  ];

  return (
    <div id="stay">
      <section
        className="relative min-h-screen overflow-hidden flex flex-col bg-[#120d22] bg-[radial-gradient(90%_70%_at_50%_100%,#4a2a9c_0%,#2b2344_45%,#120d22_100%)]"
        id="bx-close"
      >
        {/* Background video */}
        {!videoError && (
          <video
            ref={videoRef}
            src={VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full max-w-none object-cover pointer-events-none opacity-40"
          />
        )}

        <div className="relative z-10 box-border flex flex-col items-center text-center mt-32 px-6 pb-32">
          {/* Free audit badge */}
          <div className="inline-flex items-center gap-2 h-[38px] box-border pl-1.5 pr-3 rounded-[10px] bg-[rgba(85,80,110,0.4)] backdrop-blur-md border border-solid border-[rgba(164,132,215,0.5)] font-['Cabin'] font-medium text-[14px] text-white max-w-full">
            <span className="inline-flex items-center h-[26px] px-2 rounded-[6px] bg-[#7b39fc]">
              Free audit
            </span>
            <span className="truncate">{page.name}</span>
          </div>

          {/* Heading */}
          <h2 className="m-0 mt-6 max-w-[1000px] font-['Instrument_Serif'] font-normal text-5xl md:text-7xl lg:text-[96px] leading-[1.1] text-white [text-wrap:balance]">
            Win the search <em className="italic mx-[.08em]">and</em> the AI answer
          </h2>

          {/* Subtext */}
          <p className="m-0 mt-6 max-w-[662px] font-['Inter'] font-normal text-[18px] leading-[1.55] text-white/70">
            Your buyers are asking AI right now. Get a free SEO, AEO, GEO and LLMO audit for {page.name}, plus a 90-day blueprint. Reply within 1 business day.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/get-a-proposal"
              className={`${btnClass} bg-[#7b39fc] text-white hover:bg-[#8d52fd] shadow-lg`}
            >
              Get my free audit now
            </Link>
            <a
              href="tel:+14244416042"
              className={`${btnClass} bg-[#2b2344] text-[#f6f7f9] hover:bg-[#3a3058] border border-white/10`}
            >
              Talk now: +1 (424) 441-6042
            </a>
          </div>

          {/* 3 deliverables */}
          <ul className="cl-get">
            {deliverables.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </li>
            ))}
          </ul>

          <p className="cl-note">
            Not ready for an audit? <a href="#bx-score">Run the 20-second self-check</a> or <a href="#bx-faq">read the FAQ</a> first.
          </p>
        </div>
      </section>
    </div>
  );
}
