import "server-only";
import { getDbItem, putDbItem } from "./db";

export interface NavChildLink {
  id: string;
  name: string;
  href: string;
  badge?: string;
}

export interface NavColumn {
  id: string;
  title: string;
  accent?: "pink" | "blue" | "green" | "yellow";
  icon?: string;
  hubHref?: string;
  links: NavChildLink[];
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  type: "link" | "mega" | "dropdown";
  order: number;
  highlight?: boolean;
  columns?: NavColumn[];
}

export interface NavigationConfig {
  header: NavItem[];
  footer?: {
    columns: {
      title: string;
      links: { label: string; href: string }[];
    }[];
  };
}

export const defaultNavigation: NavigationConfig = {
  header: [
    {
      id: "nav_digital_marketing",
      label: "Digital Marketing",
      href: "/digital-marketing",
      type: "mega",
      order: 1,
      columns: [
        {
          id: "col_social_media",
          title: "Social Media",
          accent: "pink",
          icon: "TrendingUp",
          hubHref: "/social-media-management",
          links: [
            { id: "l1", name: "Instagram Management", href: "/social-media-management/instagram-management" },
            { id: "l2", name: "LinkedIn Management", href: "/social-media-management/linkedin-management" },
            { id: "l3", name: "TikTok Account Management", href: "/social-media-management/tiktok-management" },
            { id: "l4", name: "Social Content Creation", href: "/social-media-management/content-creation" },
            { id: "l5", name: "Community Management", href: "/social-media-management/community-management" },
          ],
        },
        {
          id: "col_branding",
          title: "Branding",
          accent: "blue",
          icon: "Sparkles",
          hubHref: "/branding-services",
          links: [
            { id: "l6", name: "Brand Identity Design", href: "/branding-services/brand-identity-design" },
            { id: "l7", name: "Logo Design Services", href: "/branding-services/logo-design" },
            { id: "l8", name: "Marketing Collateral", href: "/branding-services/collateral-design" },
            { id: "l9", name: "Packaging & Label Design", href: "/branding-services/packaging-label-design" },
            { id: "l10", name: "Branding Strategy", href: "/branding-services/branding-strategy" },
          ],
        },
        {
          id: "col_search_geo",
          title: "Search & GEO",
          accent: "green",
          icon: "Search",
          hubHref: "/seo-services",
          links: [
            { id: "l11", name: "Search Engine Optimization", href: "/seo-services/search-engine-optimization" },
            { id: "l12", name: "GEO & AI Engine Optimization", href: "/seo-services/geo-optimization" },
            { id: "l13", name: "Technical SEO Audits", href: "/seo-services/technical-seo" },
            { id: "l14", name: "Local SEO & Map Rankings", href: "/seo-services/local-seo" },
            { id: "l15", name: "E-Commerce SEO", href: "/seo-services/ecommerce-seo" },
          ],
        },
        {
          id: "col_performance",
          title: "Paid Advertising",
          accent: "yellow",
          icon: "BarChart3",
          hubHref: "/paid-advertising",
          links: [
            { id: "l16", name: "Google Search & Shopping Ads", href: "/paid-advertising/google-ads" },
            { id: "l17", name: "Meta Ads (IG & FB)", href: "/paid-advertising/meta-ads" },
            { id: "l18", name: "LinkedIn B2B Advertising", href: "/paid-advertising/linkedin-ads" },
            { id: "l19", name: "TikTok Performance Campaigns", href: "/paid-advertising/tiktok-ads" },
            { id: "l20", name: "Retargeting & Audience Funnels", href: "/paid-advertising/retargeting" },
          ],
        },
        {
          id: "col_content",
          title: "Content & Copy",
          accent: "pink",
          icon: "Layers",
          hubHref: "/content-marketing",
          links: [
            { id: "l21", name: "SEO Copywriting", href: "/content-marketing/seo-copywriting" },
            { id: "l22", name: "Executive Ghostwriting", href: "/content-marketing/ghostwriting" },
            { id: "l23", name: "Whitepapers & Case Studies", href: "/content-marketing/whitepapers" },
            { id: "l24", name: "Email Marketing Sequences", href: "/content-marketing/email-marketing" },
            { id: "l25", name: "Website Copy Optimization", href: "/content-marketing/web-copy" },
          ],
        },
      ],
    },
    {
      id: "nav_tech_ai",
      label: "Technology & AI",
      href: "/technology-ai",
      type: "mega",
      order: 2,
      columns: [
        {
          id: "col_web_app",
          title: "Web & Apps",
          accent: "blue",
          icon: "Cpu",
          hubHref: "/web-app-development",
          links: [
            { id: "l26", name: "Custom Web Applications", href: "/web-app-development/custom-web-apps" },
            { id: "l27", name: "Next.js & React Engineering", href: "/web-app-development/nextjs-development" },
            { id: "l28", name: "Mobile App Development", href: "/web-app-development/mobile-apps" },
            { id: "l29", name: "Headless CMS Solutions", href: "/web-app-development/headless-cms" },
          ],
        },
        {
          id: "col_ai_automation",
          title: "AI & Agents",
          accent: "green",
          icon: "Bot",
          hubHref: "/ai-automation",
          links: [
            { id: "l30", name: "Autonomous AI Agent Workflows", href: "/ai-automation/ai-agents" },
            { id: "l31", name: "Custom LLM & RAG Systems", href: "/ai-automation/custom-llm-rag" },
            { id: "l32", name: "CRM & ERP Automated Pipelines", href: "/ai-automation/crm-automation" },
            { id: "l33", name: "Zero-Touch Data Workflows", href: "/ai-automation/data-pipelines" },
          ],
        },
        {
          id: "col_ecommerce",
          title: "E-Commerce",
          accent: "yellow",
          icon: "ShoppingBag",
          hubHref: "/ecommerce-development",
          links: [
            { id: "l34", name: "Shopify Plus Architectures", href: "/ecommerce-development/shopify-plus" },
            { id: "l35", name: "Custom Headless Storefronts", href: "/ecommerce-development/headless-ecommerce" },
            { id: "l36", name: "High-Converting Checkout Funnels", href: "/ecommerce-development/checkout-funnels" },
          ],
        },
      ],
    },
    {
      id: "nav_production",
      label: "Media & Studio",
      href: "/media-production",
      type: "link",
      order: 3,
    },
    {
      id: "nav_proof",
      label: "Case Studies",
      href: "#proof",
      type: "link",
      order: 4,
    },
    {
      id: "nav_roi",
      label: "ROI Engine",
      href: "#roi",
      type: "link",
      order: 5,
    },
    {
      id: "nav_contact",
      label: "Contact",
      href: "#contact",
      type: "link",
      order: 6,
    },
  ],
};

export async function getSiteNavigation(): Promise<NavigationConfig> {
  const customNav = await getDbItem<NavigationConfig>("SITE#config", "NAVIGATION");
  if (customNav && customNav.header && customNav.header.length > 0) {
    // Sort items by order
    customNav.header.sort((a, b) => a.order - b.order);
    return customNav;
  }
  return defaultNavigation;
}

export async function saveSiteNavigation(nav: NavigationConfig): Promise<void> {
  await putDbItem("SITE#config", "NAVIGATION", nav);
}
