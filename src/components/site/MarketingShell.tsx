"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Modals } from "./Modals";
import { SiteRuntime } from "./SiteRuntime";
import type { Division, SiteSettings } from "@/lib/types";

interface Props {
  site: SiteSettings;
  divisions: Division[];
  children: React.ReactNode;
}

export function MarketingShell({ site, divisions, children }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <div className="min-h-screen bg-[#f8fafc] text-neutral-900 antialiased">{children}</div>;
  }

  return (
    <>
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-full"
      >
        Skip to content
      </a>
      <div id="cursor" aria-hidden="true" />
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none" aria-hidden="true">
        <div id="progress" className="h-full bg-gradient-to-r from-bx-blue via-bx-pink to-bx-yellow" />
      </div>
      <Navbar site={site} />
      <main id="top">{children}</main>
      <Footer site={site} divisions={divisions} />
      <Modals modal={site.modal} video={site.videoModal} />
      <SiteRuntime />
    </>
  );
}
