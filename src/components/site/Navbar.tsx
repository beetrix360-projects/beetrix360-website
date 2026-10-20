"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Phone,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  Sparkles,
  Bot,
  Video,
  BarChart3,
  ShieldCheck,
  TrendingUp,
  Cpu,
  ShoppingBag,
} from "lucide-react";
import { openModal } from "@/lib/client-runtime";
import type { SiteSettings } from "@/lib/types";
import { Logo } from "./Logo";

interface NavbarProps {
  site: SiteSettings;
}

export function Navbar({ site }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const toggleAccordion = (key: string) => {
    setActiveAccordion(activeAccordion === key ? null : key);
  };

  const handleBookCall = () => {
    openModal(site.header.cta.cta || "Strategy call");
  };

  return (
    <>
      <header
        id="site-nav"
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-bx-border shadow-ambient"
            : "bg-transparent"
        }`}
      >
        <div className="w-full mx-auto px-5 sm:px-8 lg:px-12 2xl:px-20 h-[76px] flex items-center justify-between">
          {/* Brand Wordmark & Animated Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label={`${site.name} home`}>
            <Logo floating />
          </Link>

          {/* Desktop Mega Menu Navigation */}
          <nav className="hidden xl:flex items-stretch h-full" aria-label="Primary navigation">
            {/* Mega Menu 1: Digital Marketing */}
            <div className="has-mega flex items-center">
              <Link href="/digital-marketing" className="nav-trig cursor-pointer flex items-center" aria-haspopup="true">
                Digital Marketing <ChevronDown className="w-3.5 h-3.5 ml-1 text-neutral-400" />
              </Link>
              <div className="mega">
                <div className="grid grid-cols-5 gap-5 max-w-[1500px] mx-auto">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Social Media</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-pink/15 text-bx-pink flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/social-media-management" className="block text-sm font-semibold text-bx-pink hover:underline mb-2">
                        View Hub Page →
                      </Link>
                      <Link href="/social-media-management/instagram-management" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Instagram Management
                      </Link>
                      <Link href="/social-media-management/linkedin-management" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        LinkedIn Management
                      </Link>
                      <Link href="/social-media-management/tiktok-management" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        TikTok Account Management
                      </Link>
                      <Link href="/social-media-management/content-creation" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Social Content Creation
                      </Link>
                      <Link href="/social-media-management/community-management" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Community Management
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Branding</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-blue/15 text-bx-blue flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/branding-services" className="block text-sm font-semibold text-bx-blue hover:underline mb-2">
                        View Hub Page →
                      </Link>
                      <Link href="/branding-services/brand-identity-design" className="block text-xs text-neutral-600 hover:text-bx-blue py-1 transition-colors">
                        Brand Identity Design
                      </Link>
                      <Link href="/branding-services/logo-design" className="block text-xs text-neutral-600 hover:text-bx-blue py-1 transition-colors">
                        Logo Design Services
                      </Link>
                      <Link href="/branding-services/collateral-design" className="block text-xs text-neutral-600 hover:text-bx-blue py-1 transition-colors">
                        Marketing Collateral
                      </Link>
                      <Link href="/branding-services/packaging-label-design" className="block text-xs text-neutral-600 hover:text-bx-blue py-1 transition-colors">
                        Packaging & Label Design
                      </Link>
                      <Link href="/branding-services/branding-strategy" className="block text-xs text-neutral-600 hover:text-bx-blue py-1 transition-colors">
                        Branding Strategy
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Search & GEO</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-green/15 text-bx-green flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/seo-services" className="block text-sm font-semibold text-bx-green hover:underline mb-2">
                        View Hub Page →
                      </Link>
                      <Link href="/seo-services/generative-engine-optimization" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        Generative Engine (GEO)
                      </Link>
                      <Link href="/seo-services/answer-engine-optimization" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        Answer Engine (AEO)
                      </Link>
                      <Link href="/seo-services/technical-seo" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        Technical SEO Audits
                      </Link>
                      <Link href="/seo-services/local-seo" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        Local SEO Services
                      </Link>
                      <Link href="/seo-services/link-building" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        Authority Link Building
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Funnels & Email</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-yellow/25 text-bx-dark flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/sales-funnel-development" className="block text-sm font-semibold text-neutral-900 hover:underline mb-2">
                        Sales Funnels →
                      </Link>
                      <Link href="/sales-funnel-development/landing-pages" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Landing Page Design
                      </Link>
                      <Link href="/sales-funnel-development/conversion-rate-optimization" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        CRO Optimization
                      </Link>
                      <Link href="/email-marketing-services" className="block text-sm font-semibold text-neutral-900 hover:underline mt-3 mb-1">
                        Email Marketing →
                      </Link>
                      <Link href="/email-marketing-services/email-automation" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Email Automation Flows
                      </Link>
                      <Link href="/email-marketing-services/email-campaigns" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Campaign Management
                      </Link>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-bx-blue/10 to-bx-pink/10 rounded-xl p-6 flex flex-col justify-between border border-bx-blue/20">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-bx-dark text-white font-semibold">
                        Division 01
                      </span>
                      <h4 className="font-heading font-extrabold text-2xl mt-3 text-bx-dark">
                        Digital Marketing
                      </h4>
                      <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                        Full-funnel organic, social & CRO systems built to turn cold traffic into booked pipeline.
                      </p>
                    </div>
                    <Link
                      href="/digital-marketing"
                      className="btn-shine w-full py-3 bg-bx-dark text-white rounded-lg font-heading font-bold text-xs flex items-center justify-center gap-2 hover:bg-bx-pink transition-colors mt-4"
                    >
                      Explore Division Hub <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mega Menu 2: AI Automations */}
            <div className="has-mega flex items-center">
              <Link href="/ai-automation" className="nav-trig cursor-pointer flex items-center" aria-haspopup="true">
                AI & Automations <ChevronDown className="w-3.5 h-3.5 ml-1 text-neutral-400" />
              </Link>
              <div className="mega">
                <div className="grid grid-cols-5 gap-5 max-w-[1500px] mx-auto">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>AI Agents</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-green/15 text-bx-green flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/ai-agent-development" className="block text-sm font-semibold text-bx-green hover:underline mb-2">
                        View Hub Page →
                      </Link>
                      <Link href="/ai-agent-development/custom-ai-agents" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        Custom AI Agents
                      </Link>
                      <Link href="/ai-agent-development/ai-sales-agents" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        AI Sales Agents
                      </Link>
                      <Link href="/ai-agent-development/ai-customer-service-agents" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        Customer Service Agents
                      </Link>
                      <Link href="/ai-agent-development/multi-agent-systems" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        Multi-Agent Systems
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Workflows</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-pink/15 text-bx-pink flex items-center justify-center">
                        <Cpu className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/workflow-automation-services" className="block text-sm font-semibold text-bx-pink hover:underline mb-2">
                        View Hub Page →
                      </Link>
                      <Link href="/workflow-automation-services/business-process-automation" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Business Process Automation
                      </Link>
                      <Link href="/workflow-automation-services/data-entry-automation" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Data Entry Automation
                      </Link>
                      <Link href="/workflow-automation-services/api-automation" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        API & Systems Integration
                      </Link>
                      <Link href="/workflow-automation-services/no-code-automation" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        No-Code Architecture
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>AI Chatbots</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-blue/15 text-bx-blue flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/ai-chatbot-development" className="block text-sm font-semibold text-bx-blue hover:underline mb-2">
                        View Hub Page →
                      </Link>
                      <Link href="/ai-chatbot-development/website-chatbots" className="block text-xs text-neutral-600 hover:text-bx-blue py-1 transition-colors">
                        Website Chatbots
                      </Link>
                      <Link href="/ai-chatbot-development/whatsapp-chatbots" className="block text-xs text-neutral-600 hover:text-bx-blue py-1 transition-colors">
                        WhatsApp Business Chatbots
                      </Link>
                      <Link href="/ai-chatbot-development/ecommerce-chatbots" className="block text-xs text-neutral-600 hover:text-bx-blue py-1 transition-colors">
                        Ecommerce Assistant Bots
                      </Link>
                      <Link href="/ai-chatbot-development/customer-service-chatbots" className="block text-xs text-neutral-600 hover:text-bx-blue py-1 transition-colors">
                        Customer Service Chatbots
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Integrations</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-yellow/25 text-bx-dark flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/ai-integration-services" className="block text-sm font-semibold text-neutral-900 hover:underline mb-2">
                        View Hub Page →
                      </Link>
                      <Link href="/ai-integration-services/crm-ai-integration" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        CRM AI Integration
                      </Link>
                      <Link href="/ai-integration-services/chatgpt-integration" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        ChatGPT API Integration
                      </Link>
                      <Link href="/ai-integration-services/ai-software-integration" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        Enterprise AI Stack
                      </Link>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-bx-green/10 to-bx-yellow/15 rounded-xl p-6 flex flex-col justify-between border border-bx-green/20">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-bx-green text-white font-semibold">
                        Division 02
                      </span>
                      <h4 className="font-heading font-extrabold text-2xl mt-3 text-bx-dark">
                        AI Automation
                      </h4>
                      <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                        Replace human latency with multi-agent digital teams operating 24/7 across your CRM and workflows.
                      </p>
                    </div>
                    <Link
                      href="/ai-automation"
                      className="btn-shine w-full py-3 bg-bx-dark text-white rounded-lg font-heading font-bold text-xs flex items-center justify-center gap-2 hover:bg-bx-green transition-colors mt-4"
                    >
                      Explore Division Hub <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mega Menu 3: AI Content Generation */}
            <div className="has-mega flex items-center">
              <Link href="/ai-content-generation" className="nav-trig cursor-pointer flex items-center" aria-haspopup="true">
                AI Content <ChevronDown className="w-3.5 h-3.5 ml-1 text-neutral-400" />
              </Link>
              <div className="mega">
                <div className="grid grid-cols-5 gap-5 max-w-[1500px] mx-auto">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Writing</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-yellow/25 text-bx-dark flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/ai-content-writing" className="block text-sm font-semibold text-neutral-900 hover:underline mb-2">
                        View Hub Page →
                      </Link>
                      <Link href="/ai-content-writing/ai-blog-writing" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        AI Blog Writing
                      </Link>
                      <Link href="/ai-content-writing/ai-copywriting" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        AI Copywriting
                      </Link>
                      <Link href="/ai-content-writing/ai-product-descriptions" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Product Descriptions
                      </Link>
                      <Link href="/ai-content-writing/ai-website-content" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        AI Website Content
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Video & Avatars</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-pink/15 text-bx-pink flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/ai-video-generation" className="block text-sm font-semibold text-bx-pink hover:underline mb-2">
                        View Hub Page →
                      </Link>
                      <Link href="/ai-video-generation/ai-avatar-videos" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        AI Avatar Videos
                      </Link>
                      <Link href="/ai-video-generation/ai-faceless-videos" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Faceless AI Videos
                      </Link>
                      <Link href="/ai-video-generation/ai-video-ads" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        AI Video Ads
                      </Link>
                      <Link href="/ai-video-generation/ai-product-videos" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Product 3D Videos
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Visuals & UGC</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-blue/15 text-bx-blue flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/ai-image-generation" className="block text-sm font-semibold text-bx-blue hover:underline mb-2">
                        Image Generation →
                      </Link>
                      <Link href="/ai-image-generation/ai-product-photography" className="block text-xs text-neutral-600 hover:text-bx-blue py-1 transition-colors">
                        AI Product Photography
                      </Link>
                      <Link href="/ai-ugc-ads" className="block text-sm font-semibold text-bx-pink hover:underline mt-3 mb-1">
                        UGC Ad Creation →
                      </Link>
                      <Link href="/ai-ugc-ads/ai-ugc-video-ads" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        AI UGC Video Ads
                      </Link>
                      <Link href="/ai-ugc-ads/ai-tiktok-ugc" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        TikTok UGC Creatives
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>SEO & Social</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-green/15 text-bx-green flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/ai-seo-content" className="block text-sm font-semibold text-bx-green hover:underline mb-2">
                        AI SEO Content →
                      </Link>
                      <Link href="/ai-seo-content/programmatic-seo" className="block text-xs text-neutral-600 hover:text-bx-green py-1 transition-colors">
                        Programmatic SEO Content
                      </Link>
                      <Link href="/ai-social-media-content" className="block text-sm font-semibold text-bx-dark hover:underline mt-3 mb-1">
                        AI Social Media →
                      </Link>
                      <Link href="/ai-social-media-content/ai-social-posts" className="block text-xs text-neutral-600 hover:text-bx-dark py-1 transition-colors">
                        Social Media Posts
                      </Link>
                      <Link href="/ai-social-media-content/ai-reels" className="block text-xs text-neutral-600 hover:text-bx-dark py-1 transition-colors">
                        AI Reels & Shorts
                      </Link>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-bx-yellow/15 to-bx-pink/15 rounded-xl p-6 flex flex-col justify-between border border-bx-yellow/30">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-bx-yellow text-bx-dark font-semibold">
                        Division 03
                      </span>
                      <h4 className="font-heading font-extrabold text-2xl mt-3 text-bx-dark">
                        AI Content
                      </h4>
                      <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                        Scale production 100x with synthetic avatar videos, programmatic SEO articles, and UGC ad hooks.
                      </p>
                    </div>
                    <Link
                      href="/ai-content-generation"
                      className="btn-shine w-full py-3 bg-bx-dark text-white rounded-lg font-heading font-bold text-xs flex items-center justify-center gap-2 hover:bg-bx-pink transition-colors mt-4"
                    >
                      Explore Division Hub <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mega Menu 4: Paid Media Buying */}
            <div className="has-mega flex items-center">
              <Link href="/paid-media-buying" className="nav-trig cursor-pointer flex items-center" aria-haspopup="true">
                Paid Media <ChevronDown className="w-3.5 h-3.5 ml-1 text-neutral-400" />
              </Link>
              <div className="mega">
                <div className="grid grid-cols-4 gap-5 max-w-[1300px] mx-auto">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Amazon Management</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-yellow/25 text-bx-dark flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/amazon-management" className="block text-sm font-semibold text-neutral-900 hover:underline mb-2">
                        View Hub Page →
                      </Link>
                      <Link href="/amazon-management/amazon-ads" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Amazon Ads Management
                      </Link>
                      <Link href="/amazon-management/amazon-dsp" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Amazon DSP Programmatic
                      </Link>
                      <Link href="/amazon-management/seller-operations" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Seller Operations
                      </Link>
                      <Link href="/amazon-management/creator-connections" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Creator Connections
                      </Link>
                      <Link href="/amazon-management/brand-management" className="block text-xs text-neutral-600 hover:text-bx-pink py-1 transition-colors">
                        Brand Store & A+ Content
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Global Ad Networks</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-blue/15 text-bx-blue flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/google-ads-management" className="block text-sm font-semibold text-bx-blue hover:underline py-1.5 transition-colors">
                        Google Ads Management →
                      </Link>
                      <p className="text-[11px] text-neutral-400 mb-2">
                        Search, PMax, YouTube, Enhanced CAPI conversions
                      </p>
                      <Link href="/meta-ads-management" className="block text-sm font-semibold text-bx-blue hover:underline py-1.5 transition-colors">
                        Meta Ads Management →
                      </Link>
                      <p className="text-[11px] text-neutral-400 mb-2">
                        Instagram & Facebook broad scale, dynamic creatives
                      </p>
                      <Link href="/tiktok-ads-management" className="block text-sm font-semibold text-bx-blue hover:underline py-1.5 transition-colors">
                        TikTok Ads Management →
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-4 font-heading font-bold text-lg text-bx-dark">
                      <span>Retail Media Networks</span>
                      <span className="w-8 h-8 rounded-lg bg-bx-green/15 text-bx-green flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Link href="/walmart-ads-management" className="block text-sm font-semibold text-bx-green hover:underline py-1.5 transition-colors">
                        Walmart Ads Management →
                      </Link>
                      <p className="text-[11px] text-neutral-400 mb-2">
                        Sponsored Products, in-grid display & brand amplifiers
                      </p>
                      <Link href="/target-ads-management" className="block text-sm font-semibold text-bx-green hover:underline py-1.5 transition-colors">
                        Target Ads Management →
                      </Link>
                      <p className="text-[11px] text-neutral-400 mb-2">
                        Roundel programmatic retail media & offsite audiences
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-bx-pink/10 to-bx-yellow/15 rounded-xl p-6 flex flex-col justify-between border border-bx-pink/20">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-bx-pink text-white font-semibold">
                        Division 04
                      </span>
                      <h4 className="font-heading font-extrabold text-2xl mt-3 text-bx-dark">
                        Paid Media
                      </h4>
                      <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                        Data-backed performance advertising across retail giants and search engines tied directly to CRM revenue.
                      </p>
                    </div>
                    <Link
                      href="/paid-media-buying"
                      className="btn-shine w-full py-3 bg-bx-dark text-white rounded-lg font-heading font-bold text-xs flex items-center justify-center gap-2 hover:bg-bx-pink transition-colors mt-4"
                    >
                      Explore Division Hub <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Action Zone: Call + CTA + Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${site.phone.tel}`}
              className="hidden md:inline-flex w-10 h-10 items-center justify-center rounded-full border border-bx-border hover:border-bx-dark hover:text-bx-pink transition-colors text-neutral-700"
              aria-label={site.phone.ariaLabel}
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={handleBookCall}
              data-cta={site.header.cta.cta}
              className="btn-shine hidden sm:inline-flex items-center gap-2 bg-bx-dark hover:bg-bx-pink text-white font-heading font-semibold text-xs px-5 py-3 rounded-full transition-colors cursor-pointer"
            >
              {site.header.cta.label} <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-10 h-10 rounded-full border border-bx-border flex items-center justify-center text-bx-dark hover:border-bx-dark transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Accordion Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="xl:hidden bg-white border-t border-bx-border px-6 py-6 shadow-elevated max-h-[calc(100vh-76px)] overflow-y-auto">
            <div className="space-y-4">
              {/* Accordion 1: Digital Marketing */}
              <div className="border-b border-neutral-100 pb-3">
                <button
                  onClick={() => toggleAccordion("dm")}
                  className="w-full flex items-center justify-between py-2 text-left font-heading font-bold text-lg text-bx-dark"
                >
                  <span>1. Digital Marketing</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      activeAccordion === "dm" ? "rotate-180 text-bx-pink" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "dm" && (
                  <div className="pl-3 py-2 space-y-2 text-sm text-neutral-600">
                    <Link
                      href="/digital-marketing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block font-semibold text-bx-pink py-1"
                    >
                      → Digital Marketing Hub Page
                    </Link>
                    <Link
                      href="/social-media-management"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-pink"
                    >
                      Social Media Management
                    </Link>
                    <Link
                      href="/branding-services"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-pink"
                    >
                      Branding Services
                    </Link>
                    <Link
                      href="/seo-services"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-pink"
                    >
                      SEO & GEO Services
                    </Link>
                    <Link
                      href="/email-marketing-services"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-pink"
                    >
                      Email Marketing Services
                    </Link>
                    <Link
                      href="/sales-funnel-development"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-pink"
                    >
                      Sales Funnel Development
                    </Link>
                  </div>
                )}
              </div>

              {/* Accordion 2: AI Automations */}
              <div className="border-b border-neutral-100 pb-3">
                <button
                  onClick={() => toggleAccordion("ai")}
                  className="w-full flex items-center justify-between py-2 text-left font-heading font-bold text-lg text-bx-dark"
                >
                  <span>2. Agentic & AI Automations</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      activeAccordion === "ai" ? "rotate-180 text-bx-green" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "ai" && (
                  <div className="pl-3 py-2 space-y-2 text-sm text-neutral-600">
                    <Link
                      href="/ai-automation"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block font-semibold text-bx-green py-1"
                    >
                      → AI Automations Hub Page
                    </Link>
                    <Link
                      href="/ai-agent-development"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-green"
                    >
                      AI Agent Development
                    </Link>
                    <Link
                      href="/workflow-automation-services"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-green"
                    >
                      Workflow Automation Services
                    </Link>
                    <Link
                      href="/ai-chatbot-development"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-green"
                    >
                      AI Chatbot Development
                    </Link>
                    <Link
                      href="/ai-integration-services"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-green"
                    >
                      AI Integration Services
                    </Link>
                  </div>
                )}
              </div>

              {/* Accordion 3: AI Content */}
              <div className="border-b border-neutral-100 pb-3">
                <button
                  onClick={() => toggleAccordion("content")}
                  className="w-full flex items-center justify-between py-2 text-left font-heading font-bold text-lg text-bx-dark"
                >
                  <span>3. AI Content Generation</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      activeAccordion === "content" ? "rotate-180 text-bx-yellow" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "content" && (
                  <div className="pl-3 py-2 space-y-2 text-sm text-neutral-600">
                    <Link
                      href="/ai-content-generation"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block font-semibold text-neutral-900 py-1"
                    >
                      → AI Content Generation Hub Page
                    </Link>
                    <Link
                      href="/ai-content-writing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-pink"
                    >
                      AI Content Writing
                    </Link>
                    <Link
                      href="/ai-video-generation"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-pink"
                    >
                      AI Video Generation
                    </Link>
                    <Link
                      href="/ai-image-generation"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-pink"
                    >
                      AI Image Generation
                    </Link>
                    <Link
                      href="/ai-seo-content"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-pink"
                    >
                      AI SEO Content
                    </Link>
                    <Link
                      href="/ai-ugc-ads"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-pink"
                    >
                      AI UGC Ads
                    </Link>
                  </div>
                )}
              </div>

              {/* Accordion 4: Paid Media */}
              <div className="border-b border-neutral-100 pb-3">
                <button
                  onClick={() => toggleAccordion("ads")}
                  className="w-full flex items-center justify-between py-2 text-left font-heading font-bold text-lg text-bx-dark"
                >
                  <span>4. Paid Media Buying</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      activeAccordion === "ads" ? "rotate-180 text-bx-blue" : ""
                    }`}
                  />
                </button>
                {activeAccordion === "ads" && (
                  <div className="pl-3 py-2 space-y-2 text-sm text-neutral-600">
                    <Link
                      href="/paid-media-buying"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block font-semibold text-bx-blue py-1"
                    >
                      → Paid Media Buying Hub Page
                    </Link>
                    <Link
                      href="/amazon-management"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-blue"
                    >
                      Amazon Management Services
                    </Link>
                    <Link
                      href="/google-ads-management"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-blue"
                    >
                      Google Ads Management
                    </Link>
                    <Link
                      href="/meta-ads-management"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-blue"
                    >
                      Meta Ads Management
                    </Link>
                    <Link
                      href="/tiktok-ads-management"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-blue"
                    >
                      TikTok Ads Management
                    </Link>
                    <Link
                      href="/walmart-ads-management"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-blue"
                    >
                      Walmart Ads Management
                    </Link>
                    <Link
                      href="/target-ads-management"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-bx-blue"
                    >
                      Target Ads Management
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile CTA */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleBookCall();
                }}
                className="w-full mt-4 py-3.5 bg-bx-dark text-white rounded-full font-heading font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {site.header.cta.label} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
