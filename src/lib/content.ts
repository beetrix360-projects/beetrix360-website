import "server-only";
import defaultHomepage from "../content/homepage.json";
import defaultSite from "../content/site.json";
import {
  getDbItem,
  putDbItem,
  getPageByPath,
  getAllPages,
  savePage,
  getRedirect,
  getAllRedirects,
  saveRedirect,
  getNavigation,
  getPreviousNavigation,
  saveNavigation,
  saveNavigationWithBackup,
  restorePreviousNavigation,
  normalizePath,
} from "./db";
import type {
  AnalyticsSettings,
  HomepageContent,
  SiteSettings,
  PageRecordV2,
  RedirectRecord,
  NavigationRecord,
} from "./types";

/**
 * Content access layer backed by DynamoDB (with local fallback).
 */

const ENV_GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.GA_MEASUREMENT_ID ||
  "";
const ENV_GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID ||
  process.env.GTM_ID ||
  "";

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  gaEnabled: !!ENV_GA_ID,
  gaMeasurementId: ENV_GA_ID,
  gtmEnabled: !!ENV_GTM_ID,
  gtmContainerId: ENV_GTM_ID,
  trackPageViews: true,
  trackCtaClicks: true,
  trackFormSubmissions: true,
  trackVideoPlays: true,
  trackRoiCalculator: true,
  trackPhoneClicks: true,
  trackOutboundLinks: true,
  anonymizeIp: false,
  consentModeDefault: "granted",
  customHeadScripts: "",
  customConversionEvents: [
    {
      id: "evt-audit",
      name: "AI Visibility Audit Request",
      eventName: "generate_lead_audit",
      triggerSelector: "[data-modal-form]",
      enabled: true,
    },
    {
      id: "evt-strategy",
      name: "Strategy Call CTA Click",
      eventName: "cta_strategy_call",
      triggerSelector: "[data-cta]",
      enabled: true,
    },
    {
      id: "evt-contact",
      name: "Main Contact Form Submit",
      eventName: "generate_lead",
      triggerSelector: "#cta-form",
      enabled: true,
    },
  ],
};

export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  const custom = await getDbItem<AnalyticsSettings>("SITE#config", "ANALYTICS");
  if (custom) {
    const resolvedGaId = custom.gaMeasurementId || ENV_GA_ID;
    const resolvedGtmId = custom.gtmContainerId || ENV_GTM_ID;
    return {
      ...DEFAULT_ANALYTICS_SETTINGS,
      ...custom,
      gaEnabled: custom.gaEnabled ?? !!resolvedGaId,
      gaMeasurementId: resolvedGaId,
      gtmEnabled: custom.gtmEnabled ?? !!resolvedGtmId,
      gtmContainerId: resolvedGtmId,
    };
  }
  return DEFAULT_ANALYTICS_SETTINGS;
}

export async function saveAnalyticsSettings(settings: AnalyticsSettings): Promise<void> {
  await putDbItem("SITE#config", "ANALYTICS", settings);
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const custom = await getDbItem<HomepageContent>("PAGE#home", "CONTENT");
  if (custom && custom.hero && custom.hero.headline) {
    return custom;
  }
  return defaultHomepage as unknown as HomepageContent;
}

export async function saveHomepageContent(content: HomepageContent): Promise<void> {
  await putDbItem("PAGE#home", "CONTENT", content);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const custom = await getDbItem<SiteSettings>("SITE#config", "SETTINGS");
  if (custom && custom.name) {
    return custom;
  }
  return defaultSite as SiteSettings;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await putDbItem("SITE#config", "SETTINGS", settings);
}

// Re-export IA v2 data access methods
export {
  getPageByPath,
  getAllPages,
  savePage,
  getRedirect,
  getAllRedirects,
  saveRedirect,
  getNavigation,
  getPreviousNavigation,
  saveNavigation,
  saveNavigationWithBackup,
  restorePreviousNavigation,
  normalizePath,
};

export async function getPublishedPages(): Promise<PageRecordV2[]> {
  const all = await getAllPages();
  return all.filter((p) => p.published);
}

