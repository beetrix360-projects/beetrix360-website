import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, Layers } from "lucide-react";
import { Breadcrumbs } from "@/components/pages/InnerPage";
import { JsonLd } from "@/components/site/JsonLd";
import { getPageByPath, getRedirect, getSiteSettings, getAllPages } from "@/lib/content";
import { webPageSchema, breadcrumbSchema, itemListSchema, serviceSchema, faqSchema } from "@/lib/schema";
import { absoluteUrl, SITE_URL } from "@/lib/site-url";
import type { PageRecordV2 } from "@/lib/types";
import seedData from "@/content/ia-v2.seed.json";

export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-generate parameters from the seed for fast build & ISR
  return seedData.pages
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

  const title = page.seo?.titleTag || `${page.h1} | Beetrix360`;
  const description =
    page.seo?.metaDescription ||
    `${page.h1} - Measurable, full-funnel solutions engineered by Beetrix360.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: page.seo?.robots?.index ?? false,
      follow: page.seo?.robots?.follow ?? true,
    },
    openGraph: {
      title: page.seo?.openGraph?.title || title,
      description: page.seo?.openGraph?.description || description,
      url: canonicalUrl,
      type: "website",
      siteName: "Beetrix360",
      images: page.seo?.openGraph?.imagePath
        ? [{ url: page.seo.openGraph.imagePath }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo?.twitter?.title || title,
      description: page.seo?.twitter?.description || description,
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

  // 4. Construct breadcrumbs
  const crumbItems = [{ name: "Home", path: "/" }];
  const parts = segments;
  let accum = "";
  for (let i = 0; i < parts.length; i++) {
    accum += "/" + parts[i];
    if (i === parts.length - 1) {
      crumbItems.push({
        name: page.seo?.breadcrumbLabel || page.menuLabel || page.h1,
        path: accum,
      });
    } else {
      // Ancestor segment label
      const ancestor = seedData.pages.find((p) => p.path === accum);
      crumbItems.push({
        name: ancestor?.seo?.breadcrumbLabel || ancestor?.menuLabel || parts[i],
        path: accum,
      });
    }
  }

  // 5. Build JSON-LD structured data graph
  const ldNodes: any[] = [
    webPageSchema({
      path: page.path,
      name: page.h1,
      description:
        page.seo?.metaDescription || `${page.h1} solutions from Beetrix360.`,
    }),
    breadcrumbSchema(crumbItems),
  ];

  // If hub page, add ItemList of child pages
  const childPages = seedData.pages.filter(
    (p) => p.parentPath === page.path && p.path !== page.path
  );
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

  return (
    <>
      <JsonLd data={ldNodes} />
      <main className="min-h-screen bg-bx-bg text-bx-dark selection:bg-bx-pink selection:text-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 sm:pt-36 lg:pt-40 lg:pb-20 bg-grid overflow-hidden px-5 sm:px-8 lg:px-12 2xl:px-20 border-b border-neutral-100">
          <div
            className="absolute -top-24 right-[10%] w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none opacity-20 bg-bx-pink"
            aria-hidden="true"
          />
          <div className="relative w-full max-w-6xl mx-auto">
            <Breadcrumbs items={crumbItems} />

            <div className="mt-8 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-bx-pink/10 text-bx-pink border border-bx-pink/20">
                <Layers className="w-3.5 h-3.5" />
                {page.division || "Beetrix360"}
              </span>
              {page.contentStatus === "placeholder" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Placeholder Spec
                </span>
              )}
            </div>

            <h1 className="font-heading font-extrabold tracking-tight text-4xl sm:text-6xl lg:text-7xl leading-[1.05] mt-6 text-bx-dark">
              {page.h1}
            </h1>

            {page.targetKeyword && (
              <p className="mt-6 text-lg sm:text-xl text-neutral-600 max-w-3xl leading-relaxed">
                Engineered for high-intent visibility and revenue growth. Beetrix360 delivers complete, full-funnel execution for <strong>{page.targetKeyword}</strong>.
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/get-a-proposal"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-bx-pink text-white font-semibold text-sm hover:bg-bx-pink/90 transition shadow-sm"
              >
                Get a Proposal <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-neutral-800 border border-neutral-200 font-semibold text-sm hover:bg-neutral-50 transition"
              >
                Schedule Strategy Call
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic / Seed Sections */}
        {page.sections && page.sections.length > 0 ? (
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 2xl:px-20 py-16 space-y-16">
            {page.sections.map((sec) => (
              <section key={sec.id} className="py-6 border-b border-neutral-100 last:border-b-0">
                {sec.title && (
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4 text-bx-dark">
                    {sec.title}
                  </h2>
                )}
                {sec.content && (
                  <div className="prose prose-neutral max-w-none text-neutral-600">
                    {sec.content.description && <p>{sec.content.description}</p>}
                    {sec.content.items && Array.isArray(sec.content.items) && (
                      <ul className="grid sm:grid-cols-2 gap-3 mt-4 list-none p-0">
                        {sec.content.items.map((it: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                            <CheckCircle2 className="w-5 h-5 text-bx-pink shrink-0 mt-0.5" />
                            <span>{typeof it === "string" ? it : it.label || it.title}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          /* Default Placeholder Content Frame */
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 2xl:px-20 py-16">
            <div className="p-8 rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 text-center">
              <h2 className="text-xl font-heading font-bold text-neutral-800">
                Content Structure Defined
              </h2>
              <p className="mt-2 text-sm text-neutral-500 max-w-xl mx-auto">
                This page is indexed in the Beetrix360 IA v2 hierarchy as a <code>{page.pageType}</code> page under <code>{page.division}</code>. Detailed copy blocks will be generated and can be edited in Admin Studio.
              </p>
            </div>
          </div>
        )}

        {/* Child Cards (if any) */}
        {childPages.length > 0 && (
          <section className="bg-white py-16 px-5 sm:px-8 lg:px-12 2xl:px-20 border-t border-neutral-100">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-bx-dark mb-8">
                Explore {page.h1} Capabilities
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {childPages.map((child) => (
                  <Link
                    key={child.path}
                    href={child.path}
                    className="group block p-6 rounded-2xl border border-neutral-200 hover:border-bx-pink hover:shadow-md transition bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-medium text-bx-pink uppercase tracking-wider">
                        {child.pageType}
                      </span>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-bx-pink group-hover:translate-x-1 transition" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-bx-dark group-hover:text-bx-pink transition">
                      {child.h1}
                    </h3>
                    <p className="mt-2 text-xs text-neutral-500">
                      {child.targetKeyword}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
