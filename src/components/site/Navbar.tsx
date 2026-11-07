"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { SiteSettings, NavigationRecord, NavigationMenu, NavigationGroup } from "@/lib/types";
import { computeGroupSpan } from "@/lib/types";
import { Logo } from "./Logo";

interface NavbarProps {
  site: SiteSettings;
  navigation?: NavigationRecord | null;
}

export function Navbar({ site, navigation }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRefs = useRef<(HTMLElement | null)[]>([]);

  // Measurement refs for dynamic zero-overlap detection
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const middleColRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const measureNavRef = useRef<HTMLDivElement>(null);
  const [useMobileMenu, setUseMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle Escape key to close dropdown and return focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openDropdown !== null) {
        const btn = triggerRefs.current[openDropdown];
        setOpenDropdown(null);
        btn?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openDropdown]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const menus = navigation?.menus || [];
  const cta = navigation?.cta || { label: "Get a proposal", path: "/get-a-proposal" };

  // Dynamic layout measurement: guarantees menu fits with at least 32px room on both sides
  useEffect(() => {
    const checkFit = () => {
      if (!containerRef.current) return;
      const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
      // Below 1150px is mobile / tablet portrait / small landscape -> use mobile drawer
      if (windowWidth < 1150) {
        setUseMobileMenu(true);
        return;
      }

      const containerWidth = containerRef.current.clientWidth;
      const logoWidth = logoRef.current?.offsetWidth || 140;
      const ctaBtn = ctaRef.current?.querySelector("[data-cta]") as HTMLElement | null;
      const ctaWidth = ctaBtn?.offsetWidth || 120;
      const menuWidth = navRef.current?.scrollWidth || measureNavRef.current?.offsetWidth || 770;

      // Available middle space between logo and CTA with grid gap margin
      const availableMiddle = containerWidth - logoWidth - ctaWidth - 48;
      const fits = availableMiddle >= menuWidth;

      setUseMobileMenu(!fits);
    };

    checkFit();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(() => {
        checkFit();
      });
      ro.observe(containerRef.current);
    }

    window.addEventListener("resize", checkFit);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", checkFit);
    };
  }, [menus]);

  const handleMouseEnter = (idx: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(idx);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  const toggleDropdown = (idx: number) => {
    setOpenDropdown(openDropdown === idx ? null : idx);
  };

  return (
    <header
      id="site-nav"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        mobileMenuOpen
          ? `inset-0 h-dvh bg-white flex flex-col ${useMobileMenu ? "" : "min-[1150px]:block min-[1150px]:inset-x-0 min-[1150px]:bottom-auto min-[1150px]:h-[76px] min-[1150px]:bg-white/80 min-[1150px]:backdrop-blur-sm"} border-b border-neutral-200`
          : scrolled || openDropdown !== null
          ? "bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-sm"
          : "bg-white/80 backdrop-blur-sm border-b border-neutral-100"
      }`}
      onMouseLeave={handleMouseLeave}
    >
      {/* Three-column grid bar: auto (Logo) | 1fr (Menu centered) | auto (Actions) */}
      <div
        ref={containerRef}
        className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 xl:px-8 2xl:px-10 h-[76px] shrink-0 grid grid-cols-[auto_1fr_auto] items-center gap-3 xl:gap-6 2xl:gap-8"
      >
        {/* Col 1: Brand Wordmark & Animated Logo */}
        <div ref={logoRef} className="flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 xl:gap-2.5 2xl:gap-3 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bx-pink rounded-lg"
            aria-label={`${site.name} home`}
          >
            <Logo floating />
          </Link>
        </div>

        {/* Col 2: Desktop Mega Menu Navigation (centered in middle column, never narrower than content) */}
        <div
          ref={middleColRef}
          className={`min-w-0 flex justify-center items-center ${
            useMobileMenu ? "hidden" : "hidden min-[1150px]:flex"
          }`}
        >
          <nav
            ref={navRef}
            className="flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 flex-nowrap shrink-0"
            aria-label="Main"
          >
            {menus.map((menu, mIdx) => {
              const isOpen = openDropdown === mIdx;
              const displayLabel = menu.shortLabel || menu.label;
              const isCompanyMenu = displayLabel === "Company" || menu.label === "Company";
              const navLinkHref = isCompanyMenu
                ? null
                : displayLabel === "AI Search & SEO" || menu.label === "AI Search & SEO"
                ? "/seo"
                : displayLabel === "Paid Media" || menu.label === "Paid Media & Marketplaces"
                ? "/paid-media"
                : displayLabel === "Brand & Social" || menu.label === "Brand, Content & Social" || menu.label === "Brand & Social"
                ? "/digital-marketing"
                : displayLabel === "AI Content" || menu.label === "AI Content"
                ? "/ai-content"
                : displayLabel === "Web & Conversion" || menu.label === "Web & Conversion"
                ? "/web-design"
                : displayLabel === "AI & Automation" || menu.label === "AI & Automation"
                ? "/ai"
                : menu.viewAllPath || null;
              return (
                <div
                  key={menu.label}
                  className="relative shrink-0"
                  onMouseEnter={() => handleMouseEnter(mIdx)}
                >
                  {navLinkHref ? (
                    <Link
                      ref={(el) => { triggerRefs.current[mIdx] = el; }}
                      href={navLinkHref}
                      onClick={() => setOpenDropdown(null)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setOpenDropdown(mIdx);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setOpenDropdown(null);
                          triggerRefs.current[mIdx]?.focus();
                        }
                      }}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-controls={`mega-menu-${mIdx}`}
                      className={`px-2 xl:px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs xl:text-[13px] 2xl:text-sm font-semibold tracking-tight transition rounded-lg flex items-center gap-0.5 xl:gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bx-pink ${
                        isOpen
                          ? "text-bx-pink bg-bx-pink/5"
                          : "text-neutral-700 hover:text-bx-pink hover:bg-neutral-50"
                      }`}
                    >
                      <span>{displayLabel}</span>
                      <ChevronDown
                        className={`w-3 h-3 2xl:w-3.5 2xl:h-3.5 text-neutral-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-bx-pink" : ""
                        }`}
                      />
                    </Link>
                  ) : (
                    <button
                      ref={(el) => { triggerRefs.current[mIdx] = el; }}
                      type="button"
                      onClick={() => toggleDropdown(mIdx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                          e.preventDefault();
                          toggleDropdown(mIdx);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setOpenDropdown(null);
                          triggerRefs.current[mIdx]?.focus();
                        }
                      }}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-controls={`mega-menu-${mIdx}`}
                      className={`px-2 xl:px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs xl:text-[13px] 2xl:text-sm font-semibold tracking-tight transition rounded-lg flex items-center gap-0.5 xl:gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bx-pink ${
                        isOpen
                          ? "text-bx-pink bg-bx-pink/5"
                          : "text-neutral-700 hover:text-bx-pink hover:bg-neutral-50"
                      }`}
                    >
                      <span>{displayLabel}</span>
                      <ChevronDown
                        className={`w-3 h-3 2xl:w-3.5 2xl:h-3.5 text-neutral-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-bx-pink" : ""
                        }`}
                      />
                    </button>
                  )}

                  {/* Dropdown 5-Track Mega Menu (Aligned identically to header container) */}
                  <div
                    id={`mega-menu-${mIdx}`}
                    className={`fixed left-0 right-0 top-[76px] bg-white border-b border-neutral-200 shadow-2xl transition-all duration-200 ${
                      isOpen
                        ? "opacity-100 visible translate-y-0 pointer-events-auto"
                        : "opacity-0 invisible -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="w-full max-w-[1760px] mx-auto px-6 sm:px-8 xl:px-10 py-8">
                      {/* 5-Column Grid */}
                      <div className="grid grid-cols-5 gap-8">
                        {menu.groups.map((group, gIdx) => {
                          // Hide dynamic "Latest research" items since no blog model exists yet
                          const visibleItems = (group.items as any[]).filter(
                            (it) => !it.dynamic && it.path
                          );
                          if (visibleItems.length === 0) return null;

                          const span = computeGroupSpan({ items: visibleItems });
                          const isSpan2 = span === 2;

                          return (
                            <div
                              key={group.heading || gIdx}
                              className={isSpan2 ? "col-span-2" : "col-span-1"}
                            >
                              {/* Group Heading */}
                              {group.headingPath ? (
                                <Link href={group.headingPath} prefetch={false}
                                  className="group/h font-heading font-bold text-sm text-neutral-900 hover:text-bx-pink flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 transition"
                                >
                                  <span>{group.heading}</span>
                                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover/h:text-bx-pink group-hover/h:translate-x-0.5 transition" />
                                </Link>
                              ) : (
                                <div className="font-heading font-bold text-sm text-neutral-900 pb-3 mb-4 border-b border-neutral-100">
                                  {group.heading}
                                </div>
                              )}

                              {/* Items list */}
                              {isSpan2 ? (
                                <div className="grid grid-cols-2 gap-6">
                                  <ul className="space-y-2 list-none p-0 m-0">
                                    {visibleItems
                                      .slice(0, Math.ceil(visibleItems.length / 2))
                                      .map((it, itIdx) => (
                                        <li key={it.path || `item-a-${itIdx}`}>
                                          <Link href={it.path} prefetch={false}
                                            className="text-xs text-neutral-600 hover:text-bx-pink hover:translate-x-1 transition-all block py-1 font-medium"
                                          >
                                            {it.label || it.path}
                                          </Link>
                                        </li>
                                      ))}
                                  </ul>
                                  <ul className="space-y-2 list-none p-0 m-0">
                                    {visibleItems
                                      .slice(Math.ceil(visibleItems.length / 2))
                                      .map((it, itIdx) => (
                                        <li key={it.path || `item-b-${itIdx}`}>
                                          <Link href={it.path} prefetch={false}
                                            className="text-xs text-neutral-600 hover:text-bx-pink hover:translate-x-1 transition-all block py-1 font-medium"
                                          >
                                            {it.label || it.path}
                                          </Link>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              ) : (
                                <ul className="space-y-2 list-none p-0 m-0">
                                  {visibleItems.map((it, itIdx) => (
                                    <li key={it.path || `item-${itIdx}`}>
                                      <Link href={it.path} prefetch={false}
                                        className="text-xs text-neutral-600 hover:text-bx-pink hover:translate-x-1 transition-all block py-1 font-medium"
                                      >
                                        {it.label || it.path}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}

                        {/* Optional Proof Card (Takes 1 Track) */}
                        {menu.proofCard && (
                          <div className="col-span-1 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 flex flex-col justify-between shadow-md">
                            <div>
                              <div className="w-8 h-8 rounded-lg bg-bx-pink/20 text-bx-pink flex items-center justify-center mb-3">
                                <TrendingUp className="w-4 h-4" />
                              </div>
                              <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                                {menu.proofCard.text}
                              </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/10">
                              <Link prefetch={false} href={menu.proofCard.path || "/case-studies"}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-bx-pink hover:text-white transition"
                              >
                                {menu.proofCard.cta} <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Bar: View all link & bottomBarLinks */}
                      <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <Link prefetch={false} href={menu.viewAllPath || "/"}
                          className="font-semibold text-bx-pink hover:underline flex items-center gap-1.5"
                        >
                          View all in {menu.label} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        {menu.bottomBarLinks && menu.bottomBarLinks.length > 0 && (
                          <div className="flex items-center gap-4 text-neutral-500">
                            {menu.bottomBarLinks.map((link: any, lIdx: number) => {
                              const path = typeof link === "string" ? link : link?.path;
                              const label = (typeof link === "object" ? link?.label : null) || path;
                              if (!path) return null;
                              return (
                                <Link key={path || `bottom-${lIdx}`} href={path} prefetch={false}
                                  className="hover:text-neutral-900 transition"
                                >
                                  {label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

      {/* Col 3: Action Buttons (CTA & Mobile Toggle) */}
      <div ref={ctaRef} className="flex items-center justify-end shrink-0 gap-2 sm:gap-3">
        {/* Header CTA Button */}
        <Link
          href={cta.path}
          data-cta=""
          className={`inline-flex items-center gap-1.5 2xl:gap-2 px-3 xl:px-3.5 2xl:px-5 py-2 2xl:py-2.5 rounded-xl bg-bx-pink text-white text-xs 2xl:text-sm font-semibold hover:bg-bx-pink/90 transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bx-pink shrink-0 ${
            useMobileMenu ? "hidden" : "hidden min-[1150px]:inline-flex"
          }`}
        >
          {cta.label} <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-lg text-neutral-700 hover:text-bx-pink hover:bg-neutral-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bx-pink ${
            useMobileMenu ? "flex" : "flex min-[1150px]:hidden"
          }`}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </div>

    {/* Hidden offscreen row to measure natural width accurately */}
    <div
      ref={measureNavRef}
      aria-hidden="true"
      className="fixed top-0 left-[-9999px] pointer-events-none invisible flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 whitespace-nowrap"
    >
      {menus.map((menu) => (
        <div
          key={menu.label}
          className="px-2 xl:px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-xs xl:text-[13px] 2xl:text-sm font-semibold tracking-tight flex items-center gap-0.5 xl:gap-1"
        >
          <span>{menu.shortLabel || menu.label}</span>
          <span className="inline-block w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
        </div>
      ))}
    </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className={`${useMobileMenu ? "flex flex-col" : "min-[1150px]:hidden"} flex-1 overflow-y-auto bg-white p-5 border-t border-neutral-100`}>
          <nav aria-label="Mobile Navigation" className="space-y-4 pb-12">
            {menus.map((menu, mIdx) => {
              const isAccordionOpen = mobileAccordion === mIdx;
              const displayLabel = menu.shortLabel || menu.label;
              const isCompanyMenu = displayLabel === "Company" || menu.label === "Company";
              const mobileLinkHref = isCompanyMenu
                ? null
                : displayLabel === "AI Search & SEO" || menu.label === "AI Search & SEO"
                ? "/seo"
                : displayLabel === "Paid Media" || menu.label === "Paid Media & Marketplaces"
                ? "/paid-media"
                : displayLabel === "Brand & Social" || menu.label === "Brand, Content & Social" || menu.label === "Brand & Social"
                ? "/digital-marketing"
                : displayLabel === "AI Content" || menu.label === "AI Content"
                ? "/ai-content"
                : displayLabel === "Web & Conversion" || menu.label === "Web & Conversion"
                ? "/web-design"
                : displayLabel === "AI & Automation" || menu.label === "AI & Automation"
                ? "/ai"
                : menu.viewAllPath || null;
              return (
                <div key={menu.label} className="border-b border-neutral-100 pb-3">
                  <div className="w-full flex items-center justify-between py-2">
                    {mobileLinkHref ? (
                      <Link href={mobileLinkHref} prefetch={false}
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-heading font-bold text-base text-neutral-900 hover:text-bx-pink flex-1"
                      >
                        {menu.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMobileAccordion(isAccordionOpen ? null : mIdx)}
                        className="font-heading font-bold text-base text-neutral-900 text-left flex-1"
                        aria-expanded={isAccordionOpen}
                      >
                        {menu.label}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setMobileAccordion(isAccordionOpen ? null : mIdx)}
                      className="p-1 text-neutral-400 hover:text-bx-pink focus-visible:outline-none"
                      aria-label={`Toggle ${menu.label} submenu`}
                      aria-expanded={isAccordionOpen}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          isAccordionOpen ? "rotate-180 text-bx-pink" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {isAccordionOpen && (
                    <div className="pt-3 pb-2 pl-2 space-y-5">
                      {menu.groups.map((group, gIdx) => {
                        const items = (group.items as any[]).filter(
                          (it) => !it.dynamic && it.path
                        );
                        if (items.length === 0) return null;
                        return (
                          <div key={group.heading || gIdx} className="space-y-2">
                            {group.headingPath ? (
                              <Link href={group.headingPath} prefetch={false}
                                className="font-heading font-semibold text-xs uppercase tracking-wider text-bx-pink block"
                              >
                                {group.heading} →
                              </Link>
                            ) : (
                              <span className="font-heading font-semibold text-xs uppercase tracking-wider text-neutral-400 block">
                                {group.heading}
                              </span>
                            )}
                            <ul className="space-y-2 list-none p-0 m-0">
                              {items.map((it, itIdx) => (
                                <li key={it.path || `mobile-it-${itIdx}`}>
                                  <Link href={it.path} prefetch={false}
                                    className="text-sm text-neutral-700 hover:text-bx-pink block py-1"
                                  >
                                    {it.label || it.path}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}

                      <div className="pt-2">
                        <Link prefetch={false} href={menu.viewAllPath}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-bx-pink"
                        >
                          View all in {menu.label} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-4">
              <Link
                href={cta.path}
                data-cta=""
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-bx-pink text-white font-semibold text-sm shadow-md"
              >
                {cta.label} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
