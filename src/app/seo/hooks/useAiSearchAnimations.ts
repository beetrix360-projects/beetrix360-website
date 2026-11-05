"use client";

import { useEffect, useRef } from "react";

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function useAiSearchAnimations(slug: string) {
  const ioRef = useRef<IntersectionObserver | null>(null);
  const scanFnRef = useRef<(() => void) | null>(null);

  // 1. Primary effect: Sets up IntersectionObserver, Hero/Strata entrances, Parallax and Marquee
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Helper to query element bounds and progress relative to viewport
    function getP(el: HTMLElement) {
      const r = el.getBoundingClientRect();
      const innerHeight = window.innerHeight;
      return {
        pr: clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1),
        r,
      };
    }

    // Number counting animation
    function count(el: HTMLElement) {
      const src = el.getAttribute("data-t") || el.textContent || "";
      el.setAttribute("data-t", src);
      const m = src.match(/^(\D*)([\d.]+)(.*)$/);
      if (!m || reduce) return;
      const prefix = m[1];
      const to = +m[2];
      const suffix = m[3];
      let t0 = 0;
      function f(t: number) {
        t0 = t0 || t;
        const k = Math.min((t - t0) / 1300, 1);
        el.textContent = prefix + Math.round(to * (1 - Math.pow(1 - k, 3))) + suffix;
        if (k < 1) requestAnimationFrame(f);
      }
      requestAnimationFrame(f);
    }

    // Immediate viewport check to avoid initial invisibility
    function revealIfInView(el: HTMLElement) {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 80 && r.bottom > -50) {
        if (el.hasAttribute("data-fxw")) {
          el.classList.add("in-w");
        } else {
          el.classList.add("in");
        }
      }
    }

    // IntersectionObserver for staggered reveals
    const io =
      !reduce && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                const t = e.target as HTMLElement;
                if (e.isIntersecting) {
                  if (t.hasAttribute("data-fxw")) {
                    t.classList.add("in-w");
                  } else if (t.classList.contains("s-stats")) {
                    t.querySelectorAll<HTMLElement>("b").forEach(count);
                  } else if (t.classList.contains("g-num")) {
                    count(t);
                  } else {
                    t.classList.add("in");
                  }
                }
              });
            },
            { threshold: 0.02, rootMargin: "0px 0px 80px 0px" }
          )
        : null;

    ioRef.current = io;

    // Scan DOM and attach word-splitting + classes
    function scan() {
      if (typeof document === "undefined") return;

      // 1. Text word-split animation for [data-fxw]
      const fxwHeadings = document.querySelectorAll<HTMLElement>("[data-fxw]");
      fxwHeadings.forEach((h) => {
        if (!h.querySelector(".fxw") && !reduce) {
          const rawText = h.textContent || "";
          h.innerHTML = rawText
            .split(" ")
            .map(
              (w, i) =>
                `<span class="fxw" style="--d:${(i * 0.05).toFixed(2)}s">${w}</span>`
            )
            .join(" ");
        }
        if (io) io.observe(h);
        revealIfInView(h);
      });

      // 2. Staggered list items and cards
      const listItems = document.querySelectorAll<HTMLElement>(
        ".s-gcards li, .s-rel a, .s-faq details, #fx-qs li, .s-table tbody tr"
      );
      listItems.forEach((el) => {
        const parent = el.parentNode;
        const i = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
        if (el.matches(".s-gcards li, .s-rel a")) el.classList.add("fx-tilt");
        el.classList.add("rv");
        el.style.setProperty("--d", `${(i * 0.08).toFixed(2)}s`);
        if (io) io.observe(el);
        revealIfInView(el);
      });

      // 3. Elements with explicit data-rv
      const rvElements = document.querySelectorAll<HTMLElement>("[data-rv]");
      rvElements.forEach((el) => {
        el.classList.add("rv");
        if (io) io.observe(el);
        revealIfInView(el);
      });

      // 4. Tilt cards
      const tiltCards = document.querySelectorAll<HTMLElement>(".s-card, [data-tilt]");
      tiltCards.forEach((el) => el.classList.add("fx-tilt"));

      // 5. Stat blocks
      if (io) {
        document.querySelectorAll<HTMLElement>(".s-stats, .g-num").forEach((el) => {
          io.observe(el);
        });
      }
    }

    scanFnRef.current = scan;

    // Run scans on mount and slightly delayed to ensure DOM hydration has settled
    scan();
    const scanTimer1 = setTimeout(scan, 60);
    const scanTimer2 = setTimeout(scan, 200);
    const scanTimer3 = setTimeout(scan, 500);

    // One-time Entrance for Hero (#hero)
    const heroEl = document.getElementById("hero");
    let heroSeen = false;
    function heroEntrance() {
      if (heroSeen || reduce || !Element.prototype.animate) return;
      heroSeen = true;
      const ease = "cubic-bezier(.2,.7,.2,1)";
      function play(
        el: Element | null,
        frames: Keyframe[],
        delay: number,
        duration: number,
        easing?: string
      ) {
        if (!el) return;
        return el.animate(frames, {
          delay,
          duration,
          easing: easing || ease,
          fill: "backwards",
        });
      }

      const rise: Keyframe[] = [
        { opacity: 0, transform: "translateY(16px)" },
        { opacity: 1, transform: "none" },
      ];

      document.querySelectorAll('[data-in="line"]').forEach((el, i) => {
        play(
          el,
          [
            { opacity: 0, transform: "translateY(26px)", filter: "blur(12px)" },
            { opacity: 1, transform: "none", filter: "blur(0)" },
          ],
          140 + i * 120,
          640
        );
      });

      document.querySelectorAll('[data-in="sub"]').forEach((el) => {
        play(el, rise, 600, 480);
      });
      play(document.querySelector('[data-in="cta"]'), rise, 720, 480);
      play(document.querySelector('[data-in="badge"]'), rise, 840, 460);
      play(document.querySelector('[data-in="card"]'), [{ opacity: 0 }, { opacity: 1 }], 800, 460);

      function drawWire(el: Element, delay: number) {
        play(
          el,
          [
            { strokeDasharray: "1 1", strokeDashoffset: 1 },
            { strokeDasharray: "1 1", strokeDashoffset: 0 },
          ],
          delay,
          320,
          "ease-out"
        );
      }

      document.querySelectorAll('[data-wire="in"]').forEach((el, i) => {
        drawWire(el, 1000 + i * 40);
      });
      play(
        document.getElementById("hub"),
        [
          { opacity: 0, transform: "scale(.72)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        1220,
        340,
        "cubic-bezier(.3,1.6,.5,1)"
      );
      document.querySelectorAll('[data-wire="out"]').forEach((el, i) => {
        drawWire(el, 1340 + i * 30);
      });
      document.querySelectorAll("[data-clean]").forEach((el, i) => {
        play(
          el,
          [
            { opacity: 0.25, filter: "saturate(0)" },
            { opacity: 1, filter: "saturate(1.5) brightness(1.3)", offset: 0.6 },
            { opacity: 1, filter: "saturate(1) brightness(1)" },
          ],
          1480 + i * 80,
          200,
          "ease-out"
        );
      });
    }

    let heroObserver: IntersectionObserver | null = null;
    if (heroEl && "IntersectionObserver" in window) {
      heroObserver = new IntersectionObserver(
        (es) => {
          if (es[0].isIntersecting) {
            heroEntrance();
          }
        },
        { threshold: 0.02 }
      );
      heroObserver.observe(heroEl);
    } else {
      heroEntrance();
    }

    // One-time Entrance for Strata (#strata)
    const strataEl = document.getElementById("strata");
    let strataSeen = false;
    function strataEntrance() {
      if (strataSeen || reduce || !Element.prototype.animate || !strataEl) return;
      strataSeen = true;
      const ease = "cubic-bezier(.2,.7,.2,1)";
      function play(
        el: Element | null,
        frames: Keyframe[],
        delay: number,
        dur: number
      ) {
        if (!el) return;
        el.animate(frames, { delay, duration: dur, easing: ease, fill: "backwards" });
      }
      const up: Keyframe[] = [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "none" },
      ];

      strataEl.querySelectorAll('[data-s="head"]').forEach((el, i) => {
        play(el, up, i * 45, 420);
      });
      strataEl.querySelectorAll('[data-s="line"]').forEach((el, i) => {
        play(el, [{ transform: "translateY(106%)" }, { transform: "none" }], 240 + i * 120, 720);
      });
      play(strataEl.querySelector('[data-s="sub"]'), up, 660, 480);
      play(
        strataEl.querySelector('[data-s="primary"]'),
        [{ opacity: 0, transform: "scale(1.015)" }, { opacity: 1, transform: "none" }],
        800,
        460
      );
      play(strataEl.querySelector('[data-s="secondary"]'), up, 880, 440);
      strataEl.querySelectorAll('[data-s="stat"]').forEach((el, i) => {
        play(el, up, 980 + i * 90, 420);
      });
      strataEl.querySelectorAll('[data-s="card"]').forEach((el, i) => {
        play(el, [{ opacity: 0, transform: "translateY(22px)" }, { opacity: 1, transform: "none" }], 1160 + i * 110, 520);
      });
      strataEl.querySelectorAll('[data-s="logo"]').forEach((el, i) => {
        play(el, [{ opacity: 0 }, { opacity: 1 }], 1420 + i * 80, 380);
      });
    }

    let strataObserver: IntersectionObserver | null = null;
    if (strataEl && "IntersectionObserver" in window) {
      strataObserver = new IntersectionObserver(
        (es) => {
          if (es[0].isIntersecting) {
            strataEntrance();
          }
        },
        { threshold: 0.02 }
      );
      strataObserver.observe(strataEl);
    } else {
      strataEntrance();
    }

    // Scroll-Linked Parallax Motion
    let ticking = false;
    function onScroll() {
      ticking = false;
      const y = window.scrollY;
      const innerHeight = window.innerHeight;

      if (reduce) return;

      // 1. Marketeam Hero Left & Field Parallax
      const left = document.querySelector<HTMLElement>(".mt-hero-left");
      const field = document.querySelector<HTMLElement>(".mt-field");
      if (left) {
        left.style.translate = `0 ${(-y * 0.14).toFixed(1)}px`;
        left.style.opacity = String(clamp(1 - y / (innerHeight * 0.85), 0, 1));
      }
      if (field) {
        field.style.setProperty("--srot", `${(y * 0.05).toFixed(2)}deg`);
      }

      // 2. Hero Section Parallax
      const hero = document.getElementById("hero");
      if (hero) {
        const hp = getP(hero).pr;
        if (hp > 0 && hp < 1) {
          const bg = document.querySelector<HTMLElement>(".backdrop");
          if (bg) {
            bg.style.transform = `translateY(${((0.5 - hp) * 90).toFixed(1)}px) scale(1.16)`;
          }
          document.querySelectorAll<HTMLElement>(".vg-h span").forEach((l, i) => {
            l.style.translate = `${(clamp(0.42 - hp, 0, 1) * -(i + 1) * 170).toFixed(1)}px 0`;
          });
          const flow = document.querySelector<HTMLElement>(".flow");
          if (flow) {
            flow.style.translate = `0 ${(clamp(0.5 - hp, -0.5, 0.5) * 110).toFixed(1)}px`;
          }
        }
      }

      // 3. Strata Section Parallax
      const strata = document.getElementById("strata");
      if (strata) {
        const sp = getP(strata).pr;
        if (sp > 0 && sp < 1) {
          const sm = document.querySelector<HTMLElement>(".s-media");
          if (sm) {
            sm.style.transform = `translateY(${((0.5 - sp) * 130).toFixed(1)}px) scale(${(0.92 + sp * 0.16).toFixed(3)})`;
          }
          const ca = document.querySelector<HTMLElement>(".s-card-a");
          const cb = document.querySelector<HTMLElement>(".s-card-b");
          if (ca) ca.style.translate = `0 ${((0.5 - sp) * 220).toFixed(1)}px`;
          if (cb) cb.style.translate = `0 ${((sp - 0.5) * 220).toFixed(1)}px`;
        }
      }

      // 4. Closing Video Section Parallax
      const closeSec = document.getElementById("bx-close");
      if (closeSec) {
        const c = getP(closeSec);
        const v = closeSec.querySelector<HTMLVideoElement>("video");
        const h2 = closeSec.querySelector<HTMLElement>("h2");
        if (v) v.style.transform = `scale(${(1.3 - c.pr * 0.3).toFixed(3)})`;
        if (h2) h2.style.transform = `scale(${(0.78 + clamp(c.pr * 2, 0, 1) * 0.22).toFixed(3)})`;
      }
    }

    function raf() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    }

    window.addEventListener("scroll", raf, { passive: true });
    window.addEventListener("resize", raf);
    raf();

    // Marquee Bands Continuous Animation with Scroll Velocity Boost
    let bandOffset = 0;
    let lastY = window.scrollY;
    let bandAnim: number;

    const bands = Array.from(document.querySelectorAll<HTMLElement>("[data-band] > div"));

    function runBands() {
      const curY = window.scrollY;
      const v = curY - lastY;
      lastY = curY;
      bandOffset += 0.9 + Math.min(Math.abs(v) * 0.5, 26);

      bands.forEach((b) => {
        const half = b.scrollWidth / 2 || 1;
        const x = bandOffset % half;
        const isRev = b.parentElement?.classList.contains("rev");
        b.style.transform = `translateX(${isRev ? x - half : -x}px)`;
      });

      bandAnim = requestAnimationFrame(runBands);
    }

    if (!reduce) {
      bandAnim = requestAnimationFrame(runBands);
    }

    return () => {
      clearTimeout(scanTimer1);
      clearTimeout(scanTimer2);
      clearTimeout(scanTimer3);
      if (io) io.disconnect();
      if (heroObserver) heroObserver.disconnect();
      if (strataObserver) strataObserver.disconnect();
      window.removeEventListener("scroll", raf);
      window.removeEventListener("resize", raf);
      if (bandAnim) cancelAnimationFrame(bandAnim);
      scanFnRef.current = null;
    };
  }, []);

  // 2. Secondary effect: Re-scans elements when category slug changes
  useEffect(() => {
    if (scanFnRef.current) {
      scanFnRef.current();
      const t = setTimeout(scanFnRef.current, 100);
      return () => clearTimeout(t);
    }
  }, [slug]);
}
