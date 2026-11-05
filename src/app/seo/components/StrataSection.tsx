"use client";

import React, { useEffect, useRef, useState } from "react";
import { PageData } from "../data";

interface Props {
  page: PageData;
}

export function StrataSection({ page }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoHidden, setVideoHidden] = useState(false);
  const [stillHidden, setStillHidden] = useState(false);

  // Strata Canvas Drawing Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let last = 0;
    let inView = false;
    let videoLive = false;

    const A = 215;
    const C = 480;

    function P(u: number, v: number, z: number): [number, number] {
      return [C + (u - v) * A * 0.87, C + (u + v) * A * 0.5 - z];
    }

    function hash(i: number, j: number) {
      const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
      return s - Math.floor(s);
    }

    function diamond(z: number) {
      if (!ctx) return;
      const a = P(-1, -1, z);
      const b = P(1, -1, z);
      const c = P(1, 1, z);
      const d = P(-1, 1, z);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.lineTo(d[0], d[1]);
      ctx.closePath();
    }

    function slab(z: number, draw: (z: number) => void) {
      if (!ctx) return;
      const h = 13;
      const a = P(-1, 1, z);
      const b = P(1, 1, z);
      const c = P(1, -1, z);
      const side = ctx.createLinearGradient(a[0], 0, c[0], 0);
      side.addColorStop(0, "rgba(111,90,220,.34)");
      side.addColorStop(1, "rgba(100,235,225,.3)");
      ctx.fillStyle = side;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.lineTo(c[0], c[1] + h);
      ctx.lineTo(b[0], b[1] + h);
      ctx.lineTo(a[0], a[1] + h);
      ctx.closePath();
      ctx.fill();

      const top = ctx.createLinearGradient(C - 300, 0, C + 300, 0);
      top.addColorStop(0, "rgba(120,80,235,.2)");
      top.addColorStop(1, "rgba(90,235,225,.13)");
      ctx.fillStyle = top;
      diamond(z);
      ctx.fill();

      ctx.save();
      diamond(z);
      ctx.clip();
      draw(z);
      ctx.restore();

      const edge = ctx.createLinearGradient(C - 370, 0, C + 370, 0);
      edge.addColorStop(0, "rgba(170,140,255,.85)");
      edge.addColorStop(1, "rgba(160,245,235,.85)");
      ctx.strokeStyle = edge;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(130,200,255,.7)";
      ctx.shadowBlur = 16;
      diamond(z);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function haze(p: number) {
      return (z: number) => {
        if (!ctx) return;
        const c = P(0, 0, z);
        const g = ctx.createRadialGradient(c[0], c[1], 10, c[0], c[1], 300);
        g.addColorStop(0, `rgba(140,80,255,${0.62 + 0.16 * Math.sin(p * 6.283)})`);
        g.addColorStop(1, "rgba(90,40,200,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 960, 960);
      };
    }

    function pixels(p: number) {
      return (z: number) => {
        if (!ctx) return;
        const n = 11;
        const step = Math.floor(p * 15);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            const r = hash(i, j);
            if (r < 0.42) continue;
            const on = hash(i + step, j * 3 + step);
            const u0 = -1 + (2 * i) / n;
            const v0 = -1 + (2 * j) / n;
            const d = (2 / n) * 0.84;
            const a = P(u0, v0, z);
            const b = P(u0 + d, v0, z);
            const c = P(u0 + d, v0 + d, z);
            const e = P(u0, v0 + d, z);
            ctx.fillStyle = `${r > 0.72 ? "rgba(110,240,225," : "rgba(140,105,255,"}${0.14 + 0.62 * on})`;
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.lineTo(c[0], c[1]);
            ctx.lineTo(e[0], e[1]);
            ctx.fill();
          }
        }
      };
    }

    function waves(p: number) {
      return (z: number) => {
        if (!ctx) return;
        ctx.lineWidth = 1.7;
        for (let k = 0; k < 13; k++) {
          const v = -1 + (2 * k) / 12;
          ctx.strokeStyle = k % 2 ? "rgba(110,240,225,.7)" : "rgba(160,125,255,.75)";
          ctx.beginPath();
          for (let i = 0; i <= 44; i++) {
            const u = -1 + (2 * i) / 44;
            const q = P(u, v, z + 12 * Math.sin(u * 5 + v * 3 - p * 6.283));
            if (i) ctx.lineTo(q[0], q[1]);
            else ctx.moveTo(q[0], q[1]);
          }
          ctx.stroke();
        }
      };
    }

    function dots(p: number) {
      return (z: number) => {
        if (!ctx) return;
        const n = 15;
        for (let i = 0; i <= n; i++) {
          for (let j = 0; j <= n; j++) {
            const u = -1 + (2 * i) / n;
            const v = -1 + (2 * j) / n;
            let f = ((u + 1) / 2 + hash(j, 7) - p) % 1;
            if (f < 0) f += 1;
            const pulse = Math.pow(1 - Math.min(f, 1 - f) * 2, 8);
            const q = P(u, v, z);
            ctx.fillStyle = `rgba(165,250,240,${0.26 + 0.74 * pulse})`;
            ctx.beginPath();
            ctx.arc(q[0], q[1], 1.7 + 2.4 * pulse, 0, 6.283);
            ctx.fill();
          }
        }
      };
    }

    function render(ms: number) {
      if (!ctx) return;
      const p = (ms / 5000) % 1;
      const w = 6.283 * p;
      ctx.clearRect(0, 0, 960, 960);
      ctx.globalCompositeOperation = "lighter";
      slab(-205 + 7 * Math.sin(w + 2.6), haze(p));
      slab(-70 + 8 * Math.sin(w + 1.7), pixels(p));
      slab(65 + 8 * Math.sin(w + 0.9), waves(p));
      slab(200 + 9 * Math.sin(w), dots(p));
      ctx.globalCompositeOperation = "source-over";
    }

    function tick(ms: number) {
      frame = 0;
      if (!inView || videoLive) return;
      if (ms - last > 32) {
        last = ms;
        render(ms);
      }
      kick();
    }

    function kick() {
      if (!frame) frame = requestAnimationFrame(tick);
    }

    render(1200);

    const video = videoRef.current;
    if (video) {
      video.addEventListener("playing", () => {
        videoLive = true;
      });
    }

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window && rootRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          inView = entries[0].isIntersecting;
          if (inView) {
            if (video && !videoHidden) {
              const pr = video.play();
              if (pr && pr.catch) pr.catch(() => {});
            }
            kick();
          } else if (video && !videoHidden) {
            video.pause();
          }
        },
        { threshold: 0.02 }
      );
      observer.observe(rootRef.current);
    } else {
      inView = true;
      kick();
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
    };
  }, [videoHidden]);

  return (
    <section className="strata" id="strata" aria-labelledby="strata-title" ref={rootRef}>
      <div className="s-frame">
        <header className="s-head">
          <span className="s-brand" data-s="head">
            <span className="s-tile" aria-hidden="true">
              <svg viewBox="0 0 100 100">
                <path d="M12,18 C12,13.5 15.5,10 20,10 L46,10 L46,23 C51,21 56,25 56,30 C56,35 51,39 46,37 L46,48 L35,48 C35,42 29,39 25,42 C21,45 23,48 23,48 L12,48 Z" fill="#2CB383" />
                <path d="M12,52 L24,52 C24,46 33,46 33,52 L46,52 L46,65 C40,65 40,75 46,75 L46,88 L20,88 C15.5,88 12,84.5 12,80 Z" fill="#FAB12F" />
                <path d="M50,52 L64,52 C64,58 73,58 73,52 L86,52 L86,80 C86,84.5 82.5,88 78,88 L50,88 L50,75 C44,75 44,65 50,65 Z" fill="#3ABEF9" />
                <path d="M52,10 L78,10 C82.5,10 86,13.5 86,18 L86,44 L73,44 C73,50 64,50 64,44 L52,44 L52,35 C58,35 58,25 52,25 Z" fill="#DE2056" />
              </svg>
            </span>
            <span className="s-word">
              Beetrix<sup>360</sup>
            </span>
          </span>
        </header>

        <div className="s-copy">
          <h2 id="strata-title">
            <span className="s-ln">
              <span data-s="line">SEO + AEO +</span>
            </span>
            <span className="s-ln">
              <span data-s="line">GEO + LLMO</span>
            </span>
            <span className="s-ln">
              <span data-s="line">in one system.</span>
            </span>
          </h2>
          <p className="s-sub" data-s="sub">
            <span id="s-sub">{page.meta}</span>
          </p>
          <div className="s-cta">
            <a className="s-btn s-btn-a" href="#bx-close" data-s="primary">
              Build my AI search plan
            </a>
            <a className="s-btn s-btn-b s-glass" href="#bx-score" data-s="secondary">
              Score me first
            </a>
          </div>
          <p className="s-note" id="s-note">
            {page.sub}
          </p>
          <ul className="s-stats">
            <li data-s="stat">
              <b>+586%</b>
              <span>AI-search traffic</span>
            </li>
            <li data-s="stat">
              <b>+116%</b>
              <span>share of voice</span>
            </li>
            <li data-s="stat">
              <b>55+</b>
              <span>industries</span>
            </li>
          </ul>
        </div>

        <div className="s-art">
          <div className="s-media" aria-hidden="true">
            <canvas id="s-canvas" width="960" height="960" ref={canvasRef} />
            {!stillHidden && (
              <img
                id="s-still"
                alt=""
                src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/782a4a52-4c1e-4471-bb0c-aa232927f4a6.webp"
                onError={() => setStillHidden(true)}
              />
            )}
            {!videoHidden && (
              <video
                ref={videoRef}
                id="s-video"
                muted
                loop
                playsInline
                preload="auto"
                poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/782a4a52-4c1e-4471-bb0c-aa232927f4a6.webp"
                src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/435a4fe7-e43b-4e7c-af78-0be083e73569.mp4"
                onError={() => setVideoHidden(true)}
              />
            )}
          </div>

          <a className="s-card s-card-a s-glass" href="#bx-more" data-s="card">
            <span className="s-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.500" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <circle cx="4.500" cy="5.500" r="2" />
                <circle cx="19.500" cy="5.500" r="2" />
                <circle cx="4.500" cy="18.500" r="2" />
                <circle cx="19.500" cy="18.500" r="2" />
                <path d="M6 7l3.800 3M18 7l-3.800 3M6 17l3.800-3M18 17l-3.800-3" />
              </svg>
            </span>
            <p>
              <span className="s-kick" id="c0k">{page.group}</span>
              <span className="s-title" id="c0t">{page.name}</span>
            </p>
          </a>

          <a className="s-card s-card-b s-glass" href="#bx-more" data-s="card">
            <span className="s-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.500" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
                <path d="M3 21V5h3v2.500h3V5h6v2.500h3V5h3v16z" />
                <rect x="8.500" y="13" width="7" height="5.500" rx="1" />
                <path d="M10 13v-1.500a2 2 0 0 1 4 0V13" />
              </svg>
            </span>
            <p>
              <span className="s-kick" id="c1k">{page.chips.join(" · ")}</span>
              <span className="s-title" id="c1t">{page.stmt}</span>
            </p>
          </a>
        </div>

        <ul className="s-logos" aria-label="Industries">
          <li className="bi" data-s="logo">Heavy equipment</li>
          <li className="bi" data-s="logo">B2B SaaS</li>
          <li className="wide" data-s="logo">finance</li>
          <li className="bi" data-s="logo">REAL ESTATE</li>
        </ul>
      </div>
    </section>
  );
}

