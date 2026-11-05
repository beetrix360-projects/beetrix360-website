"use client";

import React, { useEffect, useRef } from "react";
import "./brand-social.css";
import { BrandSocialPageData } from "./data";
import { stage, LOGO } from "./render";

interface Props {
  pageData: BrandSocialPageData;
  htmlContent: string;
}

const MX: Record<string, [string, string, string[]]> = {
  "111": ["The Challenger", "Loud ideas, sharp edges, no apologies.", ["#E0225B", "#EBB22D", "#070913"]],
  "110": ["The Showman", "Big color with a classic grin.", ["#EBB22D", "#E0225B", "#FFFFFF"]],
  "101": ["The Disruptor", "Serious work with a bold new look.", ["#39C5EF", "#070913", "#E0225B"]],
  "100": ["The Authority", "Heavy, confident and built to last.", ["#070913", "#EBB22D", "#FFFFFF"]],
  "011": ["The Friend", "Warm, light and easy to talk to.", ["#2FB77E", "#EBB22D", "#FFFFFF"]],
  "010": ["The Storyteller", "Gentle charm with a timeless feel.", ["#EBB22D", "#2FB77E", "#070913"]],
  "001": ["The Specialist", "Quiet precision and clean lines.", ["#39C5EF", "#FFFFFF", "#070913"]],
  "000": ["The Trusted Advisor", "Calm, steady and proven.", ["#2FB77E", "#070913", "#FFFFFF"]],
};

const ROLES: Record<string, string[]> = {
  brand: ["Strategist", "Designer", "Copywriter", "Art director"],
  social: ["Social lead", "Creator", "Editor", "Community"],
  content: ["Writer", "Editor", "Designer", "Motion"],
};

const BT = "h1,.lead,.dom,.stage,.hr>.imgs,.onp,.logos .imgs,.sh h2,.sub,.prose>*,.band,.flip,.tile,.sw,.gauge,.mixc,.rg,.ph,.safe,.row,.card,.il button,.ip,details,.srch,.rel a,.lead-f,.final h2,.pair .imgs,.cw>.imgs,.fs>.imgs";
const HV = ".tile,.card,.flip,.ph,details,.imgs,.rel a,.gauge,.mixc,.row";

export function BrandSocialClient({ pageData, htmlContent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rawRoot = containerRef.current;
    if (!rawRoot || typeof window === "undefined") return;
    const root: HTMLElement = rawRoot;

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
        if (el) {
          el.textContent = (del || i > 0 ? qs[q] : s).slice(0, i);
        }
      }, 45);
    }
    startTyping();

    // 2. Scorecard Gauge
    function updateGauge() {
      const inputs = $$(".sw input") as HTMLInputElement[];
      const on = inputs.filter((input) => input.checked).length;
      const total = inputs.length || 6;
      const val = Math.round((on / total) * 100);

      const gv = $("[data-gv]");
      if (gv) {
        gv.style.strokeDashoffset = String(327 * (1 - val / 100));
      }
      const gn = $("[data-gn]");
      if (gn) gn.textContent = String(val);

      const gm = $("[data-gm]");
      if (gm) {
        gm.textContent =
          val < 40
            ? "Big gaps, big upside. Start with the foundations."
            : val < 80
            ? "Solid base. A few missing pieces are holding you back."
            : "Strong setup. Let's find the next gain.";
      }
    }
    updateGauge();

    // 3. Brief topics counter
    function updateBrief() {
      const selected = $$("[data-chip][aria-pressed=true]").map((x) => x.textContent?.trim() || "");
      const tr = $("[data-tray]");
      if (!tr) return;
      tr.hidden = selected.length === 0;

      const tt = $("[data-traytext]");
      if (tt) {
        tt.textContent = `${selected.length} ${selected.length === 1 ? "topic" : "topics"} added to your brief`;
      }

      const notes = $("#f-m") as HTMLTextAreaElement | null;
      if (notes) {
        notes.value = selected.length ? `Topics: ${selected.join(", ")}` : "";
      }
    }

    // 4. Brand Mixer
    function mix() {
      const getVal = (id: string) => {
        const el = $(`#x-${id}`) as HTMLInputElement | null;
        return el ? Number(el.value) : 50;
      };

      const mixBox = $("[data-mix]");
      if (!mixBox) return;

      const key = `${getVal("e") > 50 ? "1" : "0"}${getVal("t") > 50 ? "1" : "0"}${getVal("a") > 50 ? "1" : "0"}`;
      const item = MX[key] || MX["000"];

      const mn = $("[data-mn]");
      if (mn) mn.textContent = item[0];
      const mt = $("[data-mt]");
      if (mt) mt.textContent = item[1];

      const ms = $("[data-ms]");
      if (ms) {
        ms.innerHTML = item[2]
          .map((c) => `<i style="background:${c}"></i><small>${c}</small>`)
          .join("");
      }

      mixBox.style.setProperty("--mc", item[2][0]);
      mixBox.style.setProperty("--mw", String(400 + getVal("e") * 4));
      mixBox.style.setProperty("--mr", `${(getVal("t") / 100) * 32}px`);
      mixBox.style.setProperty("--mf", getVal("a") > 50 ? "var(--disp)" : "var(--ser)");
    }
    mix();

    // 5. Scroll Progress Bar & Brand Spine
    function prog() {
      const h = document.documentElement;
      const x = Math.min(1, window.scrollY / Math.max(1, h.scrollHeight - window.innerHeight));
      const b = root.querySelector<HTMLElement>(".bar i");
      if (b) b.style.transform = `scaleX(${x})`;
      root.querySelectorAll<SVGElement>(".spine .pz").forEach((e, i) => {
        e.classList.toggle("lit", x >= i * 0.25 + 0.02);
      });
    }
    window.addEventListener("scroll", prog, { passive: true });
    prog();

    // ----------------------------------------------------
    // 6. Multiplayer Cursor Swarm & Section Building Wipes
    // ----------------------------------------------------
    const SW: {
      c: any[];
      q: HTMLElement[];
      sels: any[];
      io: IntersectionObserver | null;
      intro: boolean;
      hov: HTMLElement | null;
      hs: any | null;
      mx: number;
      my: number;
      on: boolean;
      rafId: number | null;
      pumpTimer: any;
    } = {
      c: [],
      q: [],
      sels: [],
      io: null,
      intro: false,
      hov: null,
      hs: null,
      mx: -999,
      my: -999,
      on: false,
      rafId: null,
      pumpTimer: null,
    };

    function mkc(i: number, swarmEl: HTMLElement) {
      const cols = ["#e0225b", "#39c5ef", "#2fb77e", "#ebb22d", "#070913"];
      const col = cols[i % 5];
      const roles = ROLES[pageData.col] || ROLES.brand;
      const roleText = roles[i % roles.length];
      const e = document.createElement("div");
      e.className = "cur";
      e.innerHTML = `<svg viewBox="0 0 16 16"><path d="M1 1l5.2 14 2.2-5.8L14.5 7z" fill="${col}" stroke="#fff" stroke-width=".9"/></svg>${i < 4 ? `<span style="background:${col}" data-role="${i}">${roleText}</span>` : ""}`;
      swarmEl.append(e);

      const a = Math.random() * 6.28;
      const R = Math.max(window.innerWidth, window.innerHeight);
      return {
        e,
        x: window.innerWidth / 2 + Math.cos(a) * R,
        y: window.innerHeight / 2 + Math.sin(a) * R,
        vx: 0,
        vy: 0,
        lock: null as HTMLElement | null,
        ox: 0,
        oy: 0,
        ph: Math.random() * 6.28,
        sp: 0.5 + Math.random(),
        hx: Math.random(),
        hy: Math.random(),
      };
    }

    function placeSel(s: { el: HTMLElement; b: HTMLElement; l: HTMLElement }) {
      if (!s.el.isConnected) return;
      const r = s.el.getBoundingClientRect();
      const b = s.b;
      b.style.transform = `translate3d(${r.left - 3}px,${r.top - 3}px,0)`;
      b.style.width = `${r.width + 6}px`;
      b.style.height = `${r.height + 6}px`;
      s.l.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
    }

    function sel(el: HTMLElement, g?: boolean) {
      const swarmEl = root.querySelector("#swarm");
      if (!swarmEl) return null;
      const b = document.createElement("div");
      b.className = "sel";
      b.innerHTML = "<i></i><i></i><i></i><i></i><span></span>";
      swarmEl.append(b);
      const s = { el, b, l: b.querySelector("span") as HTMLElement };
      placeSel(s);
      SW.sels.push(s);
      if (g) {
        const r = el.getBoundingClientRect();
        const v = document.createElement("div");
        v.className = "gl";
        v.style.left = `${r.left}px`;
        swarmEl.append(v);
        setTimeout(() => v.remove(), 900);
      }
      return s;
    }

    function unsel(s: { el: HTMLElement; b: HTMLElement; l: HTMLElement } | null) {
      if (!s) return;
      s.b.remove();
      SW.sels = SW.sels.filter((x) => x !== s);
    }

    function grab(el: HTMLElement, n: number) {
      const free = SW.c.filter((c) => !c.lock).sort(() => Math.random() - 0.5).slice(0, n);
      free.forEach((c, i) => {
        c.lock = el;
        c.ox = [0, 1, 1, 0, 0.5][i % 5];
        c.oy = [0, 0, 1, 1, 0.5][i % 5];
      });
      return free;
    }

    function job(el: HTMLElement) {
      const cs = grab(el, 3);
      setTimeout(() => {
        el.classList.remove("pend");
        el.classList.add("wipe");
        const s = sel(el, /^H[12]$/.test(el.tagName));
        setTimeout(() => {
          unsel(s);
          cs.forEach((c) => {
            if (c.lock === el) c.lock = null;
          });
          el.classList.remove("wipe");
        }, 560);
      }, 190);
    }

    function pump() {
      if (SW.intro) return;
      let n = SW.q.length > 14 ? 4 : SW.q.length > 6 ? 2 : 1;
      while (n-- && SW.q.length) {
        const el = SW.q.shift();
        if (el) job(el);
      }
    }

    function tick(ts: number) {
      const t = ts / 1000;
      const W = window.innerWidth;
      const H = window.innerHeight;

      SW.c.forEach((c) => {
        let tx = 0, ty = 0, k = 0.018;
        if (SW.intro) {
          const a = t * 2 * c.sp + c.ph;
          const r = 70 + 30 * Math.sin(t * 3 + c.ph);
          tx = W / 2 + Math.cos(a) * r * 1.5;
          ty = H / 2 + Math.sin(a) * r;
          k = 0.04;
        } else if (c.lock && c.lock.isConnected) {
          const r = c.lock.getBoundingClientRect();
          tx = r.left + r.width * c.ox;
          ty = r.top + r.height * c.oy;
          k = 0.05;
        } else {
          const edge = c.hx < 0.5 ? c.hx * 0.24 : 1 - (1 - c.hx) * 0.24;
          tx = W * edge + Math.sin(t * c.sp + c.ph) * 50;
          ty = H * (0.12 + c.hy * 0.8) + Math.cos(t * c.sp * 0.8 + c.ph) * 50;
          const d = Math.hypot(SW.mx - c.x, SW.my - c.y);
          if (d < 260) {
            tx = SW.mx + Math.cos(c.ph + t) * 70;
            ty = SW.my + Math.sin(c.ph + t) * 70;
            k = 0.03;
          }
        }

        c.vx = (c.vx + (tx - c.x) * k) * 0.84;
        c.vy = (c.vy + (ty - c.y) * k) * 0.84;
        c.x += c.vx;
        c.y += c.vy;
        c.e.style.transform = `translate3d(${c.x}px,${c.y}px,0) rotate(${Math.max(-40, Math.min(40, c.vx * 2))}deg)`;
        c.e.style.opacity = c.lock || SW.intro ? "1" : "0.55";
      });

      SW.sels.forEach(placeSel);
      SW.rafId = requestAnimationFrame(tick);
    }

    function pend(intro?: boolean) {
      if (reduce || !("IntersectionObserver" in window)) return;
      if (SW.io) SW.io.disconnect();
      SW.q = [];
      SW.sels.forEach((s) => s.b.remove());
      SW.sels = [];
      SW.c.forEach((c) => (c.lock = null));

      SW.io = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) {
              SW.io?.unobserve(e.target);
              if ((e.target as HTMLElement).classList.contains("pend")) {
                SW.q.push(e.target as HTMLElement);
              }
            }
          });
        },
        { threshold: 0.12 }
      );

      $$(BT).forEach((e) => {
        e.classList.add("pend");
        SW.io?.observe(e);
      });

      const co = root.querySelector(".core");
      if (intro && co) {
        SW.intro = true;
        co.classList.add("in");
        setTimeout(() => {
          SW.intro = false;
          co.classList.remove("in");
        }, 1250);
      }
    }

    function flush() {
      $$(BT).forEach((e) => e.classList.remove("pend"));
      SW.q = [];
    }

    function swarmInit() {
      if (reduce || root.querySelector("#swarm")) return;
      const w = document.createElement("div");
      w.id = "swarm";
      w.setAttribute("aria-hidden", "true");
      w.innerHTML = `<div class="core">${LOGO("mark")}</div>`;
      root.appendChild(w);

      const n = window.innerWidth < 760 ? 12 : 26;
      SW.c = [];
      for (let i = 0; i < n; i++) {
        SW.c.push(mkc(i, w));
      }
      SW.on = true;
      SW.rafId = requestAnimationFrame(tick);
      clearInterval(SW.pumpTimer);
      SW.pumpTimer = setInterval(pump, 70);
    }

    if (!reduce) {
      swarmInit();
      pend(true);
    }

    // 7. Pointer Movement & Ruler Tracking
    const handlePointerMove = (e: PointerEvent) => {
      SW.mx = e.clientX;
      SW.my = e.clientY;

      const m = root.querySelector<HTMLElement>("[data-rm]");
      if (m) m.style.transform = `translateX(${e.clientX}px)`;

      const t = root.querySelector<HTMLElement>("[data-xy]");
      if (t) t.textContent = `x ${Math.round(e.clientX)}  y ${Math.round(e.clientY + window.scrollY)}`;

      const target = (e.target as HTMLElement)?.closest?.(".tile,.hero") as HTMLElement | null;
      if (target) {
        const r = target.getBoundingClientRect();
        target.style.setProperty("--x", `${e.clientX - r.left}px`);
        target.style.setProperty("--y", `${e.clientY - r.top}px`);
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // 8. Hover Lock onto Cards & Tiles
    const handlePointerOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce) return;
      const target = (e.target as HTMLElement)?.closest?.(HV) as HTMLElement | null;
      if (!target || target === SW.hov || target.classList.contains("pend")) return;
      if (SW.hs) {
        unsel(SW.hs.s);
        SW.hs.cs.forEach((k: any) => {
          k.lock = null;
        });
      }
      SW.hov = target;
      SW.hs = { s: sel(target), cs: grab(target, 2) };
    };

    const handlePointerOut = (e: PointerEvent) => {
      if (!SW.hs) return;
      const target = (e.target as HTMLElement)?.closest?.(HV) as HTMLElement | null;
      if (target && target === SW.hov && !target.contains(e.relatedTarget as Node)) {
        unsel(SW.hs.s);
        SW.hs.cs.forEach((k: any) => {
          k.lock = null;
        });
        SW.hs = null;
        SW.hov = null;
      }
    };
    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);

    // 9. Sticky TOC Scroll-Spy
    const sections = $$("section[id], div[id]");
    const tocLinks = $$(".toc a[href^='#']");
    const updateTocSpy = () => {
      const scrollPos = window.scrollY + 120;
      let currentSectionId = "";

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec.offsetTop <= scrollPos) {
          currentSectionId = sec.id;
          break;
        }
      }

      if (currentSectionId) {
        tocLinks.forEach((link) => {
          const href = link.getAttribute("href") || "";
          if (href === `#${currentSectionId}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    };
    window.addEventListener("scroll", updateTocSpy, { passive: true });

    // 10. Form & Input Event Handlers
    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.matches("[data-x]")) {
        mix();
        return;
      }
      if (target.id === "faq-q") {
        const query = (target as HTMLInputElement).value.toLowerCase().trim();
        let matchCount = 0;
        $$("[data-q]").forEach((d) => {
          const match = !query || (d.textContent || "").toLowerCase().includes(query);
          (d as HTMLElement).hidden = !match;
          if (match) {
            matchCount++;
            if (query) (d as HTMLDetailsElement).open = true;
          }
        });
        const noneEl = $("[data-none]");
        if (noneEl) noneEl.hidden = matchCount > 0;
        const faqn = $("[data-faqn]");
        if (faqn) faqn.textContent = `${matchCount} ${matchCount === 1 ? "question" : "questions"}`;
      }
    };
    root.addEventListener("input", handleInput);

    const handleChange = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest(".sw")) {
        updateGauge();
      }
    };
    root.addEventListener("change", handleChange);

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;

      if (form.matches("[data-dom]")) {
        const domainInput = form.querySelector('input[name="domain"]') as HTMLInputElement;
        const targetInput = $("#f-w") as HTMLInputElement;
        if (domainInput && targetInput) {
          targetInput.value = domainInput.value;
        }
        const startSec = $("#start");
        if (startSec) {
          startSec.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
          $("#f-n")?.focus({ preventScroll: true });
        }
        return;
      }

      if (form.matches("[data-lead]")) {
        const msg = $("[data-msg]");
        if (!form.checkValidity()) {
          const invalid = form.querySelector(":invalid") as HTMLInputElement;
          if (msg && invalid) {
            const label = invalid.labels?.[0]?.textContent || "required fields";
            msg.textContent = `Please complete ${label.trim()}.`;
          }
          invalid?.focus();
          return;
        }

        if (msg) {
          msg.textContent = "Thank you! Your blueprint request has been received. A strategist will contact you within 1 business day.";
        }
        form.reset();
      }
    };
    root.addEventListener("submit", handleSubmit);

    // 11. Click Delegation
    const handleClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const c = (s: string) => t.closest(s) as HTMLElement | null;
      let n: HTMLElement | null;

      // Rebuild and Skip controls
      if ((n = c("[data-rebuild]"))) {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        setTimeout(() => pend(true), 120);
        return;
      }

      if ((n = c("[data-skip]"))) {
        flush();
        return;
      }

      // Primary button cursor flocking
      if (SW.on && (n = c(".btn.pri"))) {
        const targetBtn = n;
        SW.c.forEach((k) => {
          k.lock = targetBtn;
          k.ox = Math.random();
          k.oy = Math.random();
        });
        setTimeout(() => {
          SW.c.forEach((k) => {
            if (k.lock === targetBtn) k.lock = null;
          });
        }, 750);
      }

      // Artboard stage switcher
      if ((n = c("[data-eng]"))) {
        const eng = n.dataset.eng;
        if (eng) {
          $$("[data-eng]").forEach((b) => b.setAttribute("aria-selected", String(b === n)));
          const r = $("[data-res]");
          if (r) {
            r.innerHTML = stage(pageData, eng);
            r.classList.remove("pop");
            void r.offsetWidth;
            r.classList.add("pop");
          }
        }
        return;
      }

      // Flip cards
      if ((n = c(".flip"))) {
        n.classList.toggle("on");
        n.setAttribute("aria-expanded", String(n.classList.contains("on")));
        return;
      }

      // Symptom tile selector
      if ((n = c(".tile"))) {
        const current = n.getAttribute("aria-pressed") === "true";
        n.setAttribute("aria-pressed", String(!current));
        const lock = $("[data-lock]");
        if (lock) {
          lock.textContent = String($$(".tile[aria-pressed=true]").length);
        }
        return;
      }

      // Brief topic chips
      if ((n = c("[data-chip]"))) {
        const current = n.getAttribute("aria-pressed") === "true";
        n.setAttribute("aria-pressed", String(!current));
        updateBrief();
        return;
      }

      // Rollout phases
      if ((n = c("[data-ph]"))) {
        $$("[data-ph]").forEach((b) => b.classList.toggle("on", b === n));
        const line = $("[data-line]");
        if (line && n.dataset.ph) {
          line.style.setProperty("--st", n.dataset.ph);
        }
        return;
      }

      // Side switcher (compare)
      if ((n = c("[data-side]"))) {
        const side = n.dataset.side;
        const cmp = $("[data-cmp]");
        if (cmp && side) cmp.dataset.cmp = side;
        $$("[data-side]").forEach((b) => b.setAttribute("aria-pressed", String(b === n)));
        return;
      }

      // Work filter
      if ((n = c("[data-f]"))) {
        $$("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(b === n)));
        const filter = n.dataset.f;
        $$(".card").forEach((card) => {
          (card as HTMLElement).hidden = !(filter === "all" || card.dataset.k === filter);
        });
        return;
      }

      // Work accordion card expand
      if ((n = c(".card"))) {
        const isOpen = n.classList.contains("open");
        $$(".card.open").forEach((k) => {
          k.classList.remove("open");
          k.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
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
      if (SW.rafId) cancelAnimationFrame(SW.rafId);
      clearInterval(SW.pumpTimer);
      clearInterval(typingTimer);
      if (SW.io) SW.io.disconnect();
      window.removeEventListener("scroll", prog);
      window.removeEventListener("scroll", updateTocSpy);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      root.removeEventListener("input", handleInput);
      root.removeEventListener("change", handleChange);
      root.removeEventListener("submit", handleSubmit);
      root.removeEventListener("click", handleClick);
      const swarmEl = root.querySelector("#swarm");
      if (swarmEl) swarmEl.remove();
    };
  }, [pageData]);

  return (
    <div
      ref={containerRef}
      className="bx-social-page"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
