"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ensureLenis, gsap, MODAL_EVENT, prefersReducedMotion, VIDEO_EVENT } from "@/lib/client-runtime";
import type { SiteSettings } from "@/lib/types";

interface ModalRequestState {
  tag: string;
  domain: string;
  sectionName?: string;
  buttonName?: string;
  pageUrl?: string;
}

const MODAL_GOALS = [
  { label: "AI search", icon: "fa-solid fa-wand-magic-sparkles", color: "text-amber-500" },
  { label: "Automation", icon: "fa-solid fa-gears", color: "text-bx-pink" },
  { label: "AI agents", icon: "fa-solid fa-robot", color: "text-bx-green" },
  { label: "New website", icon: "fa-solid fa-code", color: "text-bx-blue" },
  { label: "Paid media", icon: "fa-solid fa-bullseye", color: "text-orange-500" },
  { label: "Brand & social", icon: "fa-solid fa-bolt", color: "text-purple-500" },
];

/**
 * Request modal + video modal. Any element with `data-cta="..."` opens the request
 * modal (wired in SiteRuntime). Form submissions post to /api/inquiry with origin
 * attribution (pageUrl, sectionName, buttonName) and dispatch email notifications to leads@beetrix360.com.
 */
export function Modals({ modal: m, video: v }: { modal: SiteSettings["modal"]; video: SiteSettings["videoModal"] }) {
  const [req, setReq] = useState<ModalRequestState | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string>("AI search");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [videoLabel, setVideoLabel] = useState<string | null>(null);
  const [visualViewport, setVisualViewport] = useState<{ height: number; offsetTop: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateViewport = () => {
      setVisualViewport((current) =>
        current?.height === viewport.height && current.offsetTop === viewport.offsetTop
          ? current
          : { height: viewport.height, offsetTop: viewport.offsetTop },
      );
    };

    updateViewport();
    viewport.addEventListener("resize", updateViewport);
    viewport.addEventListener("scroll", updateViewport);
    return () => {
      viewport.removeEventListener("resize", updateViewport);
      viewport.removeEventListener("scroll", updateViewport);
    };
  }, []);

  useEffect(() => {
    const onModal = (e: Event) => {
      const detail = (e as CustomEvent<ModalRequestState>).detail || ({} as ModalRequestState);
      setSent(false);
      setErrorMessage("");
      setIsSubmitting(false);

      // Pre-select goal based on tag context if matched
      const tagLower = (detail.tag || "").toLowerCase();
      if (tagLower.includes("search") || tagLower.includes("geo") || tagLower.includes("audit")) {
        setSelectedGoal("AI search");
      } else if (tagLower.includes("auto") || tagLower.includes("flow")) {
        setSelectedGoal("Automation");
      } else if (tagLower.includes("agent") || tagLower.includes("bot")) {
        setSelectedGoal("AI agents");
      } else if (tagLower.includes("web") || tagLower.includes("design") || tagLower.includes("dev")) {
        setSelectedGoal("New website");
      } else if (tagLower.includes("ad") || tagLower.includes("media") || tagLower.includes("paid")) {
        setSelectedGoal("Paid media");
      } else if (tagLower.includes("brand") || tagLower.includes("social")) {
        setSelectedGoal("Brand & social");
      }

      setReq({
        tag: detail.tag || "",
        domain: detail.domain || "",
        sectionName: detail.sectionName || "",
        buttonName: detail.buttonName || "",
        pageUrl: detail.pageUrl || "",
      });
    };

    const onVideo = (e: Event) => setVideoLabel((e as CustomEvent<{ label: string }>).detail.label);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setReq(null);
        setVideoLabel(null);
      }
    };

    window.addEventListener(MODAL_EVENT, onModal);
    window.addEventListener(VIDEO_EVENT, onVideo);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(MODAL_EVENT, onModal);
      window.removeEventListener(VIDEO_EVENT, onVideo);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const anyOpen = !!req || !!videoLabel;
  useEffect(() => {
    const lenis = ensureLenis();
    if (anyOpen) lenis?.stop();
    else lenis?.start();
  }, [anyOpen]);

  useEffect(() => {
    if (!req) return;
    if (!prefersReducedMotion() && cardRef.current)
      gsap.fromTo(cardRef.current, { y: 20, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" });
    const t = setTimeout(() => {
      // Auto-focus only on desktop to prevent mobile/tablet keyboards from abruptly covering the modal
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        firstInput.current?.focus();
      }
    }, 50);
    return () => clearTimeout(t);
  }, [req]);

  useEffect(() => {
    if (videoLabel && !prefersReducedMotion() && videoRef.current)
      gsap.fromTo(videoRef.current, { y: 30, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" });
  }, [videoLabel]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      whatsapp: formData.get("whatsapp")?.toString() || "",
      website: formData.get("website")?.toString() || "",
      goal: selectedGoal,
      notes: formData.get("notes")?.toString() || "",
      pageUrl: req?.pageUrl || (typeof window !== "undefined" ? window.location.href : ""),
      sectionName: req?.sectionName || "Website Modal",
      buttonName: req?.buttonName || req?.tag || "Get Started",
    };

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = req ? (req.tag.length > 34 ? m.defaultTitle : req.tag) : m.defaultTitle;
  const input =
    "w-full bg-bx-surface border border-bx-border focus:border-bx-dark rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-[16px] sm:text-sm focus:outline-none transition-colors";
  const label = "block text-[11px] font-mono uppercase text-neutral-500 font-semibold mb-1";

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 z-[80] ${req ? "flex" : "hidden"} items-start lg:items-center justify-center bg-bx-dark/75 backdrop-blur-sm p-3 sm:p-6 lg:p-4 pt-3 sm:pt-6 lg:pt-4 overflow-y-auto overscroll-contain`}
        style={visualViewport ? { height: visualViewport.height, top: visualViewport.offsetTop, bottom: "auto" } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.target === e.currentTarget && setReq(null)}
      >
        <div ref={cardRef} className="bg-white rounded-[24px] sm:rounded-[28px] max-w-lg w-full p-5 sm:p-8 shadow-mega relative overflow-hidden mt-1 sm:mt-4 lg:my-8 mb-28 sm:mb-24 lg:mb-8">
          <div className="grid grid-cols-4 h-1.5 absolute top-0 inset-x-0" aria-hidden="true">
            <div className="bg-bx-green" />
            <div className="bg-bx-pink" />
            <div className="bg-bx-yellow" />
            <div className="bg-bx-blue" />
          </div>

          <button
            type="button"
            onClick={() => setReq(null)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-bx-surface border border-bx-border flex items-center justify-center hover:bg-neutral-200 transition-colors"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-neutral-600" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-bx-surface border border-bx-border font-mono text-[10px] uppercase font-semibold text-neutral-700">
              {req?.tag ?? m.defaultTag}
            </span>
            {req?.sectionName && (
              <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[220px]">
                {req.sectionName}
              </span>
            )}
          </div>

          <p id="modal-title" role="heading" aria-level={2} className="font-heading font-bold text-2xl mt-3 text-neutral-900 tracking-tight">
            {title}
          </p>

          <div className="mt-5">
            {sent ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl border border-emerald-200">
                  <i className="fa-solid fa-check" aria-hidden="true" />
                </div>
                <p className="font-heading font-bold text-2xl text-neutral-900">{m.successTitle}</p>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">{m.successText}</p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setReq(null)}
                    className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-3 sm:space-y-3.5" onSubmit={submit} key={req?.tag + (req?.domain ?? "")}>
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation shrink-0" aria-hidden="true" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Main Goal Selection */}
                <div>
                  <span className={label}>Main Goal</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {MODAL_GOALS.map((g) => {
                      const isSelected = selectedGoal === g.label;
                      return (
                        <button
                          key={g.label}
                          type="button"
                          onClick={() => setSelectedGoal(g.label)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                            isSelected
                              ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                              : "bg-bx-surface border-bx-border text-neutral-700 hover:border-neutral-400"
                          }`}
                        >
                          <i className={`${g.icon} ${isSelected ? "text-bx-yellow" : g.color} text-[11px]`} aria-hidden="true" />
                          <span className="truncate">{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <span className={label}>{m.namePlaceholder} *</span>
                    <input
                      ref={firstInput}
                      required
                      name="name"
                      placeholder="Jane Doe"
                      aria-label="Name"
                      className={input}
                    />
                  </div>
                  <div>
                    <span className={label}>{m.emailPlaceholder} *</span>
                    <input
                      type="email"
                      required
                      name="email"
                      placeholder="jane@company.com"
                      aria-label="Work email"
                      className={input}
                    />
                  </div>
                </div>

                {/* WhatsApp & Website */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <span className={label}>WhatsApp / Phone</span>
                    <input
                      type="tel"
                      name="whatsapp"
                      placeholder="+1 (555) 000-0000"
                      aria-label="WhatsApp Number"
                      className={input}
                    />
                  </div>
                  <div>
                    <span className={label}>{m.websitePlaceholder}</span>
                    <input
                      name="website"
                      defaultValue={req?.domain ?? ""}
                      placeholder="yourcompany.com"
                      aria-label="Website"
                      className={`${input} font-mono text-xs`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-bx-dark hover:bg-bx-pink disabled:opacity-60 text-white rounded-full font-heading font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-xs" aria-hidden="true" />
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <span>{m.submit}</span>
                  )}
                </button>

                <p className="text-[10px] text-neutral-400 text-center font-mono">
                  Guaranteed confidential · Replies to your email within 1 business day
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[80] ${videoLabel ? "flex" : "hidden"} items-center justify-center bg-black/85 p-4`}
        role="dialog"
        aria-modal="true"
        aria-label="Video"
        onClick={(e) => e.target === e.currentTarget && setVideoLabel(null)}
      >
        <button
          type="button"
          onClick={() => setVideoLabel(null)}
          className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Close video"
        >
          <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
        </button>
        {videoLabel &&
        (videoLabel.startsWith("/") ||
          videoLabel.startsWith("http://") ||
          videoLabel.startsWith("https://")) ? (
          <div ref={videoRef} className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
            <video
              src={videoLabel}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div ref={videoRef} className="ph ph-dark w-full max-w-4xl aspect-video rounded-2xl">
            <i className="fa-solid fa-film" aria-hidden="true" />
            <span>
              {v.label} · {videoLabel}
            </span>
            <span>{v.hint}</span>
          </div>
        )}
      </div>
    </>
  );
}
