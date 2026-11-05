"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  NAV,
  NAV_LINKS,
  TOP,
  PAGES,
  ENGINES,
  CLIENTS,
  TAIL,
  PageData,
} from "../data";

interface Props {
  page: PageData;
  slug: string;
  onSelectSlug: (slug: string) => void;
}

const SLOTS = [
  { o: 1, d: 270, r: 177, s: 58, rad: 20, g: "#A068FF" },
  { o: 2, d: 60, r: 251, s: 58, g: "#FFD24D" },
  { o: 2, d: 180, r: 251, s: 78, g: "#FF6FC8" },
  { o: 2, d: 300, r: 251, s: 58, rad: 20, g: "#5AA2FF" },
  { o: 3, d: 130, r: 325, s: 88, g: "#FF6FC8" },
  { o: 4, d: 30, r: 399, s: 58, g: "#A068FF" },
  { o: 4, d: 95, r: 399, s: 88, rad: 24, g: "#FF9A4D" },
  { o: 4, d: 220, r: 399, s: 88, rad: 24, g: "#FF6FC8" },
  { o: 4, d: 320, r: 399, s: 58, g: "#A068FF" },
];

const ORBITS: Record<number, [number, string, number]> = {
  1: [353, "mtLeft", 30],
  2: [501, "mtRight", 40],
  3: [649, "mtRight", 50],
  4: [797, "mtLeft", 60],
};

function useCountUp(target: number, duration: number, delay: number) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const timer = setTimeout(() => {
      function step(now: number) {
        if (!start) start = now;
        const p = Math.min((now - start) / duration, 1);
        setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return val;
}

function TypewriterHeading({ text, split, speed = 35, delay = 400 }: { text: string; split: number; speed?: number; delay?: number }) {
  const [n, setN] = useState(0);
  const timer = useRef<any>(null);

  useEffect(() => {
    setN(0);
    let i = 0;
    function next() {
      i += 1;
      setN(i);
      if (i < text.length) timer.current = setTimeout(next, speed);
    }
    timer.current = setTimeout(next, delay);
    return () => clearTimeout(timer.current);
  }, [text, speed, delay]);

  const typing = n < text.length;

  return (
    <h1 aria-label={text}>
      <span aria-hidden="true">
        {text.slice(0, Math.min(n, split))}
        {n > split && <span className="mt-w">{text.slice(split, n)}</span>}
        {typing && <span className="mt-caret" />}
        {typing && <span className="mt-rest">{text.slice(n)}</span>}
      </span>
    </h1>
  );
}

function Tile({ a, i, label }: { a: typeof SLOTS[0]; i: number; label: string }) {
  const orbit = ORBITS[a.o];
  return (
    <div
      className="mt-av"
      style={{
        width: a.s,
        height: a.s,
        transform: `translate(-50%, -50%) rotate(${a.d}deg) translate(${a.r}px) rotate(${-a.d}deg)`,
      }}
    >
      <div style={{ animation: `${orbit[1] === "mtLeft" ? "mtRight " : "mtLeft "}${orbit[2]}s linear infinite` }}>
        <span className="mt-av-in" style={{ animationDelay: `${(0.6 + i * 0.2125).toFixed(2)}s` }}>
          <span
            className="mt-av-box mt-tile"
            style={{
              width: a.s,
              height: a.s,
              borderRadius: a.rad || "50%",
              boxShadow: `0 0 26px ${a.g}`,
            }}
          >
            {label}
          </span>
        </span>
      </div>
    </div>
  );
}

function OrbitComponent({ n, labels, center }: { n: number; labels: string[]; center?: React.ReactNode }) {
  const o = ORBITS[n];
  const size = o[0];
  const members = SLOTS.filter((a) => a.o === n).map((a, i) => (
    <Tile key={i} a={a} i={i} label={labels[i] || ""} />
  ));

  return (
    <div
      className="mt-orbit"
      style={{
        width: size,
        height: size,
        margin: `${-size / 2}px 0 0 ${-size / 2}px`,
      }}
    >
      <div className="mt-spin" style={{ animation: `${o[1]} ${o[2]}s linear infinite` }}>
        <div className="mt-ring" />
        {center && (
          <div className="mt-center" style={{ animation: `mtRight ${o[2]}s linear infinite` }}>
            {center}
          </div>
        )}
        {members}
      </div>
    </div>
  );
}

function Circles({ page }: { page: PageData }) {
  const count = useCountUp(586, 2000, 1200);
  const labels = page.chips.concat(ENGINES);
  const center = (
    <>
      <b>+{count}%</b>
      <span>AI-search traffic</span>
    </>
  );

  return (
    <div className="mt-circles">
      <div className="mt-field" role="img" aria-label="+586% AI-search traffic">
        <OrbitComponent n={4} labels={labels} />
        <OrbitComponent n={3} labels={labels} />
        <OrbitComponent n={2} labels={labels} />
        <OrbitComponent n={1} labels={labels} center={center} />
      </div>
    </div>
  );
}

function Cycle() {
  const [idx, setIdx] = useState(0);
  const verbs = ["Check your citations", "Score your AI search", "Get your 90-day plan"];

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((prev) => (prev + 1) % verbs.length);
    }, 2400);
    return () => clearInterval(t);
  }, [verbs.length]);

  return <span>{verbs[idx]}</span>;
}

export function MarketeamHeader({ page, slug, onSelectSlug }: Props) {
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const hoverTimer = useRef<any>(null);

  const hover = {
    onMouseEnter: () => {
      clearTimeout(hoverTimer.current);
      setOpen(true);
    },
    onMouseLeave: () => {
      hoverTimer.current = setTimeout(() => setOpen(false), 240);
    },
  };

  useEffect(() => {
    function key(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        setOpen(false);
        setDrawer(false);
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const dark = page.h1.join(" ") + " ";
  const tickerItems = Array(4)
    .fill(CLIENTS)
    .flat()
    .map((c, i) => (
      <div className="mt-brand" key={i} aria-hidden={i >= CLIENTS.length ? "true" : undefined}>
        <span>{c}</span>
      </div>
    ));

  return (
    <div className="mt-app">
      {/* Header bar */}
      <header className="mt-header">
        <div className="mt-left-head">
          <Link href="/" className="mt-brandmark flex items-center gap-2" aria-label="Beetrix360 home">
            <svg viewBox="0 0 100 100" width="28" height="28" aria-hidden="true">
              <path d="M12,18 C12,13.5 15.5,10 20,10 L46,10 L46,23 C51,21 56,25 56,30 C56,35 51,39 46,37 L46,48 L35,48 C35,42 29,39 25,42 C21,45 23,48 23,48 L12,48 Z" fill="#2CB383" />
              <path d="M12,52 L24,52 C24,46 33,46 33,52 L46,52 L46,65 C40,65 40,75 46,75 L46,88 L20,88 C15.5,88 12,84.5 12,80 Z" fill="#FAB12F" />
              <path d="M50,52 L64,52 C64,58 73,58 73,52 L86,52 L86,80 C86,84.5 82.5,88 78,88 L50,88 L50,75 C44,75 44,65 50,65 Z" fill="#3ABEF9" />
              <path d="M52,10 L78,10 C82.5,10 86,13.5 86,18 L86,44 L73,44 C73,50 64,50 64,44 L52,44 L52,35 C58,35 58,25 52,25 Z" fill="#DE2056" />
            </svg>
            <span className="font-heading font-extrabold text-white text-xl">
              Beetrix<span className="text-[#DE2056]">360</span>
            </span>
          </Link>

          <nav className="mt-nav" aria-label="Main">
            <button
              className="mt-navbtn"
              type="button"
              aria-expanded={open}
              aria-controls="mt-mega"
              onClick={() => setOpen(!open)}
              {...hover}
            >
              AI Search &amp; SEO
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M2 4l4 4 4-4" />
              </svg>
            </button>
            {TOP.map((l) => (
              <Link className="mt-link" href={l[1]} key={l[0]}>
                {l[0]}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-right-head">
          <div className="btn-border-wrap mt-join">
            <a className="mt-btn" href="#bx-close">
              <span>Free AI Audit</span>
            </a>
          </div>
          <button
            className="mt-burger"
            type="button"
            aria-label="Open menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>

        {/* Mega Menu Dropdown */}
        {open && (
          <div
            className="mt-mega"
            id="mt-mega"
            onClick={() => setOpen(false)}
            {...hover}
          >
            {Object.keys(NAV).map((groupTitle) => (
              <div key={groupTitle}>
                <h3>{groupTitle}</h3>
                <ul>
                  {NAV[groupTitle].map((s) => (
                    <li key={s}>
                      <a
                        href={`#${s}`}
                        data-slug={s}
                        aria-current={s === slug ? "page" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectSlug(s);
                          setOpen(false);
                        }}
                      >
                        {PAGES[s]?.name || s}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {Object.keys(NAV_LINKS).map((groupTitle) => (
              <div key={groupTitle}>
                <h3>{groupTitle}</h3>
                <ul>
                  {NAV_LINKS[groupTitle].map((l) => (
                    <li key={l[0]}>
                      <Link href={l[1]}>{l[0]}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Drawer */}
        {drawer && (
          <div
            className="mt-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onClick={(ev) => {
              if ((ev.target as HTMLElement).closest("a")) setDrawer(false);
            }}
          >
            <div className="mt-drawer-top">
              <span className="mt-brandmark" style={{ color: "#fff" }}>
                Beetrix<span style={{ color: "#DE2056" }}>360</span>
              </span>
              <button
                className="mt-burger"
                style={{ display: "grid" }}
                type="button"
                autoFocus
                aria-label="Close menu"
                onClick={() => setDrawer(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {Object.keys(NAV).map((groupTitle) => (
              <div key={groupTitle} className="mb-4">
                <h3 className="text-sm uppercase tracking-wider text-neutral-400 font-bold mb-2">{groupTitle}</h3>
                <ul className="space-y-1.5">
                  {NAV[groupTitle].map((s) => (
                    <li key={s}>
                      <a
                        href={`#${s}`}
                        data-slug={s}
                        className={`block py-1 ${s === slug ? "text-bx-pink font-bold" : "text-white"}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectSlug(s);
                          setDrawer(false);
                        }}
                      >
                        {PAGES[s]?.name || s}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <h3>More</h3>
            {TOP.map((l) => (
              <Link href={l[1]} key={l[0]} className="block py-1 text-white">
                {l[0]}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Hero Content */}
      <main className="mt-main">
        <div className="mt-hero-left">
          <nav className="mt-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <a
              href="#seo"
              data-slug="seo"
              onClick={(e) => {
                e.preventDefault();
                onSelectSlug("seo");
              }}
            >
              AI Search &amp; SEO
            </a>
            {slug !== "seo" && (
              <>
                <span>/</span>
                <span aria-current="page">{page.name}</span>
              </>
            )}
          </nav>

          <TypewriterHeading text={dark + TAIL} split={dark.length} speed={35} delay={400} />

          <p className="mt-lead">{page.sub}</p>

          <ul className="mt-points">
            {page.incl.slice(0, 3).map((x) => (
              <li key={x[0]}>{x[0]}</li>
            ))}
          </ul>

          <div className="mt-start">
            <div className="btn-border-wrap">
              <a className="mt-btn mt-btn-lg" href="#bx-close">
                <Cycle />
                <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          <a className="mt-sec" href="#bx-score">
            Score me in 20 seconds →
          </a>

          <p className="mt-free">Free · takes 2 minutes · covers SEO, AEO, GEO and LLMO</p>

          <div className="mt-pointer" aria-hidden="true">
            <svg viewBox="0 0 26 26">
              <path d="M3 2.500l20 8.200-8.700 2.700-3.300 8.600z" fill="#A068FF" />
            </svg>
            <span>Is this you?</span>
          </div>
        </div>

        <Circles page={page} />
      </main>

      {/* Trust & Ticker */}
      <p className="mt-trust">
        Trusted by teams at Tesla Solar, Microsoft and Subway, across 55+ industries and $10B+ in generated pipeline
      </p>
      <div className="mt-ticker">
        <div className="mt-track">{tickerItems}</div>
      </div>
    </div>
  );
}

