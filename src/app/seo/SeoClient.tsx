"use client";

import React, { useEffect, useRef } from "react";
import "./seo-pages.css";
import { SeoPageData } from "./data";
import { stage } from "./render";

interface Props {
  pageData: SeoPageData;
  htmlContent: string;
}

export function SeoClient({ pageData, htmlContent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || typeof window === "undefined") return;

    const $ = (s: string, r?: Element | Document) => (r || root).querySelector<HTMLElement>(s);
    const $$ = (s: string, r?: Element | Document) => [...(r || root).querySelectorAll<HTMLElement>(s)];
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let typingTimer: any = null;

    // 1. Search Bar Typing Animation
    function startTyping() {
      clearInterval(typingTimer);
      const el = $("[data-typed]");
      if (!el || reduce) return;
      const qs = pageData.q;
      if (!qs || qs.length === 0) return;

      let q = 0;
      let i = qs[0].length;
      let del = false;
      let hold = 26;

      typingTimer = setInterval(() => {
        if (hold > 0) {
          hold--;
          return;
        }
        const s = qs[q];
        if (del) {
          i--;
          if (i <= 0) {
            del = false;
            q = (q + 1) % qs.length;
          }
        } else {
          i++;
          if (i >= qs[q].length) {
            del = true;
            hold = 30;
          }
        }
        el.textContent = (del || i > 0 ? qs[q] : s).slice(0, i);
      }, 45);
    }

    // 2. Scorecard Gauge
    function updateGauge() {
      const inputs = $$(".sw input");
      const on = inputs.filter((inp) => (inp as HTMLInputElement).checked).length;
      const t = inputs.length || 6;
      const v = Math.round((on / t) * 100);
      const gv = $("[data-gv]");
      if (!gv) return;
      gv.style.strokeDashoffset = String(327 * (1 - v / 100));
      const gn = $("[data-gn]");
      if (gn) gn.textContent = String(v);
      const gm = $("[data-gm]");
      if (gm) {
        gm.textContent =
          v < 40
            ? "Big gaps, big upside. Start with the foundations."
            : v < 80
            ? "Solid base. A few missing pieces are holding you back."
            : "Strong setup. Let's find the next gain.";
      }
    }

    // 3. Brief & Topic Chips
    function updateBrief() {
      const c = $$("[data-chip][aria-pressed=true]").map((x) => x.textContent?.trim() || "");
      const tr = $("[data-tray]");
      if (!tr) return;
      tr.hidden = !c.length;
      const trayText = $("[data-traytext]");
      if (trayText) {
        trayText.textContent = c.length + (c.length === 1 ? " topic" : " topics") + " added to your brief";
      }
      const fm = $("#f-m") as HTMLInputElement | null;
      if (fm) {
        fm.value = c.length ? "Topics: " + c.join(", ") : "";
      }
    }

    // 4. Active TOC Link Scroll Spy
    const sectionIds = ["guide", "fixes", "included", "score", "rollout", "work", "faq"];
    function updateTocSpy() {
      const scrollY = window.scrollY;
      const navOffset = 140;
      let currentSectionId = "";

      for (const id of sectionIds) {
        const sec = document.getElementById(id);
        if (sec) {
          const top = sec.offsetTop;
          if (scrollY >= top - navOffset) {
            currentSectionId = id;
          }
        }
      }

      $$(".toc a:not(.btn)").forEach((link) => {
        const href = link.getAttribute("href");
        if (href === `#${currentSectionId}`) {
          link.classList.add("on");
        } else {
          link.classList.remove("on");
        }
      });
    }

    // Initialize state
    updateGauge();
    startTyping();
    updateTocSpy();

    window.addEventListener("scroll", updateTocSpy, { passive: true });

    // Event Listeners on Container
    const handlePointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest(".tile, .hero") as HTMLElement | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty("--x", e.clientX - r.left + "px");
      target.style.setProperty("--y", e.clientY - r.top + "px");
    };
    root.addEventListener("pointermove", handlePointerMove, { passive: true });

    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.id === "faq-q") {
        const q = (target as HTMLInputElement).value.toLowerCase().trim();
        let n = 0;
        $$("[data-q]").forEach((d) => {
          const m = !q || (d.textContent || "").toLowerCase().includes(q);
          (d as HTMLElement).hidden = !m;
          if (m) {
            n++;
            if (q) (d as HTMLDetailsElement).open = true;
          }
        });
        const noneEl = $("[data-none]");
        if (noneEl) noneEl.hidden = n > 0;
        const faqnEl = $("[data-faqn]");
        if (faqnEl) faqnEl.textContent = n + (n === 1 ? " question" : " questions");
      }
    };
    root.addEventListener("input", handleInput);

    const handleChange = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".sw")) {
        updateGauge();
      }
    };
    root.addEventListener("change", handleChange);

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      const f = e.target as HTMLFormElement;
      if (f.matches("[data-dom]")) {
        const fw = $("#f-w") as HTMLInputElement | null;
        const domIn = f.elements.namedItem("domain") as HTMLInputElement | null;
        if (fw && domIn) fw.value = domIn.value;
        const startSec = document.getElementById("start");
        if (startSec) {
          startSec.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
          $("#f-n")?.focus({ preventScroll: true });
        }
        return;
      }
      if (f.matches("[data-lead]")) {
        const m = $("[data-msg]");
        if (!f.checkValidity()) {
          const bad = f.querySelector<HTMLInputElement>(":invalid");
          if (m && bad && bad.labels?.[0]?.firstChild) {
            m.textContent = "Please complete " + bad.labels[0].firstChild.textContent + ".";
          }
          bad?.focus();
          return;
        }

        const formData = new FormData(f);
        const payload = {
          name: formData.get("name")?.toString() || "",
          email: formData.get("email")?.toString() || "",
          whatsapp: formData.get("whatsapp")?.toString() || "",
          website: formData.get("website")?.toString() || "",
          goal: formData.get("goal")?.toString() || pageData.short || "AI search",
          budget: formData.get("budget")?.toString() || "",
          notes: formData.get("notes")?.toString() || "",
          pageUrl: window.location.href,
          sectionName: "SEO Page Blueprint Section (#start)",
          buttonName: "Get my blueprint",
        };

        if (m) m.textContent = "Sending your inquiry...";

        fetch("/api/inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then((r) => {
            if (!r.ok) throw new Error();
            f.reset();
            if (m) m.textContent = "Thank you! We've received your request and will reply within 1 business day.";
          })
          .catch(() => {
            if (m) m.textContent = "Could not send right now. Please call +1 (424) 441-6042 or message us on WhatsApp.";
          });
        return;
      }
    };
    root.addEventListener("submit", handleSubmit);

    const handleClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const c = (s: string) => t.closest<HTMLElement>(s);
      let n: HTMLElement | null;

      // Search engine tab switching
      if ((n = c("[data-eng]"))) {
        $$("[data-eng]").forEach((b) => b.setAttribute("aria-selected", String(b === n)));
        const eng = n.dataset.eng;
        const r = $("[data-res]");
        if (r && eng) {
          r.innerHTML = stage(pageData, eng);
          r.classList.remove("pop");
          void r.offsetWidth;
          r.classList.add("pop");
        }
        return;
      }

      // Flip symptom cards
      if ((n = c(".flip"))) {
        n.classList.toggle("on");
        n.setAttribute("aria-expanded", String(n.classList.contains("on")));
        return;
      }

      // Bento tiles
      if ((n = c(".tile"))) {
        const isPressed = n.getAttribute("aria-pressed") !== "true";
        n.setAttribute("aria-pressed", String(isPressed));
        const lockCount = $("[data-lock]");
        if (lockCount) {
          lockCount.textContent = String($$(".tile[aria-pressed=true]").length);
        }
        return;
      }

      // Topic chips
      if ((n = c("[data-chip]"))) {
        const isPressed = n.getAttribute("aria-pressed") !== "true";
        n.setAttribute("aria-pressed", String(isPressed));
        updateBrief();
        return;
      }

      // 90-day rollout phases
      if ((n = c("[data-ph]"))) {
        $$("[data-ph]").forEach((b) => b.classList.toggle("on", b === n));
        const line = $("[data-line]");
        if (line && n.dataset.ph) {
          line.style.setProperty("--st", n.dataset.ph);
        }
        return;
      }

      // Compare switcher
      if ((n = c("[data-side]"))) {
        const cmp = $("[data-cmp]");
        if (cmp && n.dataset.side) {
          cmp.dataset.cmp = n.dataset.side;
        }
        $$("[data-side]").forEach((b) => b.setAttribute("aria-pressed", String(b === n)));
        return;
      }

      // Work filter buttons
      if ((n = c("[data-f]"))) {
        $$("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(b === n)));
        const f = n.dataset.f;
        $$(".card").forEach((k) => {
          k.hidden = !(f === "all" || k.dataset.k === f);
        });
        return;
      }

      // Expandable case study cards
      if ((n = c(".card"))) {
        const wasOpen = n.classList.contains("open");
        $$(".card.open").forEach((k) => {
          k.classList.remove("open");
          k.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          n.classList.add("open");
          n.setAttribute("aria-expanded", "true");
        }
        return;
      }

      // Industry tabs
      if ((n = c("[data-i]"))) {
        $$("[data-i]").forEach((b) => b.setAttribute("aria-selected", String(b === n)));
        $$("[data-ip]").forEach((p) => p.classList.toggle("on", p.dataset.ip === n?.dataset.i));
        return;
      }

      // Anchor smooth scrolling
      if ((n = c('a[href^="#"]'))) {
        const href = n.getAttribute("href") || "";
        const targetId = href.slice(1);
        if (targetId) {
          const el = document.getElementById(targetId);
          if (el) {
            e.preventDefault();
            const yOffset = -90;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
            if (targetId === "start") {
              $("#f-n")?.focus({ preventScroll: true });
            }
          }
        }
      }
    };
    root.addEventListener("click", handleClick);

    return () => {
      clearInterval(typingTimer);
      window.removeEventListener("scroll", updateTocSpy);
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("input", handleInput);
      root.removeEventListener("change", handleChange);
      root.removeEventListener("submit", handleSubmit);
      root.removeEventListener("click", handleClick);
    };
  }, [pageData]);

  return (
    <div
      ref={containerRef}
      className="bx-seo-page"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
