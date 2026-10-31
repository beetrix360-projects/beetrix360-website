import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/site/JsonLd";
import { getPageByPath, getRedirect, getSiteSettings, getAllPages } from "@/lib/content";
import { webPageSchema, breadcrumbSchema, itemListSchema, serviceSchema } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site-url";
import type { PageRecordV2 } from "@/lib/types";
import { generatePlaceholderSections } from "@/lib/placeholder-generator";
import { HeroSection } from "@/components/sections/HeroSection";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-generate parameters from the page store for fast build & ISR
  const pages = await getAllPages();
  return pages
    .filter((p) => p.path !== "/")
    .map((p) => ({
      segments: p.path.replace(/^\//, "").split("/"),
    }));
}

interface PageProps {
  params: Promise<{ segments: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segments } = await params;
  const rawPath = "/" + segments.join("/");

  // Check for redirect first
  const redirect = await getRedirect(rawPath);
  if (redirect) {
    return {};
  }

  const page = await getPageByPath(rawPath);
  if (!page) {
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
  const rawPath = "/" + segments.join("/");

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
  const ldNodes: any[] = [
    webPageSchema({
      path: page.path,
      name: page.h1,
      description: page.seo?.metaDescription || (undefined as any),
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

  // Service schema strictly emitted only when contentStatus is ready
  if (
    page.contentStatus === "ready" &&
    (page.pageType === "service" ||
      page.pageType === "sub" ||
      page.pageType === "platform")
  ) {
    ldNodes.push(
      serviceSchema({
        name: page.h1,
        keyword: page.targetKeyword,
        path: page.path,
        division: { name: page.division, slug: page.slug, services: [] },
      })
    );
  }

  // Resolve sections: either stored sections or deterministic placeholder sections
  const sections =
    page.sections && page.sections.length > 0
      ? page.sections
      : generatePlaceholderSections(page, allPages);

  const heroSection = sections.find((s) => s.type === "hero");
  const heroTagline = heroSection?.content?.tagline || heroSection?.content?.description;

  return (
    <>
      <JsonLd data={ldNodes} />
      <main className="min-h-screen bg-bx-bg text-bx-dark selection:bg-bx-pink selection:text-white">
        <HeroSection
          h1={page.h1}
          badge={page.division || "Beetrix360"}
          tagline={heroTagline}
          crumbItems={crumbItems}
          contentStatus={page.contentStatus}
          primaryCta={heroSection?.content?.primaryCta}
          secondaryCta={heroSection?.content?.secondaryCta}
        />
        <SectionRenderer sections={sections} />
      </main>
    </>
  );
}
