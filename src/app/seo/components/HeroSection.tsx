"use client";

import React, { useEffect, useRef, useState } from "react";
import { PageData, VG } from "../data";

interface Props {
  page: PageData;
  slug: string;
}

export function HeroSection({ page, slug }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [photoHidden, setPhotoHidden] = useState(false);

  const vg = VG[slug] || ["Search visibility", "built for the", "AI answer era"];

  // Canvas backdrop ribbon animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const heroEl = heroRef.current;
    if (!canvas || !heroEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function bez(a: number, b: number, c: number, d: number, t: number) {
      const m = 1 - t;
      return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d;
    }

    function bandPath(w: number, h: number, band: any, o: number) {
      const pts: [number, number][] = [];
      const n = 70;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const x = bez(band.x[0], band.x[1], band.x[2], band.x[3], t);
        const y = bez(band.y[0], band.y[1], band.y[2], band.y[3], t);
        const dx = bez(band.x[0], band.x[1], band.x[2], band.x[3], t + 0.001) - x;
        const dy = bez(band.y[0], band.y[1], band.y[2], band.y[3], t + 0.001) - y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const spread = band.w * (0.42 + 0.58 * Math.pow(Math.sin(Math.PI * (t * 0.92 + 0.05 + band.p)), 2));
        const off = (o - 0.5) * spread + 0.012 * Math.sin(t * 5 + o * 3 + band.p * 6);
        pts.push([(x - (dy / len) * off) * w, y * h + (dx / len) * off * w]);
      }
      return pts;
    }

    function stroke(pts: [number, number][]) {
      if (!ctx || pts.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    }

    function drawRibbon() {
      if (!canvas || !heroEl || !ctx) return;
      const w = heroEl.clientWidth || 1280;
      const h = heroEl.clientHeight || 800;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#060607";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      const narrow = w / h < 1;
      const bands = [
        { x: [-0.12, 0.12, 0.5, 1.12], y: narrow ? [0.62, 0.2, 0.06, 0.02] : [0.98, 0.3, 0.1, 0.06], w: 0.3, p: 0.05, c: ["#ff2fb3", "#a12bff", "#3f4dff"] },
        { x: [-0.14, 0.2, 0.58, 1.14], y: narrow ? [0.72, 0.3, 0.1, 0.08] : [1.12, 0.42, 0.16, 0.16], w: 0.24, p: 0.3, c: ["#ff4fa3", "#7a2bff", "#1f8bff"] },
        { x: [-0.1, 0.08, 0.42, 1.1], y: narrow ? [0.52, 0.12, 0.02, -0.04] : [0.82, 0.2, 0.02, -0.06], w: 0.16, p: 0.6, c: ["#c23bff", "#5a2bff", "#22b8ff"] }
      ];
      const strands = 220;
      bands.forEach((band) => {
        const g = ctx.createLinearGradient(0, h, w, 0);
        g.addColorStop(0.1, band.c[0]);
        g.addColorStop(0.5, band.c[1]);
        g.addColorStop(0.92, band.c[2]);
        ctx.strokeStyle = g;
        for (let s = 0; s <= strands; s++) {
          const o = s / strands;
          ctx.globalAlpha = 0.022 + 0.3 * Math.pow(o, 14);
          ctx.lineWidth = (o > 0.96 ? 2 : 9) * Math.max(1, w / 1586);
          stroke(bandPath(w, h, band, o));
        }
      });

      if ("filter" in ctx) {
        ctx.globalAlpha = 0.8;
        ctx.filter = `blur(${Math.round(w / 45)}px)`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = "none";
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    drawRibbon();
    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawRibbon, 120);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div className="hero" id="hero" ref={heroRef}>
      <div className="backdrop" aria-hidden="true">
        <canvas id="ribbon" ref={canvasRef} />
        {!photoHidden && (
          <img
            id="bg"
            alt=""
            src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/14718e72-5eb9-4186-a0c5-2339094b274d.webp"
            onError={() => setPhotoHidden(true)}
          />
        )}
      </div>

      <main className="main" style={{ flex: 1 }}>
        <div className="copy">
          <h2 className="vg-h" id="vg-title">
            <span data-in="line" id="vg1">{vg[0]}</span>
            <span data-in="line" id="vg2">{vg[1]}</span>
            <span data-in="line" id="vg3">{vg[2]}</span>
          </h2>
          <p className="sub" data-in="sub" id="vg-sub">
            {page.stmt}
          </p>
          <ul className="vg-list" data-in="sub" id="vg-list">
            {page.pains.slice(0, 3).map((x, i) => (
              <li key={i}>{x[1]}</li>
            ))}
          </ul>
          <p className="vg-more" data-in="sub" id="vg-more" />
          <div className="cta" data-in="cta">
            <a className="btn btn-primary" href="#bx-close">
              Am I being cited? Check free
              <span className="chip">
                <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 11l8-8M4.500 3H11v6.500" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
            <a className="btn btn-ghost" href="#bx-score">
              Score my AI search
            </a>
          </div>
          <p className="badge" data-in="badge">
            <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="7.500" stroke="currentColor" strokeWidth="1.500" />
              <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.500" />
            </svg>
            <span>SEO + AEO + GEO + LLMO. ONE SYSTEM.</span>
          </p>
        </div>

        <div className="flow" data-in="card">
          <div className="card">
            <div className="card-top">
              <h3 id="vg-ct">{page.name}</h3>
              <p id="vg-cp">{page.meta}</p>
            </div>
            <svg viewBox="0 72 640 300" role="img" id="vg-flow" aria-label={`${page.chips.join(", ")} pass through Beetrix360 and come out ready for SEO, AEO, GEO and LLMO.`}>
              {/* Stem: runs off the card's bottom edge */}
              <path className="wire" data-wire="out" pathLength="1" d="M320 263V480" />
              {/* Inputs into the hub */}
              <path className="wire" data-wire="in" pathLength="1" d="M182 120C232 120 222 215 272 215" />
              <path className="wire" data-wire="in" pathLength="1" d="M182 215H272" />
              <path className="wire" data-wire="in" pathLength="1" d="M182 310C232 310 222 215 272 215" />
              {/* Hub out to Clean */}
              <path className="wire" data-wire="out" pathLength="1" d="M368 215C418 215 408 120 458 120" />
              <path className="wire" data-wire="out" pathLength="1" d="M368 215H458" />
              <path className="wire" data-wire="out" pathLength="1" d="M368 215C418 215 408 310 458 310" />

              <g className="pill">
                <rect x="24" y="92" width="158" height="56" rx="28" />
                <text id="in0" x="103" y="127.5" textAnchor="middle">{page.chips[0] || "Technical"}</text>
              </g>
              <g className="pill">
                <rect x="24" y="187" width="158" height="56" rx="28" />
                <text id="in1" x="103" y="222.5" textAnchor="middle">{page.chips[1] || "Content"}</text>
              </g>
              <g className="pill">
                <rect x="24" y="282" width="158" height="56" rx="28" />
                <text id="in2" x="103" y="317.5" textAnchor="middle">{page.chips[2] || "Authority"}</text>
              </g>

              {/* Central Hub */}
              <g className="hub" id="hub">
                <rect x="272" y="167" width="96" height="96" rx="26" fill="#FFFFFF" />
                <svg x="284" y="179" width="72" height="72" viewBox="0 0 100 100">
                  <path d="M12,18 C12,13.5 15.5,10 20,10 L46,10 L46,23 C51,21 56,25 56,30 C56,35 51,39 46,37 L46,48 L35,48 C35,42 29,39 25,42 C21,45 23,48 23,48 L12,48 Z" fill="#2CB383" />
                  <path d="M12,52 L24,52 C24,46 33,46 33,52 L46,52 L46,65 C40,65 40,75 46,75 L46,88 L20,88 C15.5,88 12,84.5 12,80 Z" fill="#FAB12F" />
                  <path d="M50,52 L64,52 C64,58 73,58 73,52 L86,52 L86,80 C86,84.5 82.5,88 78,88 L50,88 L50,75 C44,75 44,65 50,65 Z" fill="#3ABEF9" />
                  <path d="M52,10 L78,10 C82.5,10 86,13.5 86,18 L86,44 L73,44 C73,50 64,50 64,44 L52,44 L52,35 C58,35 58,25 52,25 Z" fill="#DE2056" />
                </svg>
              </g>

              {/* Output Pills */}
              <g className="pill pass" data-clean="">
                <rect x="458" y="92" width="158" height="56" rx="28" />
                <path className="ico" d="M480 120.5l5 5 9.500-10.500" />
                <text className="outw" x="506" y="127.5">SEO</text>
              </g>
              <g className="pill pass" data-clean="">
                <rect x="458" y="187" width="158" height="56" rx="28" />
                <path className="ico" d="M480 215.5l5 5 9.500-10.500" />
                <text className="outw" x="506" y="222.5">AEO</text>
              </g>
              <g className="pill pass" data-clean="">
                <rect x="458" y="282" width="158" height="56" rx="28" />
                <path className="ico" d="M480 310.5l5 5 9.500-10.500" />
                <text className="outw" x="506" y="317.5">GEO + LLMO</text>
              </g>
            </svg>
            <div className="card-foot">
              <div>
                <b>SEO</b>
                <span>Ranked in search</span>
              </div>
              <div>
                <b>AEO</b>
                <span>Chosen as the answer</span>
              </div>
              <div>
                <b>GEO + LLMO</b>
                <span>Cited by AI models</span>
              </div>
            </div>
            <a className="card-cta" href="#fx-guide">
              See the full plan <i>→</i>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

