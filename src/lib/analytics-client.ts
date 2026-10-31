"use client";

export interface AnalyticsEventPayload {
  [key: string]: string | number | boolean | undefined | null;
}

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
    gtag?: (...args: any[]) => void;
    __bxAnalyticsConfig?: {
      gaEnabled: boolean;
      gaMeasurementId: string;
      gtmEnabled: boolean;
      gtmContainerId: string;
      trackPageViews: boolean;
      trackCtaClicks: boolean;
      trackFormSubmissions: boolean;
      trackVideoPlays: boolean;
      trackRoiCalculator: boolean;
      trackPhoneClicks: boolean;
      trackOutboundLinks: boolean;
    };
  }
}

/**
 * Push a structured event to the Google Tag Manager dataLayer and Google Analytics 4 gtag().
 */
export function trackAnalyticsEvent(eventName: string, params: AnalyticsEventPayload = {}) {
  if (typeof window === "undefined") return;

  const cleanParams: Record<string, any> = {
    ...params,
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
  };

  // Push to GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...cleanParams,
  });

  // Also invoke gtag directly if GA4 standalone is loaded
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, cleanParams);
  }
}

/**
 * Track virtual pageviews during Next.js App Router client-side navigations.
 */
export function trackPageView(url: string, gaMeasurementId?: string) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "page_view",
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  });

  if (typeof window.gtag === "function" && gaMeasurementId) {
    window.gtag("config", gaMeasurementId, {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

