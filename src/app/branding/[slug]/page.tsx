import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandSocialPageByPath, getBrandSocialSlugs } from "@/lib/brand-social/data";
import { page, schema } from "@/lib/brand-social/render";
import { BrandSocialClient } from "@/lib/brand-social/BrandSocialClient";
import { JsonLd } from "@/components/site/JsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getBrandSocialSlugs("/branding");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = getBrandSocialPageByPath(`/branding/${slug}`);
  if (!p) return {};

  return {
    title: p.title,
    description: p.desc,
    keywords: p.kws,
    alternates: {
      canonical: p.path,
    },
    openGraph: {
      title: p.title,
      description: p.desc,
      url: `https://www.beetrix360.com${p.path}`,
      type: "website",
      siteName: "Beetrix360",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.desc,
    },
  };
}

export default async function BrandingSubPage({ params }: PageProps) {
  const { slug } = await params;
  const pageData = getBrandSocialPageByPath(`/branding/${slug}`);

  if (!pageData) {
    notFound();
  }

  const htmlContent = page(pageData);
  const jsonLd = schema(pageData);

  return (
    <>
      <JsonLd data={jsonLd} />
      <BrandSocialClient pageData={pageData} htmlContent={htmlContent} />
    </>
  );
}

