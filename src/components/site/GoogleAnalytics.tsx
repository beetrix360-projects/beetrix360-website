"use client";

import React, { useEffect, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import type { AnalyticsSettings } from "@/lib/types";
import { trackAnalyticsEvent, trackPageView } from "@/lib/analytics-client";

interface Props {
  settings: AnalyticsSettings;
}

function PageViewTracker({ settings }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (!settings.trackPageViews) return;

    const activeGa = settings.gaEnabled && settings.gaMeasurementId.trim();
    const activeGtm = settings.gtmEnabled && settings.gtmContainerId.trim();
    if (!activeGa && !activeGtm) return;

    const query = searchParams?.toString();
    const fullUrl = query ? `${pathname}?${query}` : pathname;

    trackPageView(fullUrl, activeGa ? settings.gaMeasurementId.trim() : undefined);
  }, [pathname, searchParams, settings]);

  return null;
}

export function GoogleAnalyticsAndTagManager({ settings }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const gaId = settings.gaMeasurementId?.trim() || "";
  const gtmId = settings.gtmContainerId?.trim() || "";
  const shouldLoadGa = !isAdmin && settings.gaEnabled && gaId.length > 0;
  const shouldLoadGtm = !isAdmin && settings.gtmEnabled && gtmId.length > 0;

  // Bind global analytics config and automatic DOM event listeners
  useEffect(() => {
    if (isAdmin) return;

    window.__bxAnalyticsConfig = {
      gaEnabled: settings.gaEnabled,
      gaMeasurementId: gaId,
      gtmEnabled: settings.gtmEnabled,
      gtmContainerId: gtmId,
      trackPageViews: settings.trackPageViews,
      trackCtaClicks: settings.trackCtaClicks,
      trackFormSubmissions: settings.trackFormSubmissions,
      trackVideoPlays: settings.trackVideoPlays,
      trackRoiCalculator: settings.trackRoiCalculator,
      trackPhoneClicks: settings.trackPhoneClicks,
      trackOutboundLinks: settings.trackOutboundLinks,
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Track CTA modal triggers
      if (settings.trackCtaClicks) {
        const ctaEl = target.closest<HTMLElement>("[data-cta]");
        if (ctaEl) {
          trackAnalyticsEvent("cta_click", {
            cta_tag: ctaEl.dataset.cta || "unknown",
            cta_text: (ctaEl.textContent || "").trim().slice(0, 80),
          });
        }
      }

      // 2. Track Video Modal triggers
      if (settings.trackVideoPlays) {
        const videoEl = target.closest<HTMLElement>("[data-video]");
        if (videoEl) {
          trackAnalyticsEvent("video_play", {
            video_label: videoEl.dataset.video || "showreel",
          });
        }
      }

      // 3. Track Phone number clicks & Outbound links
      const linkEl = target.closest<HTMLAnchorElement>("a[href]");
      if (linkEl) {
        const href = linkEl.getAttribute("href") || "";
        if (settings.trackPhoneClicks && href.startsWith("tel:")) {
          trackAnalyticsEvent("phone_call_click", {
            phone_number: href.replace("tel:", ""),
          });
        } else if (
          settings.trackOutboundLinks &&
          (href.startsWith("http://") || href.startsWith("https://")) &&
          !href.includes(window.location.hostname)
        ) {
          trackAnalyticsEvent("outbound_click", {
            outbound_url: href,
            link_text: (linkEl.textContent || "").trim().slice(0, 80),
          });
        }
      }

      // 4. Track Custom Conversion Selectors configured in Admin Studio
      if (settings.customConversionEvents?.length) {
        for (const customEvt of settings.customConversionEvents) {
          if (!customEvt.enabled || !customEvt.triggerSelector || !customEvt.eventName) continue;
          try {
            const matched = target.closest(customEvt.triggerSelector);
            if (matched) {
              trackAnalyticsEvent(customEvt.eventName, {
                conversion_label: customEvt.name,
                trigger_selector: customEvt.triggerSelector,
              });
            }
          } catch {
            // Ignore invalid CSS selector
          }
        }
      }
    };

    const handleFormSubmit = (e: SubmitEvent) => {
      if (!settings.trackFormSubmissions) return;
      const form = e.target as HTMLFormElement | null;
      if (!form) return;

      if (form.matches("[data-modal-form]")) {
        const input = form.querySelector("input") as HTMLInputElement | null;
        trackAnalyticsEvent("audit_domain_submit", {
          modal_tag: form.dataset.modalForm || "Audit Request",
          submitted_domain: input?.value?.trim() || "",
        });
      } else if (form.id === "cta-form") {
        const goalInput = form.querySelector<HTMLInputElement>('input[name="goal"]:checked');
        const budgetSelect = form.querySelector<HTMLSelectElement>('select[name="budget"]');
        trackAnalyticsEvent("generate_lead", {
          form_id: "cta-form",
          form_name: "Homepage Contact Section",
          selected_goal: goalInput?.value || "",
          selected_budget: budgetSelect?.value || "",
        });
      } else {
        trackAnalyticsEvent("generate_lead", {
          form_id: form.id || "modal_lead_form",
          form_name: "Lead Request Modal",
        });
      }
    };

    // 5. Track ROI Calculator Interaction (debounced on change)
    const handleRangeChange = (e: Event) => {
      if (!settings.trackRoiCalculator) return;
      const input = e.target as HTMLInputElement | null;
      if (!input || !["r-team", "r-share", "r-cost"].includes(input.id)) return;
      trackAnalyticsEvent("roi_calculator_interaction", {
        slider_id: input.id,
        slider_value: Number(input.value),
      });
    };

    document.addEventListener("click", handleDocumentClick, { passive: true });
    document.addEventListener("submit", handleFormSubmit, { passive: true });
    document.addEventListener("change", handleRangeChange, { passive: true });

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("submit", handleFormSubmit);
      document.removeEventListener("change", handleRangeChange);
    };
  }, [isAdmin, settings, gaId, gtmId]);

  if (isAdmin) return null;

  return (
    <>
      {/* Initialize dataLayer & Google Consent Mode v2 */}
      {(shouldLoadGa || shouldLoadGtm) && (
        <Script
          id="google-consent-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('consent', 'default', {
                'ad_storage': '${settings.consentModeDefault}',
                'ad_user_data': '${settings.consentModeDefault}',
                'ad_personalization': '${settings.consentModeDefault}',
                'analytics_storage': '${settings.consentModeDefault}'
              });
            `,
          }}
        />
      )}

      {/* Google Tag Manager (GTM) */}
      {shouldLoadGtm && (
        <>
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 (gtag.js) */}
      {shouldLoadGa && (
        <>
          <Script
            id="google-analytics-js"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="google-analytics-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = window.gtag || gtag;
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: ${settings.anonymizeIp ? "true" : "false"}
                });
              `,
            }}
          />
        </>
      )}

      <Suspense fallback={null}>
        <PageViewTracker settings={settings} />
      </Suspense>
    </>
  );
}

