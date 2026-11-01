import type { Division, FaqItem, PageRecordV2, Service, SiteSettings, SubService } from "./types";
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
  description?: string;
  division?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(opts.path)}#service`,
    name: opts.name,
    description: opts.description || "",
    serviceType: opts.keyword,
    url: absoluteUrl(opts.path),
    provider: { "@id": ORG_ID },
    ...(opts.division ? { category: opts.division } : {}),
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

/**
 * Only emitted when real FAQ content exists (no placeholders, no brackets).
 */
export function faqSchema(faqs: FaqItem[] | undefined) {
  if (!faqs?.length) return null;
  const validFaqs = faqs.filter(
    (f) =>
      typeof f.question === "string" &&
      typeof f.answer === "string" &&
      !f.question.includes("[") &&
      !f.question.includes("]") &&
      !f.answer.includes("[") &&
      !f.answer.includes("]") &&
      f.answer.trim().length > 0
  );
  if (!validFaqs.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/**
 * Builds the exact JSON-LD array for a given page and allPages list.
 * Identical output between public rendering and the admin SEO inspector.
 */
export function buildPageJsonLd(page: PageRecordV2, allPages: PageRecordV2[]): any[] {
  const pageById = new Map<string, PageRecordV2>(allPages.map((p) => [p.id, p]));

  // Construct breadcrumbs dynamically from parentId tree
  const chain: PageRecordV2[] = [page];
  let curr = page;
  while (curr.parentId) {
    const parent = pageById.get(curr.parentId);
    if (!parent || parent.path === "/") break;
    chain.unshift(parent);
    curr = parent;
  }
  const crumbItems = [
    { name: "Home", path: "/" },
    ...chain.map((p) => ({
      name: p.seo?.breadcrumbLabel || p.menuLabel || p.h1,
      path: p.path,
    })),
  ];

  // Query child pages
  const childPages = allPages.filter((p) => p.parentId === page.id && p.published);

  const ldNodes: any[] = [
    webPageSchema({
      path: page.path,
      name: page.h1,
      description: page.seo?.metaDescription || "",
    }),
    breadcrumbSchema(crumbItems),
  ];

  // If hub page with child pages, emit ItemList
  if (childPages.length > 0) {
    ldNodes.push(
      itemListSchema(
        page.h1,
        childPages.map((c) => ({ name: c.h1, path: c.path }))
      )
    );
  }

  // Service schema emitted on service, sub, and platform pages with name, description, provider (from site.json)
  if (
    page.pageType === "service" ||
    page.pageType === "sub" ||
    page.pageType === "platform"
  ) {
    ldNodes.push(
      serviceSchema({
        name: page.h1,
        keyword: page.targetKeyword,
        path: page.path,
        description: page.seo?.metaDescription || "",
        division: page.division,
      })
    );
  }

  // FAQ Schema if present with valid answers (no brackets)
  const faqSection = (page.sections || []).find((s) => s.type === "faq");
  if (faqSection?.content?.items) {
    const faqData = faqSchema(faqSection.content.items);
    if (faqData) ldNodes.push(faqData);
  }

  // Custom JSON-LD if provided and valid JSON
  if (page.seo?.customJsonLd?.trim()) {
    try {
      const parsed = JSON.parse(page.seo.customJsonLd.trim());
      ldNodes.push(parsed);
    } catch {
      // Ignored for invalid json in compilation
    }
  }

  return ldNodes;
}

export type { SubService };
