"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const finePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer:fine)").matches;

let lenis: Lenis | null = null;

/** One Lenis smooth-scroll instance for the whole site, driven by the GSAP ticker (as in the design). */
export function ensureLenis(): Lenis | null {
  if (lenis || typeof window === "undefined" || prefersReducedMotion()) return lenis;
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function scrollToTarget(target: Element | number, offset = -60) {
  const l = ensureLenis();
  if (l) {
    l.scrollTo(target as HTMLElement | number, typeof target === "number" ? {} : { offset });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  } else {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
}

// ---- Request / video modal events ----
export const MODAL_EVENT = "bx:open-modal";
export const VIDEO_EVENT = "bx:open-video";

export function openModal(tag: string, domain = "") {
  window.dispatchEvent(new CustomEvent(MODAL_EVENT, { detail: { tag, domain } }));
}

export function openVideo(label: string) {
  window.dispatchEvent(new CustomEvent(VIDEO_EVENT, { detail: { label } }));
}
