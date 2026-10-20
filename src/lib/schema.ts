import type { Division, FaqItem, Service, SiteSettings, SubService } from "./types";
import { absoluteUrl, SITE_URL } from "./site-url";

// schema.org structured data (JSON-LD). Only facts present in the supplied files are used.

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationSchema(site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    alternateName: site.formerName,
    url: SITE_URL,
    logo: absoluteUrl("/logo.svg"),
    description: site.description,
    foundingDate: String(site.foundingYear),
    telephone: site.phone.tel,
    contactPoint: { "@type": "ContactPoint", telephone: site.phone.tel, contactType: "sales" },
  };
}

export function websiteSchema(site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: SITE_URL,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function webPageSchema(opts: { path: string; name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(opts.path)}#webpage`,
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  keyword: string;
  path: string;
  division: Division;
  parent?: Service;
  children?: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(opts.path)}#service`,
    name: opts.name,
    serviceType: opts.keyword,
    url: absoluteUrl(opts.path),
    provider: { "@id": ORG_ID },
    category: opts.division.name,
    ...(opts.parent ? { isRelatedTo: { "@type": "Service", name: opts.parent.name, url: absoluteUrl(`/${opts.parent.slug}`) } } : {}),
    ...(opts.children?.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: opts.name,
            itemListElement: opts.children.map((c) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: c.name, url: absoluteUrl(c.path) },
            })),
          },
        }
      : {}),
  };
}

export function itemListSchema(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: absoluteUrl(it.path) })),
  };
}

/** Only emitted when real FAQ content exists (added later from the dashboard). */
export function faqSchema(faqs: FaqItem[] | undefined) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export type { SubService };
