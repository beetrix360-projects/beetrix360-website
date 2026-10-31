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
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
          ? "inset-0 h-dvh bg-white flex flex-col xl:block xl:inset-x-0 xl:bottom-auto xl:h-[76px] xl:bg-white/80 xl:backdrop-blur-sm border-b border-neutral-200"
          : scrolled || openDropdown !== null
          ? "bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-sm"
          : "bg-white/80 backdrop-blur-sm border-b border-neutral-100"
      }`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-[76px] shrink-0 flex items-center justify-between gap-2">
        {/* Brand Wordmark & Animated Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bx-pink rounded-lg"
          aria-label={`${site.name} home`}
        >
          <Logo floating />
        </Link>

        {/* Desktop Mega Menu Navigation (100% Server-Rendered HTML) */}
        <nav
          className="hidden xl:flex items-center justify-center flex-1 min-w-0"
          aria-label="Main"
        >
          <div className="flex items-center gap-0.5 2xl:gap-1.5 flex-nowrap">
            {menus.map((menu, mIdx) => {
              const isOpen = openDropdown === mIdx;
              return (
                <div
                  key={menu.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(mIdx)}
                >
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
                    className={`px-2.5 2xl:px-3.5 py-2 text-xs 2xl:text-sm font-semibold tracking-tight transition rounded-lg flex items-center gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bx-pink ${
                      isOpen
                        ? "text-bx-pink bg-bx-pink/5"
                        : "text-neutral-700 hover:text-bx-pink hover:bg-neutral-50"
                    }`}
                  >
                    <span>{menu.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-bx-pink" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown 5-Track Mega Menu (Always in SSR DOM for SEO crawlers) */}
                  <div
                    id={`mega-menu-${mIdx}`}
                    className={`fixed left-0 right-0 top-[76px] bg-white border-b border-neutral-200 shadow-2xl transition-all duration-200 ${
                      isOpen
                        ? "opacity-100 visible translate-y-0 pointer-events-auto"
                        : "opacity-0 invisible -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="max-w-[1440px] mx-auto px-6 py-8">
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
                                <Link
                                  href={group.headingPath}
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
                                      .map((it) => (
                                        <li key={it.path}>
                                          <Link
                                            href={it.path}
                                            className="text-xs text-neutral-600 hover:text-bx-pink hover:translate-x-1 transition-all block py-1 font-medium"
                                          >
                                            {it.label}
                                          </Link>
                                        </li>
                                      ))}
                                  </ul>
                                  <ul className="space-y-2 list-none p-0 m-0">
                                    {visibleItems
                                      .slice(Math.ceil(visibleItems.length / 2))
                                      .map((it) => (
                                        <li key={it.path}>
                                          <Link
                                            href={it.path}
                                            className="text-xs text-neutral-600 hover:text-bx-pink hover:translate-x-1 transition-all block py-1 font-medium"
                                          >
                                            {it.label}
                                          </Link>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              ) : (
                                <ul className="space-y-2 list-none p-0 m-0">
                                  {visibleItems.map((it) => (
                                    <li key={it.path}>
                                      <Link
                                        href={it.path}
                                        className="text-xs text-neutral-600 hover:text-bx-pink hover:translate-x-1 transition-all block py-1 font-medium"
                                      >
                                        {it.label}
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
                              <Link
                                href={menu.proofCard.path}
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
                        <Link
                          href={menu.viewAllPath}
                          className="font-semibold text-bx-pink hover:underline flex items-center gap-1.5"
                        >
                          View all in {menu.label} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        {menu.bottomBarLinks && menu.bottomBarLinks.length > 0 && (
                          <div className="flex items-center gap-4 text-neutral-500">
                            {menu.bottomBarLinks.map((link) => (
                              <Link
                                key={link.path}
                                href={link.path}
                                className="hover:text-neutral-900 transition"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Header CTA Button */}
        <div className="hidden xl:flex items-center gap-3 shrink-0">
          <Link
            href={cta.path}
            data-cta=""
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bx-pink text-white text-xs 2xl:text-sm font-semibold hover:bg-bx-pink/90 transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bx-pink"
          >
            {cta.label} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 rounded-lg text-neutral-700 hover:text-bx-pink hover:bg-neutral-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bx-pink"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden flex-1 overflow-y-auto bg-white p-5 border-t border-neutral-100">
          <nav aria-label="Mobile Navigation" className="space-y-4 pb-12">
            {menus.map((menu, mIdx) => {
              const isAccordionOpen = mobileAccordion === mIdx;
              return (
                <div key={menu.label} className="border-b border-neutral-100 pb-3">
                  <button
                    type="button"
                    onClick={() => setMobileAccordion(isAccordionOpen ? null : mIdx)}
                    className="w-full flex items-center justify-between py-2 text-left font-heading font-bold text-base text-neutral-900"
                    aria-expanded={isAccordionOpen}
                  >
                    <span>{menu.label}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-400 transition-transform ${
                        isAccordionOpen ? "rotate-180 text-bx-pink" : ""
                      }`}
                    />
                  </button>

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
                              <Link
                                href={group.headingPath}
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
                              {items.map((it) => (
                                <li key={it.path}>
                                  <Link
                                    href={it.path}
                                    className="text-sm text-neutral-700 hover:text-bx-pink block py-1"
                                  >
                                    {it.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}

                      <div className="pt-2">
                        <Link
                          href={menu.viewAllPath}
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
