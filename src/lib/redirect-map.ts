// Master 301 Redirect Mapping (90 Active Legacy Redirects, Excluding Identity Rows)
export const RAW_REDIRECT_MAP: Record<string, { to: string; note: string }> = {
  // Divisions
  "/paid-media-buying": { to: "/paid-media", note: "Division remapped to PPC hub (retired division slug)" },
  "/ai-automation": { to: "/ai", note: "Division remapped to AI Agents & Automation hub (retired division slug)" },
  "/ai-content-generation": { to: "/ai-content", note: "Division remapped to AI Content hub (retired division slug)" },

  // Digital Marketing Services & Sub-services
  "/seo-services": { to: "/seo", note: "Service hub renamed to /seo" },
  "/seo-services/local-seo": { to: "/seo/local-seo", note: "Moved under /seo" },
  "/seo-services/technical-seo": { to: "/seo/technical-seo", note: "Moved under /seo" },
  "/seo-services/on-page-seo": { to: "/seo/on-page-seo", note: "Moved under /seo" },
  "/seo-services/ecommerce-seo": { to: "/seo/ecommerce-seo", note: "Moved under /seo" },
  "/seo-services/link-building": { to: "/seo/link-building", note: "Moved under /seo" },
  "/seo-services/keyword-research": { to: "/seo/keyword-research", note: "Moved under /seo" },
  "/seo-services/answer-engine-optimization": { to: "/seo/answer-engine-optimization", note: "Moved under /seo" },
  "/seo-services/generative-engine-optimization": { to: "/seo/generative-engine-optimization", note: "Moved under /seo" },

  "/social-media-management": { to: "/social-media", note: "Service hub renamed to /social-media" },
  "/social-media-management/instagram-management": { to: "/social-media/instagram-management", note: "Moved under /social-media" },
  "/social-media-management/facebook-management": { to: "/social-media/facebook-management", note: "Moved under /social-media" },
  "/social-media-management/linkedin-management": { to: "/social-media/linkedin-management", note: "Moved under /social-media" },
  "/social-media-management/tiktok-management": { to: "/social-media/tiktok-management", note: "Moved under /social-media" },
  "/social-media-management/content-creation": { to: "/social-media/content-and-design", note: "Renamed to /social-media/content-and-design" },
  "/social-media-management/community-management": { to: "/social-media/community-management", note: "Moved under /social-media" },

  "/branding-services": { to: "/branding", note: "Service hub renamed to /branding" },
  "/branding-services/branding-strategy": { to: "/branding/brand-strategy", note: "Renamed to brand-strategy" },
  "/branding-services/brand-identity-design": { to: "/branding/brand-identity-design", note: "Moved under /branding" },
  "/branding-services/logo-design": { to: "/branding/logo-design", note: "Moved under /branding" },
  "/branding-services/collateral-design": { to: "/branding/collateral-design", note: "Moved under /branding" },
  "/branding-services/packaging-label-design": { to: "/branding/packaging-label-design", note: "Moved under /branding" },

  "/email-marketing-services": { to: "/email-marketing", note: "Service hub renamed to /email-marketing" },
  "/email-marketing-services/email-campaigns": { to: "/email-marketing/campaign-management", note: "Renamed to campaign-management" },
  "/email-marketing-services/email-automation": { to: "/email-marketing/automation", note: "Renamed to automation" },
  "/email-marketing-services/newsletter-management": { to: "/email-marketing/newsletter-management", note: "Moved under /email-marketing" },
  "/email-marketing-services/email-design": { to: "/email-marketing/design-testing", note: "Renamed to design-testing" },

  "/sales-funnel-development": { to: "/conversion/sales-funnels", note: "Moved under /conversion" },
  "/sales-funnel-development/lead-generation": { to: "/conversion/lead-generation", note: "Moved under /conversion" },
  "/sales-funnel-development/conversion-rate-optimization": { to: "/conversion", note: "Remapped to /conversion hub" },
  "/sales-funnel-development/landing-pages": { to: "/web-design/landing-pages", note: "Moved to /web-design/landing-pages" },
  "/sales-funnel-development/marketing-automation": { to: "/automation/marketing-automation", note: "Moved to /automation/marketing-automation" },

  // Paid Media Services & Sub-services
  "/google-ads-management": { to: "/paid-media/google-ads", note: "Moved under /paid-media" },
  "/meta-ads-management": { to: "/paid-media/meta-ads", note: "Moved under /paid-media" },
  "/tiktok-ads-management": { to: "/paid-media/tiktok-ads", note: "Moved under /paid-media" },
  "/walmart-ads-management": { to: "/marketplaces/walmart", note: "Moved under /marketplaces" },
  "/target-ads-management": { to: "/marketplaces/target", note: "Moved under /marketplaces" },
  "/amazon-management": { to: "/marketplaces/amazon", note: "Moved under /marketplaces" },
  "/amazon-management/amazon-ads": { to: "/marketplaces/amazon/advertising", note: "Moved under /marketplaces/amazon" },
  "/amazon-management/amazon-dsp": { to: "/marketplaces/amazon/dsp", note: "Moved under /marketplaces/amazon" },
  "/amazon-management/seller-operations": { to: "/marketplaces/amazon/seller-operations", note: "Moved under /marketplaces/amazon" },
  "/amazon-management/creator-connections": { to: "/marketplaces/amazon/creator-connections", note: "Moved under /marketplaces/amazon" },
  "/amazon-management/brand-management": { to: "/marketplaces/amazon/brand-management", note: "Moved under /marketplaces/amazon" },

  // AI Automation Services & Sub-services
  "/ai-agent-development": { to: "/ai/agent-development", note: "Moved under /ai" },
  "/ai-agent-development/custom-ai-agents": { to: "/ai/agent-development/custom-ai-agents", note: "Moved under /ai" },
  "/ai-agent-development/ai-sales-agents": { to: "/ai/agent-development/ai-sales-agents", note: "Moved under /ai" },
  "/ai-agent-development/ai-customer-service-agents": { to: "/ai/agent-development/ai-customer-service-agents", note: "Moved under /ai" },
  "/ai-agent-development/multi-agent-systems": { to: "/ai/agent-development/multi-agent-systems", note: "Moved under /ai" },

  "/ai-chatbot-development": { to: "/ai/chatbot-development", note: "Moved under /ai" },
  "/ai-chatbot-development/website-chatbots": { to: "/ai/chatbot-development/website-chatbots", note: "Moved under /ai" },
  "/ai-chatbot-development/whatsapp-chatbots": { to: "/ai/chatbot-development/whatsapp-chatbots", note: "Moved under /ai" },
  "/ai-chatbot-development/ecommerce-chatbots": { to: "/ai/chatbot-development/ecommerce-chatbots", note: "Moved under /ai" },
  "/ai-chatbot-development/customer-service-chatbots": { to: "/ai/agent-development/ai-customer-service-agents", note: "Mapped to /ai/agent-development/ai-customer-service-agents" },

  "/ai-integration-services": { to: "/ai/integration", note: "Moved under /ai" },
  "/ai-integration-services/chatgpt-integration": { to: "/ai/integration/chatgpt-integration", note: "Moved under /ai" },
  "/ai-integration-services/crm-ai-integration": { to: "/ai/integration/crm-ai-integration", note: "Moved under /ai" },
  "/ai-integration-services/ai-software-integration": { to: "/ai/integration/ai-software-integration", note: "Moved under /ai" },

  "/workflow-automation-services": { to: "/automation", note: "Remapped to /automation hub" },
  "/workflow-automation-services/business-process-automation": { to: "/automation/business-process-automation", note: "Moved under /automation" },
  "/workflow-automation-services/data-entry-automation": { to: "/automation/data-entry-automation", note: "Moved under /automation" },
  "/workflow-automation-services/api-automation": { to: "/automation/api-integration", note: "Mapped to api-integration" },
  "/workflow-automation-services/no-code-automation": { to: "/automation/no-code-automation", note: "Moved under /automation" },

  // AI Content Services & Sub-services
  "/ai-content-writing": { to: "/ai-content/writing", note: "Moved under /ai-content" },
  "/ai-content-writing/ai-blog-writing": { to: "/ai-content/writing/blog-writing", note: "Moved under /ai-content" },
  "/ai-content-writing/ai-copywriting": { to: "/ai-content/writing/copywriting", note: "Moved under /ai-content" },
  "/ai-content-writing/ai-website-content": { to: "/content-marketing/website-copywriting", note: "Remapped to /content-marketing/website-copywriting" },
  "/ai-content-writing/ai-product-descriptions": { to: "/ai-content/writing/product-descriptions", note: "Moved under /ai-content" },

  // AI Video Generation
  "/ai-video-generation": { to: "/ai-content/video", note: "Moved under /ai-content" },
  "/ai-video-generation/ai-avatar-videos": { to: "/ai-content/video/avatar-videos", note: "Moved under /ai-content" },
  "/ai-video-generation/ai-faceless-videos": { to: "/ai-content/video/faceless-videos", note: "Moved under /ai-content" },
  "/ai-video-generation/ai-video-ads": { to: "/ai-content/video/video-ads", note: "Moved under /ai-content" },
  "/ai-video-generation/ai-product-videos": { to: "/ai-content/video/product-videos", note: "Moved under /ai-content" },

  // AI Image Generation
  "/ai-image-generation": { to: "/ai-content/images", note: "Moved under /ai-content" },
  "/ai-image-generation/ai-product-photography": { to: "/ai-content/images/product-photography", note: "Moved under /ai-content" },
  "/ai-image-generation/ai-ad-creatives": { to: "/ai-content/images/ad-creatives", note: "Moved under /ai-content" },
  "/ai-image-generation/ai-lifestyle-images": { to: "/ai-content/images/lifestyle-images", note: "Moved under /ai-content" },

  // AI Social Media Content
  "/ai-social-media-content": { to: "/ai-content/social-media", note: "Moved under /ai-content" },
  "/ai-social-media-content/ai-social-posts": { to: "/ai-content/social-media", note: "Mapped to /ai-content/social-media hub (retired sub)" },
  "/ai-social-media-content/ai-reels": { to: "/ai-content/social-media/reels-shorts", note: "Moved under /ai-content/social-media" },

  // AI UGC Ads
  "/ai-ugc-ads": { to: "/ai-content/ugc-ads", note: "Moved under /ai-content" },
  "/ai-ugc-ads/ai-ugc-video-ads": { to: "/ai-content/ugc-ads", note: "Mapped to /ai-content/ugc-ads hub (retired sub)" },
  "/ai-ugc-ads/ai-ugc-avatars": { to: "/ai-content/ugc-ads/ugc-avatars", note: "Moved under /ai-content/ugc-ads" },
  "/ai-ugc-ads/ai-tiktok-ugc": { to: "/ai-content/ugc-ads/tiktok-ugc-ads", note: "Moved under /ai-content/ugc-ads" },

  // AI SEO Content
  "/ai-seo-content": { to: "/ai-content/writing", note: "Remapped to AI writing hub (retired service)" },
  "/ai-seo-content/ai-content-optimization": { to: "/seo/on-page-seo", note: "Merged into On-Page SEO (per seed note on /seo/on-page-seo)" },
  "/ai-seo-content/programmatic-seo": { to: "/seo/programmatic-seo", note: "Remapped to /seo/programmatic-seo" },
  "/ai-seo-content/generative-engine-optimization": { to: "/seo/generative-engine-optimization", note: "Remapped to /seo/generative-engine-optimization" },
};
