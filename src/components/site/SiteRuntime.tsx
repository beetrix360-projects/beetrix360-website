"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  ensureLenis,
  finePointer,
  gsap,
  openModal,
  openVideo,
  prefersReducedMotion,
  scrollToTarget,
  ScrollTrigger,
} from "@/lib/client-runtime";

/**
 * Site-wide behaviour ported from the design script: smooth scroll, scroll progress bar,
 * hide-on-scroll header, in-page anchor scrolling, CTA → modal wiring, magnetic buttons
 * and the custom cursor. Page-specific motion lives in components/home/HomeAnimations.tsx.
 */
export function SiteRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    ensureLenis();

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const cta = el.closest<HTMLElement>("[data-cta]");
      if (cta) {
        e.preventDefault();
        e.stopPropagation();
        openModal(cta.dataset.cta || "");
        return;
      }
      const video = el.closest<HTMLElement>("[data-video]");
      if (video) {
        openVideo(video.dataset.video || "");
        return;
      }
      const a = el.closest<HTMLAnchorElement>("a[href]");
      if (a) {
        const href = a.getAttribute("href") || "";
        const hash = href.startsWith("#") ? href : href.startsWith("/#") && window.location.pathname === "/" ? href.slice(1) : null;
        if (hash && hash.length > 1) {
          const t = document.querySelector(hash);
          if (t) {
            e.preventDefault();
            scrollToTarget(t);
          }
        } else if (hash === "#") {
          e.preventDefault();
          scrollToTarget(0);
        }
      }
    };

    // Forms marked data-modal-form open the request modal pre-filled with the typed domain.
    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (!form.matches("[data-modal-form]")) return;
      e.preventDefault();
      const input = form.querySelector("input") as HTMLInputElement | null;
      openModal(form.dataset.modalForm || "", input?.value.trim() || "");
    };

    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);

    // Custom cursor
    const cur = document.getElementById("cursor");
    let onMove: ((e: MouseEvent) => void) | null = null;
    let onOver: ((e: MouseEvent) => void) | null = null;
    if (cur && !prefersReducedMotion() && finePointer()) {
      const cx = gsap.quickTo(cur, "x", { duration: 0.25, ease: "power3" });
      const cy = gsap.quickTo(cur, "y", { duration: 0.25, ease: "power3" });
      onMove = (e) => {
        cx(e.clientX);
        cy(e.clientY);
      };
      onOver = (e) =>
        cur.classList.toggle("big", !!(e.target as HTMLElement).closest("a,button,[data-cursor],.flip,input[type=range]"));
      window.addEventListener("mousemove", onMove);
      document.addEventListener("mouseover", onOver);
    } else if (cur) cur.style.display = "none";

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
      if (onMove) window.removeEventListener("mousemove", onMove);
      if (onOver) document.removeEventListener("mouseover", onOver);
    };
  }, []);

  // Per-page: progress bar, header state, magnetic buttons.
  useEffect(() => {
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const nav = document.getElementById("site-nav");
      const menu = document.getElementById("mobile-menu");
      gsap.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          nav?.classList.toggle("nav-scrolled", y > 20);
          nav?.classList.toggle("nav-hidden", self.direction === 1 && y > 500 && !!menu?.classList.contains("hidden"));
        },
      });
    });

    const cleanups: (() => void)[] = [];
    if (!reduce && finePointer()) {
      document.querySelectorAll<HTMLElement>(".magnetic").forEach((b) => {
        const move = (e: MouseEvent) => {
          const r = b.getBoundingClientRect();
          gsap.to(b, {
            x: (e.clientX - r.left - r.width / 2) * 0.3,
            y: (e.clientY - r.top - r.height / 2) * 0.4,
            duration: 0.4,
            ease: "power3.out",
          });
        };
        const leave = () => gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,.4)" });
        b.addEventListener("mousemove", move);
        b.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          b.removeEventListener("mousemove", move);
          b.removeEventListener("mouseleave", leave);
        });
      });
    }

    // Arriving on "/#section" from another page.
    if (window.location.hash.length > 1) {
      const t = document.querySelector(window.location.hash);
      if (t) setTimeout(() => scrollToTarget(t), 300);
    }

    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  return null;
}
