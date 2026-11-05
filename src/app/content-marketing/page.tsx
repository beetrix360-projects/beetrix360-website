import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandSocialPageByPath } from "@/lib/brand-social/data";
import { page, schema } from "@/lib/brand-social/render";
import { BrandSocialClient } from "@/lib/brand-social/BrandSocialClient";
import { JsonLd } from "@/components/site/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const p = getBrandSocialPageByPath("/content-marketing");
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

export default function ContentMarketingHubPage() {
  const pageData = getBrandSocialPageByPath("/content-marketing");
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

