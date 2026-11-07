import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/site/JsonLd";
import { getPageByPath, getRedirect, getSiteSettings, getAllPages } from "@/lib/content";
import { buildPageJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site-url";
import type { PageRecordV2 } from "@/lib/types";
import { generatePlaceholderSections } from "@/lib/placeholder-generator";
import { HeroSection } from "@/components/sections/HeroSection";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { getSessionUser } from "@/lib/auth";
import { getServicePageByPath } from "@/lib/service-pages";
import { buildServicePageMetadata, ServicePageView } from "@/lib/service-pages/ServicePageView";

export const dynamicParams = true;

const EXPLICIT_ROOTS = [
  "seo",
  "branding",
  "social-media",
  "content-marketing",
  "digital-marketing",
  "admin",
];

export async function generateStaticParams() {
  try {
    // Pre-generate parameters from the page store for fast build & ISR,
    // excluding dedicated routes that have their own App Router directory.
    const pages = await getAllPages();
    if (!Array.isArray(pages)) return [];
    return pages
      .filter((p) => p && typeof p.path === "string" && p.path.trim() !== "/" && p.path.trim().length > 0)
      .map((p) => {
        const clean = p.path.trim().replace(/^\/+|\/+$/g, "");
        return {
          segments: clean ? clean.split("/").filter(Boolean) : [],
        };
      })
      .filter((entry) => {
        if (!entry.segments.length) return false;
        return !EXPLICIT_ROOTS.includes(entry.segments[0]);
      });
  } catch (err) {
    console.warn("[generateStaticParams] Warning during build:", err);
    return [];
  }
}

interface PageProps {
  params: Promise<{ segments: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segments } = await params;
  if (segments.length > 0 && EXPLICIT_ROOTS.includes(segments[0])) {
    return {};
  }
  const rawPath = "/" + segments.join("/");

  // Check unified service-page templates first
  const spMeta = buildServicePageMetadata(rawPath);
  if (spMeta) {
    return spMeta;
  }

  // Check for redirect first
  const redirect = await getRedirect(rawPath);
  if (redirect) {
    return {};
  }

  const page = await getPageByPath(rawPath);
  if (!page || !page.published) {
    return {};
  }

  const canonicalUrl = page.seo?.canonicalPath
    ? absoluteUrl(page.seo.canonicalPath)
    : absoluteUrl(rawPath);

  let rawTitle = page.seo?.titleTag || `${page.h1} | Beetrix360`;
  // Ensure "Beetrix360" is not duplicated if both topic and brand suffix contain it
  if (rawTitle.endsWith(" | Beetrix360") && (rawTitle.match(/Beetrix360/g) || []).length > 1) {
    rawTitle = rawTitle.slice(0, -" | Beetrix360".length).trim();
  }
  const description = page.seo?.metaDescription || undefined;

  return {
    title: { absolute: rawTitle },
    ...(description ? { description } : {}),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: page.seo?.robots?.index ?? false,
      follow: page.seo?.robots?.follow ?? true,
    },
    openGraph: {
      title: page.seo?.openGraph?.title || rawTitle,
      ...(description ? { description: page.seo?.openGraph?.description || description } : {}),
      url: canonicalUrl,
      type: "website",
      siteName: "Beetrix360",
      images: page.seo?.openGraph?.imagePath
        ? [{ url: page.seo.openGraph.imagePath }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo?.twitter?.title || rawTitle,
      ...(description ? { description: page.seo?.twitter?.description || description } : {}),
    },
  };
}

export default async function CatchAllPage({ params }: PageProps) {
  const { segments } = await params;
  if (segments.length > 0 && EXPLICIT_ROOTS.includes(segments[0])) {
    notFound();
  }
  const rawPath = "/" + segments.join("/");

  // 0. If this path is one of the 127 service pages from Beetrix360-Service-Pages, render it directly
  if (getServicePageByPath(rawPath)) {
    return <ServicePageView path={rawPath} />;
  }

  // 1. Check for 301/308 redirect
  const redirect = await getRedirect(rawPath);
  if (redirect && redirect.to) {
    // Single-hop collapse protection
    let target = redirect.to;
    const seen = new Set<string>([rawPath]);
    while (target) {
      if (seen.has(target)) break; // Break cycle
      seen.add(target);
      const next = await getRedirect(target);
      if (next && next.to) {
        target = next.to;
      } else {
        break;
      }
    }
    permanentRedirect(target);
  }

  // 2. Fetch page record
  const page = await getPageByPath(rawPath);
  if (!page) {
    notFound();
  }

  // 3. Unpublished guard
  if (!page.published) {
    notFound();
  }

  const site = await getSiteSettings();
  const allPages = await getAllPages();
  const pageById = new Map<string, PageRecordV2>(allPages.map((p) => [p.id, p]));

  // 4. Construct breadcrumbs dynamically from parentId tree
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

  // 5. Query child pages from parentId in page store
  const childPages = allPages.filter(
    (p) => p.parentId === page.id && p.published
  );

  // 6. Build JSON-LD structured data graph
  const ldNodes = buildPageJsonLd(page, allPages);

  // Resolve sections: either stored sections or deterministic placeholder sections
  const sections =
    page.sections && page.sections.length > 0
      ? page.sections
      : generatePlaceholderSections(page, allPages);

  const heroSection = sections.find((s) => s.type === "hero");
  const heroTagline = heroSection?.content?.tagline || heroSection?.content?.description;

  const user = await getSessionUser();
  const isAdmin = !!user;

  return (
    <>
      <JsonLd data={ldNodes} />
      <div className="min-h-screen bg-bx-bg text-bx-dark selection:bg-bx-pink selection:text-white">
        <HeroSection
          h1={page.h1}
          badge={page.division || "Beetrix360"}
          tagline={heroTagline}
          crumbItems={crumbItems}
          contentStatus={page.contentStatus}
          isAdmin={isAdmin}
          primaryCta={heroSection?.content?.primaryCta}
          secondaryCta={heroSection?.content?.secondaryCta}
        />
        <SectionRenderer sections={sections} isAdmin={isAdmin} />
      </div>
    </>
  );
}
