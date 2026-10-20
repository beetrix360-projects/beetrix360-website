"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ensureLenis, gsap, MODAL_EVENT, prefersReducedMotion, VIDEO_EVENT } from "@/lib/client-runtime";
import type { SiteSettings } from "@/lib/types";

/**
 * Request modal + video modal from the design. Any element with `data-cta="..."` opens the request
 * modal (wired in SiteRuntime). Form submissions are front-end only for now, as in the design.
 * TODO(backend): post the request to an API route (e.g. store in DynamoDB) when it exists.
 */
export function Modals({ modal: m, video: v }: { modal: SiteSettings["modal"]; video: SiteSettings["videoModal"] }) {
  const [req, setReq] = useState<{ tag: string; domain: string } | null>(null);
  const [sent, setSent] = useState(false);
  const [videoLabel, setVideoLabel] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onModal = (e: Event) => {
      const { tag, domain } = (e as CustomEvent<{ tag: string; domain: string }>).detail;
      setSent(false);
      setReq({ tag, domain });
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
      gsap.fromTo(cardRef.current, { y: 30, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" });
    const t = setTimeout(() => firstInput.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [req]);

  useEffect(() => {
    if (videoLabel && !prefersReducedMotion() && videoRef.current)
      gsap.fromTo(videoRef.current, { y: 30, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" });
  }, [videoLabel]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const title = req ? (req.tag.length > 34 ? m.defaultTitle : req.tag) : m.defaultTitle;
  const input =
    "w-full bg-bx-surface border border-bx-border focus:border-bx-dark rounded-xl px-4 py-3 text-sm focus:outline-none";

  return (
    <>
      <div
        className={`fixed inset-0 z-[80] ${req ? "flex" : "hidden"} items-center justify-center bg-bx-dark/70 backdrop-blur-sm p-4`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.target === e.currentTarget && setReq(null)}
      >
        <div ref={cardRef} className="bg-white rounded-[28px] max-w-lg w-full p-8 shadow-mega relative overflow-hidden">
          <div className="grid grid-cols-4 h-1.5 absolute top-0 inset-x-0" aria-hidden="true">
            <div className="bg-bx-green" />
            <div className="bg-bx-pink" />
            <div className="bg-bx-yellow" />
            <div className="bg-bx-blue" />
          </div>
          <button
            type="button"
            onClick={() => setReq(null)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-bx-surface border border-bx-border flex items-center justify-center"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
          <span className="px-2.5 py-1 rounded-full bg-bx-surface border border-bx-border font-mono text-[10px] uppercase">
            {req?.tag ?? m.defaultTag}
          </span>
          <p id="modal-title" role="heading" aria-level={2} className="font-heading font-bold text-2xl mt-4">
            {title}
          </p>
          <div className="mt-6">
            {sent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-bx-green/15 text-bx-green flex items-center justify-center text-xl">
                  <i className="fa-solid fa-check" aria-hidden="true" />
                </div>
                <p className="font-heading font-bold text-xl mt-4">{m.successTitle}</p>
                <p className="text-sm text-neutral-500 mt-1">{m.successText}</p>
              </div>
            ) : (
              <form className="space-y-3" onSubmit={submit} key={req?.tag + (req?.domain ?? "")}>
                <input ref={firstInput} required name="name" placeholder={m.namePlaceholder} aria-label="Name and title" className={input} />
                <input type="email" required name="email" placeholder={m.emailPlaceholder} aria-label="Work email" className={input} />
                <input
                  required
                  name="website"
                  defaultValue={req?.domain ?? ""}
                  placeholder={m.websitePlaceholder}
                  aria-label="Website"
                  className={`${input} font-mono`}
                />
                <button className="w-full py-3.5 bg-bx-dark hover:bg-bx-pink text-white rounded-full font-heading font-semibold text-sm transition-colors">
                  {m.submit}
                </button>
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
          className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 text-white"
          aria-label="Close video"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <div ref={videoRef} className="ph ph-dark w-full max-w-4xl aspect-video rounded-2xl">
          <i className="fa-solid fa-film" aria-hidden="true" />
          <span>
            {v.label} · {videoLabel}
          </span>
          <span>{v.hint}</span>
        </div>
      </div>
    </>
  );
}
