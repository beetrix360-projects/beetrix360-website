import type { Accent } from "./types";

// Visual-only: icon + tint for each mega-menu card, in the style of the design's menu cards.
export const divisionStyle: Record<string, { icon: string; accent: Accent }> = {
  "digital-marketing": { icon: "fa-solid fa-bullhorn", accent: "pink" },
  "ai-automation": { icon: "fa-solid fa-robot", accent: "green" },
  "ai-content-generation": { icon: "fa-solid fa-wand-magic-sparkles", accent: "yellow" },
  "paid-media-buying": { icon: "fa-solid fa-hand-pointer", accent: "blue" },
};

export const serviceIcon: Record<string, string> = {
  "social-media-management": "fa-solid fa-thumbs-up",
  "branding-services": "fa-solid fa-pen-nib",
  "seo-services": "fa-solid fa-magnifying-glass",
  "email-marketing-services": "fa-solid fa-envelope",
  "sales-funnel-development": "fa-solid fa-filter",
  "ai-agent-development": "fa-solid fa-robot",
  "workflow-automation-services": "fa-solid fa-gears",
  "ai-chatbot-development": "fa-solid fa-comments",
  "ai-integration-services": "fa-solid fa-plug",
  "ai-content-writing": "fa-solid fa-pen",
  "ai-video-generation": "fa-solid fa-film",
  "ai-image-generation": "fa-regular fa-image",
  "ai-seo-content": "fa-solid fa-chart-line",
  "ai-social-media-content": "fa-solid fa-hashtag",
  "ai-ugc-ads": "fa-solid fa-user-group",
  "amazon-management": "fa-solid fa-store",
  "google-ads-management": "fa-solid fa-rectangle-ad",
  "meta-ads-management": "fa-solid fa-bullseye",
  "tiktok-ads-management": "fa-solid fa-music",
  "walmart-ads-management": "fa-solid fa-cart-shopping",
  "target-ads-management": "fa-solid fa-crosshairs",
};
