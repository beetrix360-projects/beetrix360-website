"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { Wordmark } from "@/components/ui";
import { Logo } from "@/components/site/Logo";
import { DEFAULT_BROCHURE_CONFIG, type BrochureConfig } from "@/lib/brochure";
import type { Division, SiteSettings, NavigationRecord } from "@/lib/types";

interface FooterProps {
  site: SiteSettings;
  navigation?: NavigationRecord | null;
  divisions: Division[];
}

export function Footer({ site, navigation, divisions }: FooterProps) {
  const pathname = usePathname();
  const [brochure, setBrochure] = useState<BrochureConfig>(DEFAULT_BROCHURE_CONFIG);

  useEffect(() => {
    fetch("/api/brochure")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.enabled === "boolean") {
          setBrochure(data);
        }
      })
      .catch((err) => {
        console.warn("[Footer] Could not fetch brochure config:", err);
      });
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const f = site.footer;
  return (
    <footer className="bg-white px-5 sm:px-8 lg:px-12 2xl:px-20 pt-16 pb-10">
      <div className="w-full mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-bx-border">
          <div className="lg:col-span-2">
            {/* <Wordmark className="text-2xl" /> */}
            <Logo />
            <p className="text-sm text-neutral-500 mt-3 max-w-xs">{f.tagline}</p>
            <div className="flex gap-1.5 mt-5" aria-hidden="true">
              <span className="w-8 h-1.5 rounded bg-bx-green" />
              <span className="w-8 h-1.5 rounded bg-bx-pink" />
              <span className="w-8 h-1.5 rounded bg-bx-yellow" />
              <span className="w-8 h-1.5 rounded bg-bx-blue" />
            </div>
          </div>
          <nav aria-label={f.exploreTitle}>
            <p className="text-[11px] font-mono uppercase text-neutral-400 mb-3">{f.exploreTitle}</p>
            <ul className="space-y-2 text-sm">
              {f.explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-bx-pink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-[11px] font-mono uppercase text-neutral-400 mb-3">{f.contactTitle}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`tel:${site.phone.tel}`} className="hover:text-bx-pink">
                  {site.phone.display}
                </a>
              </li>
              <li>{f.domainLabel}</li>
              <li>
                <Link href={f.bookHref} className="hover:text-bx-pink">
                  {f.bookLabel}
                </Link>
              </li>
              {brochure.enabled && (
              <div className="mt-7">
                <a
                  href="/api/brochure/download"
                  download={brochure.fileName || "Beetrix360-Corporate-Brochure.pdf"}
                  className="inline-flex items-center justify-center gap-3 px-6 sm:px-7 py-3 rounded-full bg-neutral-900 hover:bg-bx-pink text-white text-xs font-heading font-semibold tracking-wide transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap group"
                >
                  <i className="fa-solid fa-file-arrow-down text-bx-yellow text-sm group-hover:translate-y-0.5 transition-transform shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{brochure.buttonLabel || "Download E-Brochure"}</span>
                </a>
              </div>
            )}
            </ul>
          </div>
        </div>
        {/* Main navigation hubs: crawlable links to every primary division */}
        <nav aria-label="Services" className="py-6 border-b border-bx-border flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {(navigation?.menus || []).map((m) => (
            <Link key={m.viewAllPath} href={m.viewAllPath} className="text-neutral-500 hover:text-bx-pink transition">
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-neutral-400">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>{f.copyright}</span>
            <div className="flex items-center gap-4">
              {(navigation?.footerLegal || ["/privacy-policy", "/terms", "/cookie-policy"]).map((path) => {
                const label =
                  path === "/privacy-policy"
                    ? "Privacy Policy"
                    : path === "/terms"
                    ? "Terms"
                    : path === "/cookie-policy"
                    ? "Cookie Policy"
                    : path.replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <Link key={path} href={path} className="hover:text-bx-pink transition">
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
          <a href="#top" className="hover:text-bx-dark transition">
            {f.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
