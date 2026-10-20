"use client";

import { useEffect } from "react";
import { ensureLenis, finePointer, gsap, prefersReducedMotion, scrollToTarget, ScrollTrigger } from "@/lib/client-runtime";

/**
 * Homepage motion and interactions, ported from the <script> in beetrix360_homepage_v6.html.
 * The markup is server-rendered (so crawlers and no-JS visitors get all content); this component
 * only enhances it after hydration. Everything is created inside a gsap.context and torn down on
 * unmount, so client-side navigation away from the homepage leaves nothing running.
 */
export function HomeAnimations() {
  useEffect(() => {
    const reduce = prefersReducedMotion();
    const fine = finePointer();
    const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
    const $$ = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)];
    const lenis = ensureLenis();

    const cleanups: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(
      el: EventTarget | null,
      type: K | string,
      fn: (e: HTMLElementEventMap[K]) => void,
      opts?: AddEventListenerOptions,
    ) => {
      if (!el) return;
      el.addEventListener(type, fn as EventListener, opts);
      cleanups.push(() => el.removeEventListener(type, fn as EventListener, opts));
    };
    const timers: number[] = [];
    const intervals: number[] = [];
    let rafStop = () => {};

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      /* ---------- 1. pinned stacking pillar cards (first, so later triggers account for pin spacing) ---------- */
      mm.add("(min-width: 1024px)", () => {
        const cards = $$(".stack-card");
        const steps = $$("#stack-steps [data-step]");
        const setStep = (i: number) => steps.forEach((s, k) => s.classList.toggle("active", k === i));
        setStep(0);
        if (reduce) {
          $("#stack")?.classList.add("static-stack");
          steps.forEach((s) => s.classList.add("active"));
          return;
        }
        gsap.set(cards, { transformOrigin: "50% 0%", filter: "brightness(1)" });
        gsap.set(cards.slice(1), { yPercent: 125, rotate: 6 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: "#pillars",
            pin: true,
            start: "top top",
            end: () => "+=" + window.innerHeight * 3,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress * 3;
              setStep(Math.min(3, Math.round(p)));
              steps.forEach((s, k) => {
                const fill = s.querySelector<HTMLElement>(".sfill");
                if (fill) fill.style.transform = `scaleX(${gsap.utils.clamp(0, 1, p - k + 1)})`;
              });
            },
          },
        });
        for (let i = 1; i < cards.length; i++) {
          tl.to(cards[i], { yPercent: 0, rotate: 0, duration: 1 }, i - 1);
          tl.to(
            cards.slice(0, i),
            {
              scale: (k: number) => 1 - (i - k) * 0.06,
              y: (k: number) => -(i - k) * 26,
              filter: (k: number) => `brightness(${1 - (i - k) * 0.07})`,
              duration: 1,
            },
            i - 1,
          );
        }
        const st = tl.scrollTrigger!;
        steps.forEach((s, i) => {
          s.onclick = () => scrollToTarget(st.start + (st.end - st.start) * (i / 3) + 2);
        });
      });
      mm.add("(max-width: 1023px)", () => {
        if (reduce) return;
        $$(".stack-card").forEach((card) =>
          gsap.from(card, { y: 80, opacity: 0, rotate: 3, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 92%" } }),
        );
      });

      /* ---------- loader + hero intro ---------- */
      const loader = $("#loader");
      // Hidden rather than removed: the node belongs to React.
      const hideLoader = () => loader && (loader.style.display = "none");
      if (reduce || !loader) hideLoader();
      else {
        lenis?.stop();
        gsap
          .timeline({
            defaults: { ease: "expo.out" },
            onComplete: () => {
              lenis?.start();
              hideLoader();
            },
          })
          .from("#loader .lp", { scale: 0, rotate: -90, opacity: 0, transformOrigin: "50% 50%", stagger: 0.09, duration: 0.6, ease: "back.out(2)" })
          .to("#loader", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "+=.25")
          .from(".hero-title .wi", { yPercent: 115, rotate: 5, duration: 1.1, stagger: 0.05 }, "-=.45")
          .from(".rot-word:first-child", { yPercent: 110, duration: 1 }, "-=.8")
          .from(".hero-fade", { y: 30, opacity: 0, stagger: 0.08, duration: 0.9 }, "-=.85")
          .from(".hero-visual", { scale: 0.9, opacity: 0, rotate: 2, duration: 1.2 }, "-=1.1");
      }

      /* ---------- text + block reveals ---------- */
      if (!reduce) {
        $$("[data-split]:not(.hero-title)").forEach((el) =>
          gsap.from(el.querySelectorAll(".wi"), {
            yPercent: 115,
            rotate: 4,
            duration: 1,
            ease: "expo.out",
            stagger: 0.045,
            scrollTrigger: { trigger: el, start: "top 88%" },
          }),
        );
        $$("[data-reveal]").forEach((el) =>
          gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }),
        );
        $$("[data-stagger]").forEach((g) =>
          gsap.from(g.children, {
            y: 70,
            opacity: 0,
            rotateX: -12,
            duration: 1,
            ease: "expo.out",
            stagger: 0.1,
            scrollTrigger: { trigger: g, start: "top 85%" },
          }),
        );
      }

      /* ---------- scroll-scrubbed statement ---------- */
      $$("[data-scrub]").forEach((el) => {
        if (reduce) return;
        const ws = el.querySelectorAll(".wi");
        gsap.set(ws, { opacity: 0.12 });
        gsap.to(ws, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 40%", scrub: true } });
      });

      /* ---------- counters ---------- */
      $$("[data-count]").forEach((el) => {
        const end = parseFloat(el.dataset.count || "0");
        const dec = +(el.dataset.decimals || 0);
        const pre = el.dataset.prefix || "";
        const suf = el.dataset.suffix || "";
        const fmt = (v: number) =>
          pre + v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
        if (reduce) {
          el.textContent = fmt(end);
          return;
        }
        const o = { v: 0 };
        el.textContent = fmt(0);
        ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          once: true,
          onEnter: () =>
            gsap.to(o, {
              v: end,
              duration: 2.2,
              ease: "power3.out",
              delay: el.closest(".hero-fade") ? 1.6 : 0,
              onUpdate: () => {
                el.textContent = fmt(o.v);
              },
            }),
        });
      });

      /* ---------- parallax ---------- */
      if (!reduce)
        $$("[data-speed]").forEach((el) => {
          const s = parseFloat(el.dataset.speed || "0");
          gsap.to(el, {
            y: () => -s * 160,
            ease: "none",
            scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
          });
        });

      /* ---------- hero mouse parallax ---------- */
      if (!reduce && fine) {
        const blobs = $$(".blob").map((b, i) => ({
          x: gsap.quickTo(b, "x", { duration: 1.2 }),
          y: gsap.quickTo(b, "y", { duration: 1.2 }),
          f: i ? -30 : 40,
        }));
        on(window, "mousemove", (e: MouseEvent) => {
          const nx = e.clientX / innerWidth - 0.5;
          const ny = e.clientY / innerHeight - 0.5;
          blobs.forEach((b) => {
            b.x(nx * b.f);
            b.y(ny * b.f);
          });
        });
      }

      /* ---------- velocity-reactive marquee (markup is already duplicated server-side) ---------- */
      const mq = $("#marquee");
      if (mq && !reduce) {
        const loop = gsap.to(mq, { xPercent: -50, repeat: -1, duration: 30, ease: "none" });
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const v = Math.min(6, 1 + Math.abs(self.getVelocity()) / 400);
            gsap.to(loop, { timeScale: v, duration: 0.25, overwrite: true });
            gsap.to(loop, { timeScale: 1, duration: 1, delay: 0.3 });
          },
        });
      }

      /* ---------- flip cards (tap / keyboard) ---------- */
      $$(".flip").forEach((c) => {
        on(c, "click", () => c.classList.toggle("flipped"));
        on(c, "keydown", (e: KeyboardEvent) => {
          if (e.target !== c) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            c.classList.toggle("flipped");
          }
        });
      });

      /* ---------- pipeline path ---------- */
      const nodes = $$(".pnode");
      mm.add("(min-width: 1024px)", () => {
        const path = $<SVGPathElement>("#pipe-path");
        const dot = $<SVGCircleElement>("#pipe-dot");
        if (!path || !dot) return;
        const len = path.getTotalLength();
        const th = [0, 0.33, 0.66, 0.98];
        const apply = (p: number) => {
          path.style.strokeDashoffset = String(len * (1 - p));
          const pt = path.getPointAtLength(len * p);
          dot.setAttribute("cx", String(pt.x));
          dot.setAttribute("cy", String(pt.y));
          nodes.forEach((n, i) => n.classList.toggle("active", p >= th[i]));
        };
        path.style.strokeDasharray = String(len);
        if (reduce) {
          apply(1);
          return;
        }
        apply(0);
        ScrollTrigger.create({ trigger: "#pipeline-viz", start: "top 70%", end: "bottom 55%", scrub: 0.6, onUpdate: (s) => apply(s.progress) });
      });
      mm.add("(max-width: 1023px)", () => {
        nodes.forEach((n) => {
          if (reduce) {
            n.classList.add("active");
            return;
          }
          ScrollTrigger.create({
            trigger: n,
            start: "top 75%",
            onEnter: () => n.classList.add("active"),
            onLeaveBack: () => n.classList.remove("active"),
          });
        });
      });

      /* ---------- GEO: share-of-voice bars + typed chat ---------- */
      $$(".sov-bar").forEach((b) => {
        if (reduce) return;
        gsap.fromTo(b, { width: 0 }, { width: b.dataset.w, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: "#sov", start: "top 85%" } });
      });
      const qEl = $("#chat-q");
      const aEl = $("#chat-a");
      const think = $("#chat-thinking");
      const caret = $("#chat-caret");
      if (qEl && aEl && think && caret) {
        const question = qEl.dataset.text || qEl.textContent || "";
        if (reduce) caret.style.display = "none";
        else {
          qEl.textContent = "";
          gsap.set(aEl, { opacity: 0 });
          const runChat = () => {
            let i = 0;
            const tick = () => {
              qEl.textContent = question.slice(0, ++i);
              if (i < question.length) timers.push(window.setTimeout(tick, 28));
              else {
                caret.style.display = "none";
                think.classList.remove("hidden");
                think.classList.add("flex");
                timers.push(
                  window.setTimeout(() => {
                    think.style.display = "none";
                    gsap.fromTo(aEl, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" });
                  }, 1100),
                );
              }
            };
            tick();
          };
          ScrollTrigger.create({ trigger: "#chat-q", start: "top 80%", once: true, onEnter: runChat });
        }
      }

      /* ---------- compare slider ---------- */
      const cmp = $(".compare");
      const cr = $<HTMLInputElement>("#compare-range");
      if (cmp && cr) {
        const setPos = (v: number | string) => cmp.style.setProperty("--pos", v + "%");
        on(cr, "input", () => setPos(cr.value));
        if (!reduce) {
          const o = { v: 85 };
          ScrollTrigger.create({
            trigger: cmp,
            start: "top 70%",
            once: true,
            onEnter: () =>
              gsap.to(o, {
                v: 50,
                duration: 1.6,
                ease: "expo.inOut",
                onUpdate: () => {
                  setPos(o.v);
                  cr.value = String(o.v);
                },
              }),
          });
          setPos(85);
          cr.value = "85";
        }
      }

      /* ---------- tilt cards ---------- */
      if (!reduce && fine)
        $$("[data-tilt]").forEach((c) => {
          c.style.transformStyle = "preserve-3d";
          on(c, "mousemove", (e: MouseEvent) => {
            const r = c.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(c, { rotateY: x * 10, rotateX: -y * 10, y: -6, transformPerspective: 900, duration: 0.5, ease: "power2.out" });
          });
          on(c, "mouseleave", () => gsap.to(c, { rotateY: 0, rotateX: 0, y: 0, duration: 0.7, ease: "elastic.out(1,.5)" }));
        });

      /* ---------- real estate strip ---------- */
      const strip = $("#re-strip");
      if (strip) {
        on($("#re-next"), "click", () => strip.scrollBy({ left: 340, behavior: "smooth" }));
        on($("#re-prev"), "click", () => strip.scrollBy({ left: -340, behavior: "smooth" }));
        let down = false;
        let sx = 0;
        let sl = 0;
        on(strip, "pointerdown", (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          down = true;
          sx = e.clientX;
          sl = strip.scrollLeft;
          strip.style.scrollSnapType = "none";
          strip.style.cursor = "grabbing";
        });
        on(window, "pointerup", () => {
          if (!down) return;
          down = false;
          strip.style.scrollSnapType = "";
          strip.style.cursor = "";
        });
        on(strip, "pointermove", (e: PointerEvent) => {
          if (down) strip.scrollLeft = sl - (e.clientX - sx);
        });
        if (!reduce)
          gsap.from("#re-strip figure", { x: 120, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: strip, start: "top 88%" } });
      }

      /* ---------- ROI calculator ---------- */
      const rT = $<HTMLInputElement>("#r-team");
      const rS = $<HTMLInputElement>("#r-share");
      const rC = $<HTMLInputElement>("#r-cost");
      const fteEl = $("#r-fte");
      if (rT && rS && rC && fteEl) {
        const tpl = fteEl.dataset.template || "{fte}";
        const disp = { h: 0, s: 0 };
        const ring = $("#r-ring")!;
        const setText = (id: string, t: string) => {
          const el = document.getElementById(id);
          if (el) el.textContent = t;
        };
        const draw = () => {
          setText("r-hours", Math.round(disp.h).toLocaleString("en-US"));
          setText("r-save", "$" + Math.round(disp.s).toLocaleString("en-US"));
        };
        const calc = (animate = true) => {
          const team = +rT.value;
          const share = +rS.value / 100;
          const cost = +rC.value;
          setText("r-team-v", String(team));
          setText("r-share-v", rS.value + "%");
          setText("r-cost-v", "$" + cost);
          const hours = Math.round(team * 2080 * share * 0.5);
          const save = hours * cost;
          const fte = hours / 2080;
          fteEl.textContent = tpl.replace("{fte}", fte.toFixed(1));
          const r = Math.min(1, (share * 0.5) / 0.3);
          if (reduce || !animate) {
            disp.h = hours;
            disp.s = save;
            draw();
            ring.style.strokeDashoffset = String(326.7 * (1 - r));
            return;
          }
          gsap.to(disp, { h: hours, s: save, duration: 0.8, ease: "power3.out", onUpdate: draw, overwrite: true });
          gsap.to(ring, { strokeDashoffset: 326.7 * (1 - r), duration: 0.8, ease: "power3.out" });
        };
        [rT, rS, rC].forEach((r) => on(r, "input", () => calc()));
        if (reduce) calc(false);
        else {
          calc(false);
          disp.h = 0;
          disp.s = 0;
          setText("r-hours", "0");
          setText("r-save", "$0");
          ring.style.strokeDashoffset = "326.7";
          ScrollTrigger.create({ trigger: "#roi", start: "top 60%", once: true, onEnter: () => calc() });
        }
      }

      /* ---------- timeline ---------- */
      const tlSteps = $$(".tl-step");
      if (reduce) {
        const fill = $("#tl-fill");
        if (fill) fill.style.transform = "scaleY(1)";
        tlSteps.forEach((s) => s.classList.add("active"));
      } else {
        gsap.to("#tl-fill", { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#timeline", start: "top 60%", end: "bottom 60%", scrub: true } });
        tlSteps.forEach((s) => {
          ScrollTrigger.create({
            trigger: s,
            start: "top 62%",
            onEnter: () => s.classList.add("active"),
            onLeaveBack: () => s.classList.remove("active"),
          });
          gsap.from(s.children, { x: 40, opacity: 0, stagger: 0.08, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 85%" } });
        });
      }

      /* ---------- contact form (front-end only, as in the design) ---------- */
      const ctaForm = $<HTMLFormElement>("#cta-form");
      const ctaSuccess = $("#cta-success");
      on(ctaForm, "submit", (e: SubmitEvent) => {
        e.preventDefault();
        if (!ctaForm || !ctaSuccess) return;
        if (reduce) {
          ctaForm.classList.add("hidden");
          ctaSuccess.classList.remove("hidden");
          return;
        }
        gsap.to(ctaForm, {
          opacity: 0,
          y: -20,
          duration: 0.4,
          onComplete: () => {
            ctaForm.classList.add("hidden");
            ctaSuccess.classList.remove("hidden");
            gsap.from(ctaSuccess, { opacity: 0, scale: 0.9, duration: 0.6, ease: "back.out(2)" });
          },
        });
      });

      /* ---------- hero: rotating word ---------- */
      const rw = $$(".rot-word");
      if (rw.length > 1 && !reduce) {
        gsap.set(rw.slice(1), { yPercent: 110, visibility: "visible" });
        let ri = 0;
        timers.push(
          window.setTimeout(() => {
            intervals.push(
              window.setInterval(() => {
                const cur = rw[ri];
                ri = (ri + 1) % rw.length;
                const nx = rw[ri];
                gsap.to(cur, { yPercent: -110, duration: 0.75, ease: "expo.inOut" });
                gsap.fromTo(nx, { yPercent: 110 }, { yPercent: 0, duration: 0.75, ease: "expo.inOut" });
              }, 2400),
            );
          }, 2600),
        );
      }

      /* ---------- hero: particle field that reacts to the mouse ---------- */
      const hero = $("#hero");
      const cvs = $<HTMLCanvasElement>("#hero-canvas");
      let heroBurst: (x: number, y: number) => void = () => {};
      if (hero && cvs) {
        const c2d = cvs.getContext("2d")!;
        const cols = ["#DE2056", "#2CB383", "#FAB12F", "#3ABEF9"];
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        type P = { x: number; y: number; vx: number; vy: number; bvx: number; bvy: number; r: number; c: string; life: number };
        let W = 0;
        let H = 0;
        let parts: P[] = [];
        const mouse = { x: -9999, y: -9999 };
        let running = false;
        const mk = (x: number, y: number, vx?: number, vy?: number, life?: number): P => {
          const bvx = (Math.random() - 0.5) * 0.5;
          const bvy = (Math.random() - 0.5) * 0.5;
          return { x, y, vx: vx ?? bvx, vy: vy ?? bvy, bvx, bvy, r: Math.random() * 2 + 1.3, c: cols[(Math.random() * 4) | 0], life: life ?? Infinity };
        };
        const resize = () => {
          W = hero.offsetWidth;
          H = hero.offsetHeight;
          cvs.width = W * dpr;
          cvs.height = H * dpr;
          c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
          const n = Math.round(Math.min(95, (W * H) / 15000));
          parts = Array.from({ length: n }, () => mk(Math.random() * W, Math.random() * H));
        };
        const draw = () => {
          c2d.clearRect(0, 0, W, H);
          for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < 150 && d > 0) {
              const f = ((150 - d) / 150) * 0.7;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
            if (p.life === Infinity) {
              p.vx += (p.bvx - p.vx) * 0.04;
              p.vy += (p.bvy - p.vy) * 0.04;
              p.x += p.vx;
              p.y += p.vy;
              if (p.x < 0) p.x = W;
              if (p.x > W) p.x = 0;
              if (p.y < 0) p.y = H;
              if (p.y > H) p.y = 0;
            } else {
              p.vx *= 0.94;
              p.vy *= 0.94;
              p.x += p.vx;
              p.y += p.vy;
              if (--p.life <= 0) {
                parts.splice(i, 1);
                continue;
              }
            }
          }
          c2d.lineWidth = 1;
          for (let i = 0; i < parts.length; i++) {
            const a = parts[i];
            for (let j = i + 1; j < parts.length; j++) {
              const b = parts[j];
              const d = Math.hypot(a.x - b.x, a.y - b.y);
              if (d < 110) {
                c2d.strokeStyle = `rgba(10,10,10,${(1 - d / 110) * 0.09})`;
                c2d.beginPath();
                c2d.moveTo(a.x, a.y);
                c2d.lineTo(b.x, b.y);
                c2d.stroke();
              }
            }
            const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
            if (dm < 210) {
              c2d.strokeStyle = a.c;
              c2d.globalAlpha = (1 - dm / 210) * 0.55;
              c2d.beginPath();
              c2d.moveTo(a.x, a.y);
              c2d.lineTo(mouse.x, mouse.y);
              c2d.stroke();
              c2d.globalAlpha = 1;
            }
          }
          for (const p of parts) {
            c2d.fillStyle = p.c;
            c2d.globalAlpha = p.life === Infinity ? 0.8 : Math.min(1, p.life / 40);
            c2d.beginPath();
            c2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            c2d.fill();
          }
          c2d.globalAlpha = 1;
        };
        let raf = 0;
        const loop = () => {
          if (!running) return;
          draw();
          raf = requestAnimationFrame(loop);
        };
        resize();
        if (reduce) draw();
        else {
          const io = new IntersectionObserver(([en]) => {
            const was = running;
            running = en.isIntersecting;
            if (running && !was) loop();
          });
          io.observe(hero);
          let rt = 0;
          on(window, "resize", () => {
            clearTimeout(rt);
            rt = window.setTimeout(resize, 200);
          });
          on(window, "load", resize);
          rafStop = () => {
            running = false;
            cancelAnimationFrame(raf);
            io.disconnect();
            clearTimeout(rt);
          };
          heroBurst = (x, y) => {
            for (let i = 0; i < 26; i++) {
              const a = Math.random() * Math.PI * 2;
              const s = Math.random() * 5 + 2;
              parts.push(mk(x, y, Math.cos(a) * s, Math.sin(a) * s, 50 + Math.random() * 40));
            }
          };
        }
        const spot = $("#spot");
        on(hero, "mousemove", (e: MouseEvent) => {
          const r = hero.getBoundingClientRect();
          mouse.x = e.clientX - r.left;
          mouse.y = e.clientY - r.top;
          spot?.style.setProperty("--mx", mouse.x + "px");
          spot?.style.setProperty("--my", mouse.y + "px");
        });
        on(hero, "mouseleave", () => {
          mouse.x = mouse.y = -9999;
        });
        on(hero, "click", (e: MouseEvent) => {
          if ((e.target as HTMLElement).closest("a,button,input,form,#puzzle-stage")) return;
          const r = hero.getBoundingClientRect();
          heroBurst(e.clientX - r.left, e.clientY - r.top);
        });
      }

      /* ---------- hero: 3D puzzle that tilts, unlocks and spins ---------- */
      const stage = $("#puzzle-stage");
      if (stage && hero) {
        const tilt = $("#puzzle-tilt")!;
        const pieces = $$("#puzzle-stage .hp");
        const lbls = $$("#puzzle-stage .hp-label");
        if (reduce) gsap.set(lbls, { opacity: 1 });
        else {
          const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3" });
          const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3" });
          const pq = pieces.map((p) => ({
            x: gsap.quickTo(p, "x", { duration: 0.7, ease: "power3" }),
            y: gsap.quickTo(p, "y", { duration: 0.7, ease: "power3" }),
            dx: +(p.dataset.x || 0),
            dy: +(p.dataset.y || 0),
          }));
          let explode = 0;
          let mx = 0;
          let my = 0;
          const apply = () =>
            pq.forEach((q, i) => {
              q.x(q.dx * explode + mx * (2 + i));
              q.y(q.dy * explode + my * (2 + i));
            });
          const unlock = (onState: boolean) => {
            explode = onState ? 8 : 0;
            apply();
            gsap.to(lbls, {
              opacity: onState ? 1 : 0,
              scale: onState ? 1 : 0.7,
              duration: 0.45,
              stagger: 0.05,
              ease: onState ? "back.out(2.5)" : "power2.in",
              overwrite: true,
            });
          };
          on(hero, "mousemove", (e: MouseEvent) => {
            const r = stage.getBoundingClientRect();
            const nx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
            const ny = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
            ry(nx * 34);
            rx(-ny * 34);
            mx = nx * 5;
            my = ny * 5;
            apply();
          });
          on(hero, "mouseleave", () => {
            rx(0);
            ry(0);
            mx = my = 0;
            apply();
          });
          on(stage, "mouseenter", () => unlock(true));
          on(stage, "mouseleave", () => unlock(false));
          on(stage, "click", () => {
            gsap.fromTo(pieces, { rotation: 0 }, { rotation: 360, transformOrigin: "50% 50%", duration: 1.1, stagger: 0.08, ease: "expo.inOut" });
            const r = stage.getBoundingClientRect();
            const h = hero.getBoundingClientRect();
            heroBurst(r.left - h.left + r.width / 2, r.top - h.top + r.height / 2);
            if (!fine) {
              unlock(true);
              timers.push(window.setTimeout(() => unlock(false), 1800));
            }
          });
          if (!fine) {
            gsap.to(tilt, { rotationY: 16, rotationX: -10, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
            let st = false;
            intervals.push(
              window.setInterval(() => {
                st = !st;
                unlock(st);
              }, 2200),
            );
          }
          // a teaser so visitors discover the interaction
          gsap.delayedCall(3.4, () => {
            unlock(true);
            gsap.delayedCall(1.3, () => {
              if (!stage.matches(":hover")) unlock(false);
            });
          });
        }
      }

      /* ---------- floating CTA ---------- */
      const fc = $("#float-cta");
      if (fc) {
        let pastHero = false;
        let atEnd = false;
        const syncFc = () => fc.classList.toggle("show", pastHero && !atEnd);
        ScrollTrigger.create({
          trigger: "#hero",
          start: "bottom 30%",
          onEnter: () => {
            pastHero = true;
            syncFc();
          },
          onLeaveBack: () => {
            pastHero = false;
            syncFc();
          },
        });
        ScrollTrigger.create({
          trigger: "#contact",
          start: "top 85%",
          onEnter: () => {
            atEnd = true;
            syncFc();
          },
          onLeaveBack: () => {
            atEnd = false;
            syncFc();
          },
        });
      }

      /* ---------- chapter dots ---------- */
      $$<HTMLAnchorElement>("#chapters a").forEach((a) => {
        const sec = document.querySelector(a.getAttribute("href") || "");
        if (sec)
          ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 55%", onToggle: (s) => a.classList.toggle("active", s.isActive) });
      });

      /* ---------- CTA bands: icon pop on enter ---------- */
      if (!reduce)
        $$(".cta-band .cta-icon").forEach((ic) =>
          gsap.from(ic, { scale: 0, rotate: -45, duration: 0.8, ease: "back.out(2.5)", scrollTrigger: { trigger: ic, start: "top 90%" } }),
        );

      /* ---------- headline underline marks, kinetic text, image wipes ---------- */
      $$(".mark").forEach((m) => {
        if (reduce) {
          m.classList.add("on");
          return;
        }
        ScrollTrigger.create({ trigger: m, start: "top 85%", onEnter: () => m.classList.add("on") });
      });
      $$(".kin-track").forEach((t) => {
        if (reduce) return;
        const d = +(t.dataset.dir || 1);
        gsap.fromTo(
          t,
          { xPercent: d > 0 ? 0 : -33.333 },
          { xPercent: d > 0 ? -33.333 : 0, ease: "none", scrollTrigger: { trigger: t.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } },
        );
        gsap.from(t.querySelectorAll(".kin-word"), {
          yPercent: 60,
          opacity: 0,
          stagger: 0.05,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: t.parentElement, start: "top 90%" },
        });
      });
      if (!reduce)
        $$(".ph").forEach((p) => {
          if (p.closest("#stack") || p.closest("#hero") || p.closest("[role=dialog]")) return;
          gsap.fromTo(
            p,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", scrollTrigger: { trigger: p, start: "top 90%" } },
          );
        });

      ScrollTrigger.sort();
    });

    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") requestAnimationFrame(refresh);
    else on(window, "load", refresh);

    return () => {
      ctx.revert();
      mm.revert();
      cleanups.forEach((fn) => fn());
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      rafStop();
      lenis?.start();
    };
  }, []);

  return null;
}
